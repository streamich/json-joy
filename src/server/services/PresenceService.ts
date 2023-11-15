import {Observable, Observer} from 'rxjs';
import {TPresenceEntry} from '../routes/presence/schema';

export type PresenceRoom = Map<string, TPresenceEntry>;

export class PresenceService {
  private readonly rooms = new Map<string, PresenceRoom>();
  private readonly observers = new Map<string, Observer<TPresenceEntry[]>[]>();

  public async update(roomId: string, entryId: string, ttl: number, data: unknown): Promise<TPresenceEntry> {
    const now = Date.now();
    const room = this.getRoom(roomId);
    if (!data || typeof data !== 'object') throw new Error('ROOM_ENTRY_MUST_BE_OBJECT');
    const entry: TPresenceEntry = room.get(entryId) ?? {
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

  public async remove(roomId: string, entryId: string): Promise<void> {
    const room = this.getRoom(roomId);
    room.delete(entryId);
    if (!room.size) this.rooms.delete(roomId);
    await new Promise((resolve) => setImmediate(resolve));
    const observers = this.observers.get(roomId);
    if (observers)
      for (const observer of observers)
        observer.next([
          {
            id: entryId,
            lastSeen: Date.now(),
            validUntil: 0,
            data: {},
          },
        ]);
  }

  public listen$(roomId: string): Observable<TPresenceEntry[]> {
    return new Observable<TPresenceEntry[]>((observer) => {
      this.cleanUpRoom(roomId);
      if (!this.observers.has(roomId)) this.observers.set(roomId, []);
      this.observers.get(roomId)!.push(observer);
      const room = this.getRoom(roomId);
      const entries: TPresenceEntry[] = [];
      for (const entry of room.values()) {
        entries.push(entry);
        if (entries.length === 100) break;
      }
      if (entries.length) observer.next(entries);
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

  public stats(): {rooms: number; entries: number; observers: number} {
    return {
      rooms: this.rooms.size,
      entries: [...this.rooms.values()].reduce((acc, v) => acc + v.size, 0),
      observers: [...this.observers.values()].reduce((acc, v) => acc + v.length, 0),
    };
  }
}
