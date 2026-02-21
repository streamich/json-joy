import {FanOut} from 'thingies/lib/fanout';
import {UserPresenceIdx} from './constants';
import type {JsonCrdtSelection, UserPresence} from './types';

export class PresenceEvent {
  constructor(
    public readonly added: string[],
    public readonly updated: string[],
    public readonly removed: string[],
  ) {}
}

export type PeerEntry<Meta extends object = object> = [presence: UserPresence<Meta>, receivedAt: number];

/**
 * Reactive in-memory presence store. Tracks remote peer states keyed by
 * `processId`. LWW by `seq` — stale updates are silently ignored. No internal
 * timers; the caller controls GC via {@link removeOutdated}.
 */
export class PresenceManager<Meta extends object = object> {
  public peers: Record<string, PeerEntry<Meta>> = {};
  public local: UserPresence;
  public readonly onChange: FanOut<PresenceEvent> = new FanOut<PresenceEvent>();

  constructor(public readonly timeout: number = 30_000) {
    this.local = ['', Math.random().toString(36).slice(2), 0, Math.floor(Date.now() / 1000), [], {} as Meta];
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
    const removed = Object.keys(this.peers);
    this.peers = {};
    if (removed.length) this.onChange.emit(new PresenceEvent([], [], removed));
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
  }

  getMeta(): Meta {
    return this.local[UserPresenceIdx.Meta] as Meta;
  }

  setSelections(selections: JsonCrdtSelection[]): void {
    this.local[UserPresenceIdx.Seq]++;
    this.local[UserPresenceIdx.Ts] = Math.floor(Date.now() / 1000);
    this.local[UserPresenceIdx.Selections] = selections;
  }

  getSelections(): JsonCrdtSelection[] {
    return (this.local[UserPresenceIdx.Selections] as JsonCrdtSelection[]) || [];
  }

  clearSelections(): void {
    this.setSelections([]);
  }
}
