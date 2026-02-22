import {PresenceManager, PresenceEvent} from '../PresenceManager';
import type {UserPresence, JsonCrdtSelection} from '../types';

const mkPresence = <Meta extends object = object>(
  userId: string,
  processId: string,
  seq: number,
  selections: JsonCrdtSelection[] = [],
  meta: Meta = {} as Meta,
  ts: number = Date.now() / 1000,
): UserPresence<Meta> => [userId, processId, seq, ts, selections, meta] as any;

describe('PresenceManager', () => {
  describe('constructor', () => {
    test('initialises with no peers', () => {
      const pm = new PresenceManager();
      expect(pm.size()).toBe(0);
      expect(pm.peers).toEqual({});
    });

    test('uses default timeout of 30 000 ms', () => {
      const pm = new PresenceManager();
      expect(pm.timeout).toBe(30_000);
    });

    test('accepts custom timeout', () => {
      const pm = new PresenceManager(5000);
      expect(pm.timeout).toBe(5000);
    });
  });

  describe('PresenceEvent', () => {
    test('is a class instance', () => {
      const e = new PresenceEvent(['a'], ['b'], ['c']);
      expect(e).toBeInstanceOf(PresenceEvent);
      expect(e.added).toEqual(['a']);
      expect(e.updated).toEqual(['b']);
      expect(e.removed).toEqual(['c']);
    });

    test('emitted events are PresenceEvent instances', () => {
      const pm = new PresenceManager();
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.receive(mkPresence('user2', 'tab-2', 1));
      expect(events[0]).toBeInstanceOf(PresenceEvent);
    });
  });

  describe('receive', () => {
    test('adds a new remote peer', () => {
      const pm = new PresenceManager();
      const remote = mkPresence('user2', 'tab-2', 1);
      pm.receive(remote);
      expect(pm.size()).toBe(1);
      expect(pm.get('tab-2')).toBe(remote);
    });

    test('emits "added" for a new peer', () => {
      const pm = new PresenceManager();
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.receive(mkPresence('user2', 'tab-2', 1));
      expect(events[0].added).toEqual(['tab-2']);
    });

    test('updates existing peer with higher seq', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 1));
      const updated = mkPresence('user2', 'tab-2', 2);
      pm.receive(updated);
      expect(pm.get('tab-2')).toBe(updated);
    });

    test('emits "updated" when seq is higher', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 1));
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.receive(mkPresence('user2', 'tab-2', 2));
      expect(events[0].updated).toEqual(['tab-2']);
      expect(events[0].added).toEqual([]);
    });

    test('ignores stale update (lower seq)', () => {
      const pm = new PresenceManager();
      const fresh = mkPresence('user2', 'tab-2', 5);
      pm.receive(fresh);
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.receive(mkPresence('user2', 'tab-2', 3));
      expect(events).toHaveLength(0);
      expect(pm.get('tab-2')).toBe(fresh);
    });

    test('ignores stale update (equal seq)', () => {
      const pm = new PresenceManager();
      const first = mkPresence('user2', 'tab-2', 5);
      pm.receive(first);
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.receive(mkPresence('user2', 'tab-2', 5));
      expect(events).toHaveLength(0);
      expect(pm.get('tab-2')).toBe(first);
    });

    test('tracks multiple peers', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 1));
      pm.receive(mkPresence('user3', 'tab-3', 1));
      pm.receive(mkPresence('user4', 'tab-4', 1));
      expect(pm.size()).toBe(3);
      expect(Object.keys(pm.peers).sort()).toEqual(['tab-2', 'tab-3', 'tab-4']);
    });
  });

  describe('get', () => {
    test('returns undefined for unknown processId', () => {
      const pm = new PresenceManager();
      expect(pm.get('unknown')).toBeUndefined();
    });

    test('returns presence for known processId', () => {
      const pm = new PresenceManager();
      const p = mkPresence('user2', 'tab-2', 1);
      pm.receive(p);
      expect(pm.get('tab-2')).toBe(p);
    });
  });

  describe('peers record', () => {
    test('exposes entries directly', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 1));
      pm.receive(mkPresence('user3', 'tab-3', 1));
      expect(pm.peers['tab-2']).toBeDefined();
      expect(pm.peers['tab-3']).toBeDefined();
      expect(pm.peers['tab-2'][0][0]).toBe('user2');
    });
  });

  describe('removeOutdated', () => {
    test('removes stale peers beyond timeout', () => {
      const pm = new PresenceManager(100);
      pm.receive(mkPresence('user2', 'tab-2', 1));
      pm.peers['tab-2'][1] = Date.now() - 200;
      const removed = pm.removeOutdated();
      expect(removed).toEqual(['tab-2']);
      expect(pm.size()).toBe(0);
    });

    test('does not remove fresh peers', () => {
      const pm = new PresenceManager(100);
      pm.receive(mkPresence('user2', 'tab-2', 1));
      const removed = pm.removeOutdated();
      expect(removed).toEqual([]);
      expect(pm.size()).toBe(1);
    });

    test('emits "removed" event for stale peers', () => {
      const pm = new PresenceManager(100);
      pm.receive(mkPresence('user2', 'tab-2', 1));
      pm.receive(mkPresence('user3', 'tab-3', 1));
      pm.peers['tab-2'][1] = Date.now() - 200;
      pm.peers['tab-3'][1] = Date.now() - 200;
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.removeOutdated();
      expect(events).toHaveLength(1);
      expect(events[0].removed.sort()).toEqual(['tab-2', 'tab-3']);
    });

    test('does not emit when nothing is removed', () => {
      const pm = new PresenceManager(100);
      pm.receive(mkPresence('user2', 'tab-2', 1));
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.removeOutdated();
      expect(events).toHaveLength(0);
    });
  });

  describe('remove', () => {
    test('removes a specific peer', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 1));
      expect(pm.remove('tab-2')).toBe(true);
      expect(pm.size()).toBe(0);
    });

    test('returns false for unknown processId', () => {
      const pm = new PresenceManager();
      expect(pm.remove('unknown')).toBe(false);
    });

    test('emits "removed" event', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 1));
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.remove('tab-2');
      expect(events[0].removed).toEqual(['tab-2']);
    });
  });

  describe('merge', () => {
    test('merges new entries', () => {
      const pm = new PresenceManager();
      pm.merge([mkPresence('user2', 'tab-2', 5), mkPresence('user3', 'tab-3', 3)]);
      expect(pm.size()).toBe(2);
      expect(pm.get('tab-2')![2]).toBe(5);
      expect(pm.get('tab-3')![2]).toBe(3);
    });

    test('skips entries with lower or equal seq', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 10));
      pm.merge([mkPresence('user2', 'tab-2', 5)]);
      expect(pm.get('tab-2')![2]).toBe(10);
    });

    test('accepts entries with higher seq', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 5));
      pm.merge([mkPresence('user2', 'tab-2', 10)]);
      expect(pm.get('tab-2')![2]).toBe(10);
    });

    test('emits per-entry events via receive()', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 1));
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.merge([mkPresence('user2', 'tab-2', 5), mkPresence('user3', 'tab-3', 1)]);
      expect(events).toHaveLength(2);
      expect(events[0].updated).toEqual(['tab-2']);
      expect(events[1].added).toEqual(['tab-3']);
    });

    test('does not emit when nothing changed', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 10));
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.merge([mkPresence('user2', 'tab-2', 5)]);
      expect(events).toHaveLength(0);
    });
  });

  describe('destroy', () => {
    test('removes all entries', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 1));
      pm.receive(mkPresence('user3', 'tab-3', 1));
      pm.destroy();
      expect(pm.size()).toBe(0);
    });

    test('emits "removed" with all process IDs', () => {
      const pm = new PresenceManager();
      pm.receive(mkPresence('user2', 'tab-2', 1));
      pm.receive(mkPresence('user3', 'tab-3', 1));
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.destroy();
      expect(events).toHaveLength(1);
      expect(events[0].removed.sort()).toEqual(['tab-2', 'tab-3']);
    });

    test('does not emit when already empty', () => {
      const pm = new PresenceManager();
      const events: PresenceEvent[] = [];
      pm.onChange.listen((e) => events.push(e));
      pm.destroy();
      expect(events).toHaveLength(0);
    });
  });

  describe('integration', () => {
    test('full lifecycle: receive, outdated, destroy', () => {
      const pm = new PresenceManager(50);
      const allEvents: PresenceEvent[] = [];
      pm.onChange.listen((e) => allEvents.push(e));

      pm.receive(mkPresence('user2', 'tab-2', 1));
      pm.receive(mkPresence('user3', 'tab-3', 1));
      expect(pm.size()).toBe(2);

      pm.receive(mkPresence('user2', 'tab-2', 2));
      expect(pm.get('tab-2')![2]).toBe(2);

      // Stale update ignored
      pm.receive(mkPresence('user2', 'tab-2', 1));
      expect(pm.get('tab-2')![2]).toBe(2);

      // tab-3 goes stale
      pm.peers['tab-3'][1] = Date.now() - 100;
      const removed = pm.removeOutdated();
      expect(removed).toEqual(['tab-3']);
      expect(pm.size()).toBe(1);

      pm.destroy();
      expect(pm.size()).toBe(0);

      expect(allEvents.map((e) => ({a: e.added, u: e.updated, r: e.removed}))).toEqual([
        {a: ['tab-2'], u: [], r: []},
        {a: ['tab-3'], u: [], r: []},
        {a: [], u: ['tab-2'], r: []},
        {a: [], u: [], r: ['tab-3']},
        {a: [], u: [], r: ['tab-2']},
      ]);
    });
  });
});
