import {FanOut} from 'thingies/lib/fanout';
import {NodeType, UserPresenceIdx} from './constants';
import * as id from './id';
import {ResolvedSelection} from './ResolvedSelection';
import type {JsonCrdtSelection, PresenceIdShorthand, RgaSelection, UserPresence} from './types';
import type {Model} from 'json-joy/lib/json-crdt';
import type {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import type {ITimestampStruct} from 'json-joy/lib/json-crdt-patch';

export class PresenceEvent {
  constructor(
    public readonly added: string[],
    public readonly updated: string[],
    public readonly removed: string[],
  ) {}
}

export type PeerEntry<Meta extends object = object> = [presence: UserPresence<Meta>, receivedAt: number];

export interface PresenceManagerOpts {
  /** Milliseconds after which peers are considered stale. Default 30000. */
  timeout?: number;
  /** Heartbeat interval in ms — presence is pushed at least this often. Default 5000. */
  heartbeat?: number;
  /** Minimum ms between pushes triggered by local changes (throttle). Default 50. */
  throttle?: number;
  /** GC interval in ms for removing outdated peers. Default 5000. Pass 0 to disable. */
  gcInterval?: number;
}

/**
 * Reactive in-memory presence store. Tracks remote peer states keyed by
 * `processId`. LWW by `seq` — stale updates are silently ignored.
 *
 * When {@link start} is called, the manager runs internal timers for heartbeat
 * pushes and peer GC. Call {@link stop} (or {@link destroy}) to tear down.
 */
export class PresenceManager<Meta extends object = object> {
  public peers: Record<string, PeerEntry<Meta>> = {};
  public local: UserPresence;
  public readonly onChange: FanOut<PresenceEvent> = new FanOut<PresenceEvent>();

  /** Called by the manager when local presence should be sent to the server. */
  public onpush: ((data: UserPresence) => void) | undefined;

  public readonly timeout: number;
  public readonly heartbeat: number;
  public readonly throttleMs: number;
  public readonly gcInterval: number;

  private _heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  private _gcTimer: ReturnType<typeof setInterval> | undefined;
  private _throttleTimer: ReturnType<typeof setTimeout> | undefined;
  private _pushedSeq: number = -1;
  private _started = false;

  constructor(opts?: PresenceManagerOpts | number) {
    const o: PresenceManagerOpts = typeof opts === 'number' ? {timeout: opts} : (opts ?? {});
    this.timeout = o.timeout ?? 30_000;
    this.heartbeat = o.heartbeat ?? 5_000;
    this.throttleMs = o.throttle ?? 50;
    this.gcInterval = o.gcInterval ?? 5_000;
    this.local = ['', Math.random().toString(36).slice(2), 0, Math.floor(Date.now() / 1000), [], {} as Meta];
  }

  // ---------------------------------------------------------------- lifecycle

  /** Start heartbeat and GC timers. Safe to call multiple times. */
  start(): void {
    if (this._started) return;
    this._started = true;
    this._push();
    this._heartbeatTimer = setInterval(() => this._push(), this.heartbeat);
    if (this.gcInterval > 0) {
      this._gcTimer = setInterval(() => this.removeOutdated(), this.gcInterval);
    }
  }

  /** Stop timers. Does NOT destroy peer state. */
  stop(): void {
    if (!this._started) return;
    this._started = false;
    clearInterval(this._heartbeatTimer);
    clearInterval(this._gcTimer);
    clearTimeout(this._throttleTimer);
    this._heartbeatTimer = undefined;
    this._gcTimer = undefined;
    this._throttleTimer = undefined;
  }

  // ---------------------------------------------------------- remote presence

  /** LWW by `seq` per `processId` — stale updates are silently ignored. */
  receive(incoming: UserPresence<Meta>): void {
    const processId: string = incoming[UserPresenceIdx.ProcessId];
    const incomingSeq: number = incoming[UserPresenceIdx.Seq];
    const existing = this.peers[processId];
    if (existing && existing[0][UserPresenceIdx.Seq] >= incomingSeq) return;
    this.peers[processId] = [incoming, Date.now()];
    this.onChange.emit(new PresenceEvent(existing ? [] : [processId], existing ? [processId] : [], []));
  }

  get(processId: string): UserPresence<Meta> | undefined {
    return this.peers[processId]?.[0];
  }

  size(): number {
    return Object.keys(this.peers).length;
  }

  /** Remove peers whose `receivedAt` exceeds `timeout`. */
  removeOutdated(timeout: number = this.timeout): string[] {
    const now = Date.now();
    const removed: string[] = [];
    const peers = this.peers;
    for (const processId in peers) {
      if (now - peers[processId][1] > timeout) {
        delete peers[processId];
        removed.push(processId);
      }
    }
    if (removed.length) this.onChange.emit(new PresenceEvent([], [], removed));
    return removed;
  }

  merge(snapshot: UserPresence<Meta>[]): void {
    for (const incoming of snapshot) this.receive(incoming);
  }

  remove(processId: string): boolean {
    if (!(processId in this.peers)) return false;
    delete this.peers[processId];
    this.onChange.emit(new PresenceEvent([], [], [processId]));
    return true;
  }

  destroy(): void {
    this.stop();
    const removed = Object.keys(this.peers);
    this.peers = {};
    this._resolved.clear();
    if (removed.length) this.onChange.emit(new PresenceEvent([], [], removed));
  }

  // --------------------------------------------------------------- resolution

  /**
   * Per-slot resolution state, keyed by `${processId}\0${documentId}\0${uiLocationId}`.
   * Survives across `resolve()` calls.
   */
  private _resolved: Map<string, ResolvedSelection> = new Map();

  /**
   * Reconcile remote presence against the given `model`. For every peer whose
   * selection targets `documentId`, the manager:
   *
   *   1. Updates `desired` if the incoming presence is newer than what we
   *      previously processed for this `(peer, documentId, uiLocationId)`
   *      (LWW by `peer.seq`).
   *   2. Attempts to resolve `desired` against `model`. On success the
   *      selection is promoted to `displayed` and `desired` is cleared.
   *      On failure (anchor characters not yet received) `desired` stays
   *      pending and `displayed` continues to be the source of truth for
   *      rendering.
   *
   * This method *mutates* the manager's internal resolver state and returns
   * a grouping of the current resolved selections by `processId`. Editors
   * should read only `displayed` to render — `desired` is internal bookkeeping.
   *
   * The integration must invoke `resolve()` both when remote presence arrives
   * and when the model changes.
   */
  public resolve(documentId: string, model: Model<any>): Map<string, ResolvedSelection[]> {
    const localProcessId = this.local[UserPresenceIdx.ProcessId] as string;
    const resolved = this._resolved;
    const out = new Map<string, ResolvedSelection[]>();
    for (const processId in this.peers) {
      if (processId === localProcessId) continue;
      const entry = this.peers[processId];
      const presence = entry[0];
      const peerSeq = presence[UserPresenceIdx.Seq] as number;
      const selections = presence[UserPresenceIdx.Selections] as JsonCrdtSelection[] | undefined;
      if (!selections || !selections.length) continue;
      let bucket: ResolvedSelection[] | undefined;
      for (const sel of selections) {
        if (sel[0] !== documentId) continue;
        const uiLocationId = sel[1] as string;
        const key = `${processId}\0${documentId}\0${uiLocationId}`;
        let rs = resolved.get(key);
        if (!rs) {
          rs = new ResolvedSelection();
          resolved.set(key, rs);
        }
        // LWW: only accept this incoming sel as `desired` if newer than what
        // we previously processed for this slot pair.
        if (peerSeq > rs.seq) {
          rs.desired = sel;
          rs.seq = peerSeq;
        }
        if (rs.desired && this._canResolve(rs.desired, model)) {
          rs.displayed = rs.desired;
          rs.desired = null;
        }
        if (!bucket) {
          bucket = [];
          out.set(processId, bucket);
        }
        bucket.push(rs);
      }
    }
    const peers = this.peers;
    for (const key of resolved.keys()) {
      const sep = key.indexOf('\0');
      const processId = key.slice(0, sep);
      if (!(processId in peers)) resolved.delete(key);
    }
    return out;
  }

  /**
   * Returns `true` when the selection's node and all anchor IDs exist in the
   * model — i.e. the local replica has received the characters the cursor
   * points at. RGA selections (`str`, `bin`, `arr`) additionally check each
   * anchor/focus point via `findById`.
   */
  private _canResolve(sel: JsonCrdtSelection, model: Model<any>): boolean {
    const senderSid = sel[2] as number;
    const nodeIdDto = sel[6] as PresenceIdShorthand;
    const nodeId: ITimestampStruct = id.fromDto(senderSid, nodeIdDto);
    const node = model.index.get(nodeId);
    if (!node) return false;
    const type = sel[5] as JsonCrdtDataType;
    if (type === NodeType.str || type === NodeType.bin || type === NodeType.arr) {
      const cursors = (sel as RgaSelection)[7];
      if (!cursors) return true;
      const rga = node as unknown as {findById: (ts: ITimestampStruct) => unknown};
      if (typeof rga.findById !== 'function') return true;
      const strNodeId = node.id;
      for (const cursor of cursors) {
        for (const point of cursor) {
          if (!point) continue;
          const pointId = id.fromDto(senderSid, point[0]);
          if (pointId.sid === strNodeId.sid && pointId.time === strNodeId.time) continue;
          if (!rga.findById(pointId)) return false;
        }
      }
    }
    return true;
  }

  public clearResolved(): void {
    this._resolved.clear();
  }

  // ----------------------------------------------------------- local presence

  setUserId(userId: string): void {
    this.local[UserPresenceIdx.UserId] = userId;
  }

  getUserId(): string {
    return this.local[UserPresenceIdx.UserId];
  }

  setProcessId(processId: string): void {
    this.local[UserPresenceIdx.ProcessId] = processId;
  }

  getProcessId(): string {
    return this.local[UserPresenceIdx.ProcessId];
  }

  setMeta(meta: Meta): void {
    this.local[UserPresenceIdx.Meta] = meta;
    this._schedulePush();
  }

  getMeta(): Meta {
    return this.local[UserPresenceIdx.Meta] as Meta;
  }

  setSelections(selections: JsonCrdtSelection[]): void {
    this.local[UserPresenceIdx.Seq]++;
    this.local[UserPresenceIdx.Ts] = Math.floor(Date.now() / 1000);
    this.local[UserPresenceIdx.Selections] = selections;
    this._schedulePush();
  }

  getSelections(): JsonCrdtSelection[] {
    return (this.local[UserPresenceIdx.Selections] as JsonCrdtSelection[]) || [];
  }

  clearSelections(): void {
    this.setSelections([]);
  }

  // --------------------------------------------------------------------- push

  /**
   * Push local presence immediately if it has changed since the last push,
   * or unconditionally when `force` is true (used by heartbeat).
   */
  private _push(force?: boolean): void {
    const seq = this.local[UserPresenceIdx.Seq] as number;
    if (!force && seq === this._pushedSeq) return;
    this._pushedSeq = seq;
    this.onpush?.(this.local);
  }

  /** Schedule a throttled push (coalesces rapid local changes). */
  private _schedulePush(): void {
    if (!this._started || this._throttleTimer) return;
    this._throttleTimer = setTimeout(() => {
      this._throttleTimer = undefined;
      this._push();
    }, this.throttleMs);
  }
}
