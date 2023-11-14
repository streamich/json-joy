import {Observable, Observer} from 'rxjs';
import {TPresenceEntry} from '../routes/presence/schema';

export type PresenceRoom = Map<string, TPresenceEntry>;

export class PresenceService {
  private readonly rooms = new Map<string, PresenceRoom>();
  private readonly observers = new Map<string, Observer<TPresenceEntry[]>[]>();

  public async update(roomId: string, entryId: string, ttl: number, data: Record<string, unknown>): Promise<TPresenceEntry> {
    const now = Date.now();
    const room = this.getRoom(roomId);
    if (!data || typeof data !== 'object') throw new Error('ROOM_ENTRY_MUST_BE_OBJECT');
    let entry: TPresenceEntry = room.get(entryId) ?? {
      id: entryId,
      lastSeen: now,
      validUntil: now + ttl,
      data: {},
    };
    entry.lastSeen = now;
    entry.validUntil = now + ttl;
    Object.assign(entry.data, data);
    room.set(entryId, entry);
    this.cleanUpRoom(roomId);
    await new Promise((resolve) => setImmediate(resolve));
    const observers = this.observers.get(roomId);
    if (observers) for (const observer of observers) observer.next([entry]);
    return entry;
  }

  public listen$(roomId: string): Observable<TPresenceEntry[]> {
    return new Observable<TPresenceEntry[]>((observer) => {
      this.cleanUpRoom(roomId);
      if (!this.observers.has(roomId)) this.observers.set(roomId, []);
      this.observers.get(roomId)!.push(observer);
      return () => {
        const observers: Observer<TPresenceEntry[]>[] = this.observers.get(roomId)!;
        if (!observers) {
          this.cleanUpRoom(roomId);
          return;
        }
        const index = observers.findIndex((o) => o === observer);
        if (index > -1) observers.splice(index, 1);
        if (!observers.length) {
          this.observers.delete(roomId);
        }
      };
    });
  }

  private getRoom(roomId: string): PresenceRoom {
    const room = this.rooms.get(roomId);
    if (room) return room;
    const newRoom = new Map<string, TPresenceEntry>();
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  private cleanUpRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const now = Date.now();
    for (const [entry, presence] of room.entries()) {
      if (presence.validUntil < now) room.delete(entry);
    }
    if (!room.size) this.rooms.delete(roomId);
  }
}
