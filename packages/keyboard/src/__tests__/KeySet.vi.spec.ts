import {Key} from '../Key';
import {KeySet} from '../KeySet';

const mk = (k: string, ts = Date.now()) => new Key(k, ts);

describe('KeySet', () => {
  describe('add()', () => {
    test('adds a key', () => {
      const set = new KeySet();
      set.add(mk('a'));
      expect(set.keys.length).toBe(1);
      expect(set.keys[0].key).toBe('a');
    });

    test('adding same key again replaces the existing entry (dedup)', () => {
      const set = new KeySet();
      set.add(mk('a', 1000));
      set.add(mk('a', 2000));
      expect(set.keys.length).toBe(1);
      expect(set.keys[0].ts).toBe(2000);
    });

    test('adds multiple distinct keys', () => {
      const set = new KeySet();
      set.add(mk('a'));
      set.add(mk('b'));
      expect(set.keys.length).toBe(2);
    });
  });

  describe('remove()', () => {
    test('removes an added key', () => {
      const set = new KeySet();
      set.add(mk('a'));
      set.remove(mk('a'));
      expect(set.keys.length).toBe(0);
    });

    test('is a no-op when key not present', () => {
      const set = new KeySet();
      expect(() => set.remove(mk('z'))).not.toThrow();
      expect(set.keys.length).toBe(0);
    });

    test('removes only the matching key', () => {
      const set = new KeySet();
      set.add(mk('a'));
      set.add(mk('b'));
      set.remove(mk('a'));
      expect(set.keys.length).toBe(1);
      expect(set.keys[0].key).toBe('b');
    });
  });

  describe('reset()', () => {
    test('clears all keys', () => {
      const set = new KeySet();
      set.add(mk('a'));
      set.add(mk('b'));
      set.reset();
      expect(set.keys.length).toBe(0);
    });

    test('is safe on empty set', () => {
      const set = new KeySet();
      expect(() => set.reset()).not.toThrow();
    });
  });

  describe('start()', () => {
    test('returns 0 for empty set', () => {
      const set = new KeySet();
      expect(set.start()).toBe(0);
    });

    test('returns the lowest timestamp', () => {
      const set = new KeySet();
      set.add(mk('a', 100));
      set.add(mk('b', 200));
      set.add(mk('c', 50));
      expect(set.start()).toBe(50);
    });

    test('returns ts of the single key', () => {
      const set = new KeySet();
      set.add(mk('x', 9999));
      expect(set.start()).toBe(9999);
    });
  });

  describe('end()', () => {
    test('returns 0 for empty set', () => {
      const set = new KeySet();
      expect(set.end()).toBe(0);
    });

    test('returns the highest timestamp', () => {
      const set = new KeySet();
      set.add(mk('a', 100));
      set.add(mk('b', 200));
      set.add(mk('c', 50));
      expect(set.end()).toBe(200);
    });

    test('returns ts of the single key', () => {
      const set = new KeySet();
      set.add(mk('x', 9999));
      expect(set.end()).toBe(9999);
    });
  });

  describe('toString()', () => {
    test('returns human-readable string', () => {
      const set = new KeySet([mk('a'), mk('b')]);
      expect(set.toString()).toContain('a');
      expect(set.toString()).toContain('b');
    });

    test('empty set produces empty-looking string', () => {
      const set = new KeySet();
      const str = set.toString();
      expect(typeof str).toBe('string');
    });
  });
});
