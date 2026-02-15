import {FanOut} from 'thingies/lib/fanout';
import {UserPresenceIdx} from './constants';
import type {UserPresence} from './types';

export class PresenceEvent {
  constructor(
    public readonly added: string[],
    public readonly updated: string[],
    public readonly removed: string[],
  ) {}
}

export type PeerEntry<Meta extends object = object> = [
  presence: UserPresence<Meta>,
  receivedAt: number,
];

/**
 * Reactive in-memory presence store. Tracks remote peer states keyed by
 * `processId`. LWW by `seq` — stale updates are silently ignored. No internal
 * timers; the caller controls GC via {@link removeOutdated}.
 */
export class PresenceManager<Meta extends object = object> {
  public peers: Record<string, PeerEntry<Meta>> = {};
  public readonly onChange: FanOut<PresenceEvent> = new FanOut<PresenceEvent>();

  constructor(public readonly timeout: number = 30_000) {}

  /** LWW by `seq` per `processId` — stale updates are silently ignored. */
  receive(incoming: UserPresence<Meta>): void {
    const processId: string = incoming[UserPresenceIdx.ProcessId];
    const incomingSeq: number = incoming[UserPresenceIdx.Seq];
    const existing = this.peers[processId];
    if (existing && existing[0][UserPresenceIdx.Seq] >= incomingSeq) return;
    this.peers[processId] = [incoming, Date.now()];
    this.onChange.emit(new PresenceEvent(
      existing ? [] : [processId],
      existing ? [processId] : [],
      [],
    ));
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
}
