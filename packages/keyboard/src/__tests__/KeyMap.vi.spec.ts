import {Key} from '../Key';
import {KeyMap} from '../KeyMap';
import type {Signature} from '../types';

describe('KeyMap', () => {
  const mkKey = (sig: string, mod = '') => new Key(sig, Date.now(), mod as any);

  describe('press bindings', () => {
    test('setPress then matchPress returns binding', () => {
      const map = new KeyMap();
      let _called = 0;
      const action = () => {
        _called++;
      };
      map.setPress('a', action);
      const matches = map.matchPress(mkKey('a'));
      expect(matches).toBeDefined();
      expect(matches!.length).toBe(1);
      expect(matches![0].sig).toBe('a');
    });

    test('action receives the Key', () => {
      const map = new KeyMap();
      let received: Key | undefined;
      map.setPress('a', (key) => {
        received = key;
      });
      const k = mkKey('a');
      const matches = map.matchPress(k);
      matches![0].action(k);
      expect(received).toBe(k);
    });

    test('matchPress returns undefined for unregistered key', () => {
      const map = new KeyMap();
      expect(map.matchPress(mkKey('b'))).toBeUndefined();
    });

    test('multiple handlers for same signature are all returned', () => {
      const map = new KeyMap();
      let _a = 0,
        _b = 0;
      map.setPress('a', () => {
        _a++;
      });
      map.setPress('a', () => {
        _b++;
      });
      const matches = map.matchPress(mkKey('a'));
      expect(matches!.length).toBe(2);
    });

    test('delPress removes specific handler', () => {
      const map = new KeyMap();
      let a = 0,
        b = 0;
      const actionA = () => {
        a++;
      };
      const actionB = () => {
        b++;
      };
      map.setPress('a', actionA);
      map.setPress('a', actionB);
      map.delPress('a', actionA);
      const matches = map.matchPress(mkKey('a'));
      expect(matches!.length).toBe(1);
      matches![0].action(mkKey('a'));
      expect(a).toBe(0);
      expect(b).toBe(1);
    });

    test('delPress on last handler removes the key entirely', () => {
      const map = new KeyMap();
      const action = () => {};
      map.setPress('Enter', action);
      map.delPress('Enter', action);
      expect(map.matchPress(mkKey('Enter'))).toBeUndefined();
    });

    test('delPress is a no-op when signature not registered', () => {
      const map = new KeyMap();
      expect(() => map.delPress('z' as Signature, () => {})).not.toThrow();
    });

    test('delPress is a no-op when action not found', () => {
      const map = new KeyMap();
      const a = () => {};
      const b = () => {};
      map.setPress('z', a);
      map.delPress('z', b);
      expect(map.matchPress(mkKey('z'))!.length).toBe(1);
    });

    test('does not match release binding on press check', () => {
      const map = new KeyMap();
      map.setRelease('a', () => {});
      expect(map.matchPress(mkKey('a'))).toBeUndefined();
    });
  });

  describe('release bindings', () => {
    test('setRelease then matchRelease returns binding', () => {
      const map = new KeyMap();
      map.setRelease('Escape', () => {});
      expect(map.matchRelease(mkKey('Escape'))).toBeDefined();
    });

    test('delRelease removes specific handler', () => {
      const map = new KeyMap();
      const action = () => {};
      map.setRelease('Escape', action);
      map.delRelease('Escape', action);
      expect(map.matchRelease(mkKey('Escape'))).toBeUndefined();
    });

    test('does not match press binding on release check', () => {
      const map = new KeyMap();
      map.setPress('Escape', () => {});
      expect(map.matchRelease(mkKey('Escape'))).toBeUndefined();
    });
  });

  describe('modifier-qualified signatures', () => {
    test('C+a does not match plain a', () => {
      const map = new KeyMap();
      map.setPress('C+a', () => {});
      expect(map.matchPress(mkKey('a'))).toBeUndefined();
    });

    test('C+a matches ctrl-a key', () => {
      const map = new KeyMap();
      map.setPress('C+a', () => {});
      const ctrlA = new Key('a', Date.now(), 'C');
      expect(map.matchPress(ctrlA)).toBeDefined();
    });

    test('plain a does not match ctrl-a', () => {
      const map = new KeyMap();
      map.setPress('a', () => {});
      const ctrlA = new Key('a', Date.now(), 'Control');
      expect(map.matchPress(ctrlA)).toBeUndefined();
    });
  });

  describe('human-readable signatures via normalize', () => {
    test('bind() accepts Ctrl+S shorthand', () => {
      const map = new KeyMap();
      let called = 0;
      map.bind([
        [
          'Ctrl+S',
          () => {
            called++;
          },
        ],
      ]);
      const key = new Key('s', Date.now(), 'Control');
      const matches = map.matchPress(key);
      expect(matches).toBeDefined();
      matches![0].action(key);
      expect(called).toBe(1);
    });

    test('bind() accepts command+shift+k shorthand', () => {
      const map = new KeyMap();
      let called = 0;
      map.bind([
        [
          'command+shift+k',
          () => {
            called++;
          },
        ],
      ]);
      const key = new Key('k', Date.now(), 'Meta+Shift');
      const matches = map.matchPress(key);
      expect(matches).toBeDefined();
      matches![0].action(key);
      expect(called).toBe(1);
    });
  });
});
