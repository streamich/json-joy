import {Key} from '../Key';
import {KeyMap} from '../KeyMap';
import {mod} from '../util';
import type {KeyEvent} from '../types';

const mkEvent = (overrides: Partial<KeyEvent> = {}): KeyEvent => ({
  key: 'a',
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  isComposing: false,
  repeat: false,
  stopPropagation: () => {},
  preventDefault: () => {},
  ...overrides,
});

describe('Key.fromEvent() with code', () => {
  test('captures event.code', () => {
    const key = Key.fromEvent(mkEvent({key: 'z', code: 'KeyW'}));
    expect(key.code).toBe('KeyW');
    expect(key.key).toBe('z');
  });

  test('code is undefined when not present', () => {
    const key = Key.fromEvent(mkEvent({key: 'a'}));
    expect(key.code).toBeUndefined();
  });
});

describe('Key.codeSig()', () => {
  test('returns @-prefixed code signature', () => {
    const key = new Key('z', 0, '', undefined, 'KeyW');
    expect(key.codeSig()).toBe('@KeyW');
  });

  test('includes modifier prefix', () => {
    const key = new Key('z', 0, 'Control', undefined, 'KeyW');
    expect(key.codeSig()).toBe('Control+@KeyW');
  });

  test('includes multiple modifiers', () => {
    const key = new Key('z', 0, 'Control+Shift', undefined, 'KeyW');
    expect(key.codeSig()).toBe('Control+Shift+@KeyW');
  });

  test('falls back to sig() when code is undefined', () => {
    const key = new Key('a', 0, 'Control');
    expect(key.codeSig()).toBe(key.sig());
  });

  test('appends :R for repeat', () => {
    const event = mkEvent({key: 'z', code: 'KeyW', repeat: true});
    const key = Key.fromEvent(event);
    expect(key.codeSig()).toBe('@KeyW:R');
  });
});

describe('KeyMap with code-based bindings', () => {
  test('matches @-prefixed binding via codeSig', () => {
    const map = new KeyMap();
    let called = 0;
    map.setPress('@KeyW' as any, () => {
      called++;
    });
    // Key with code=KeyW, key=z (AZERTY)
    const key = new Key('z', Date.now(), '', undefined, 'KeyW');
    const matches = map.matchPress(key);
    expect(matches).toBeDefined();
    expect(matches!.length).toBe(1);
    matches![0].action(key);
    expect(called).toBe(1);
  });

  test('matches C+@KeyS binding', () => {
    const map = new KeyMap();
    let called = 0;
    map.setPress('Control+@KeyS' as any, () => {
      called++;
    });
    const key = new Key('s', Date.now(), 'Control', undefined, 'KeyS');
    const matches = map.matchPress(key);
    expect(matches).toBeDefined();
    matches![0].action(key);
    expect(called).toBe(1);
  });

  test('does not match code binding against wrong code', () => {
    const map = new KeyMap();
    map.setPress('@KeyW' as any, () => {});
    const key = new Key('w', Date.now(), '', undefined, 'KeyQ');
    expect(map.matchPress(key)).toBeUndefined();
  });

  test('bind() shorthand with @ prefix', () => {
    const map = new KeyMap();
    let called = 0;
    map.bind([
      [
        '@KeyW' as any,
        () => {
          called++;
        },
      ],
    ]);
    const key = new Key('z', Date.now(), '', undefined, 'KeyW');
    const matches = map.matchPress(key);
    expect(matches).toBeDefined();
    matches![0].action(key);
    expect(called).toBe(1);
  });

  test('bind() shorthand with modifier + @ prefix', () => {
    const map = new KeyMap();
    let called = 0;
    map.bind([
      [
        'Control+@KeyS' as any,
        () => {
          called++;
        },
      ],
    ]);
    const key = new Key('s', Date.now(), 'Control', undefined, 'KeyS');
    const matches = map.matchPress(key);
    expect(matches).toBeDefined();
    matches![0].action(key);
    expect(called).toBe(1);
  });

  test('code and key bindings coexist for same physical key', () => {
    const map = new KeyMap();
    map.setPress('@KeyW' as any, () => {});
    map.setPress('w' as any, () => {});
    // QWERTY: key=w, code=KeyW -- both should match
    const qwerty = new Key('w', Date.now(), '', undefined, 'KeyW');
    const matches = map.matchPress(qwerty);
    expect(matches).toBeDefined();
    expect(matches!.length).toBe(2);
    // AZERTY: key=z, code=KeyW -- only @KeyW matches
    const azerty = new Key('z', Date.now(), '', undefined, 'KeyW');
    const azertyMatches = map.matchPress(azerty);
    expect(azertyMatches).toBeDefined();
    expect(azertyMatches!.length).toBe(1);
  });

  test('delPress removes code-based binding', () => {
    const map = new KeyMap();
    const action = () => {};
    map.setPress('@KeyW' as any, action);
    map.delPress('@KeyW' as any, action);
    const key = new Key('z', Date.now(), '', undefined, 'KeyW');
    expect(map.matchPress(key)).toBeUndefined();
  });

  test('release matching works with code-based bindings', () => {
    const map = new KeyMap();
    let called = 0;
    map.setRelease('@KeyW' as any, () => {
      called++;
    });
    const key = new Key('z', Date.now(), '', undefined, 'KeyW');
    const matches = map.matchRelease(key);
    expect(matches).toBeDefined();
    matches![0].action(key);
    expect(called).toBe(1);
  });

  test('fallback ? still works when no code binding matches', () => {
    const map = new KeyMap();
    let called = 0;
    map.setPress('?' as any, () => {
      called++;
    });
    const key = new Key('z', Date.now(), '', undefined, 'KeyW');
    const matches = map.matchPress(key);
    expect(matches).toBeDefined();
    matches![0].action(key);
    expect(called).toBe(1);
  });

  test('fallback ? suppressed when code binding matches', () => {
    const map = new KeyMap();
    map.setPress('?' as any, () => {});
    map.setPress('@KeyW' as any, () => {});
    const key = new Key('z', Date.now(), '', undefined, 'KeyW');
    const matches = map.matchPress(key);
    expect(matches).toBeDefined();
    // code match present, so ? should not be included
    const sigs = matches!.map((m) => m.sig);
    expect(sigs).not.toContain('?');
  });

  test('P modifier works with @ prefix', () => {
    const map = new KeyMap();
    let called = 0;
    map.bind([
      [
        'Primary+@KeyS' as any,
        () => {
          called++;
        },
      ],
    ]);
    const key = new Key('s', Date.now(), mod, undefined, 'KeyS');
    const matches = map.matchPress(key);
    expect(matches).toBeDefined();
    matches![0].action(key);
    expect(called).toBe(1);
  });
});
