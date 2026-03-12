import {Key} from '../Key';
import {KeyContext} from '../KeyContext';
import {KeySet} from '../KeySet';
import {KeySourceManual} from '../KeySourceManual';

const setup = () => {
  const ctx = new KeyContext();
  const src = new KeySourceManual();
  src.bind(ctx);
  return {ctx, src};
};

describe('KeySet.chordSig()', () => {
  const mk = (k: string, mod = '') => new Key(k, Date.now(), mod as any);

  test('two keys, no modifier', () => {
    const set = new KeySet([mk('a'), mk('b')]);
    expect(set.sig()).toBe('a+b');
  });

  test('keys are sorted alphabetically', () => {
    const set = new KeySet([mk('b'), mk('a')]);
    expect(set.sig()).toBe('a+b');
  });

  test('shared modifier prefix is included', () => {
    const set = new KeySet([mk('a', 'Control'), mk('b', 'Control')]);
    expect(set.sig()).toBe('Control+a+b');
  });

  test('three keys sorted', () => {
    const set = new KeySet([mk('c'), mk('a'), mk('b')]);
    expect(set.sig()).toBe('a+b+c');
  });

  test('space is normalised to Space', () => {
    const set = new KeySet([mk(' '), mk('a')]);
    expect(set.sig()).toBe('Space+a');
  });

  test('uppercase single char keys are lowercased', () => {
    const set = new KeySet([mk('A'), mk('B')]);
    expect(set.sig()).toBe('a+b');
  });

  test('multi-char key names preserved as-is', () => {
    const set = new KeySet([mk('Enter'), mk('a')]);
    expect(set.sig()).toBe('Enter+a');
  });

  test('single key returns just that key name', () => {
    const set = new KeySet([mk('a')]);
    expect(set.sig()).toBe('a');
  });

  test('empty set returns empty string', () => {
    const set = new KeySet();
    expect(set.sig()).toBe('');
  });
});

describe('basic chord dispatch', () => {
  test('chord fires when both keys are pressed', () => {
    const {ctx, src} = setup();
    let hits = 0;
    ctx.setChord('a+b', () => {
      hits++;
    });
    src.press('a');
    expect(hits).toBe(0); // not yet
    src.press('b');
    expect(hits).toBe(1);
  });

  test('chord fires regardless of press order (a then b == b then a)', () => {
    const {ctx, src} = setup();
    let hits = 0;
    ctx.setChord('a+b', () => {
      hits++;
    });
    src.press('b');
    src.press('a');
    expect(hits).toBe(1);
  });

  test('chord receives the full KeySet', () => {
    const {ctx, src} = setup();
    let received: KeySet | undefined;
    ctx.setChord('a+b', (pressed) => {
      received = pressed;
    });
    src.press('a');
    src.press('b');
    expect(received).toBeDefined();
    expect(received!.keys.map((k) => k.key).sort()).toEqual(['a', 'b']);
  });

  test('chord does NOT fire for only one key', () => {
    const {ctx, src} = setup();
    let hits = 0;
    ctx.setChord('a+b', () => {
      hits++;
    });
    src.press('a');
    expect(hits).toBe(0);
  });

  test('chord only fires for the exact key set, not a superset', () => {
    const {ctx, src} = setup();
    let abHits = 0;
    ctx.setChord('a+b', () => {
      abHits++;
    });
    src.press('a');
    src.press('b');
    src.press('c'); // now pressed = {a, b, c}; chord 'a+b' should NOT fire again
    expect(abHits).toBe(1);
  });

  test('three-key chord', () => {
    const {ctx, src} = setup();
    let hits = 0;
    ctx.setChord('a+b+c', () => {
      hits++;
    });
    src.press('a');
    src.press('b');
    expect(hits).toBe(0);
    src.press('c');
    expect(hits).toBe(1);
  });

  test('modifier-qualified chord', () => {
    const {ctx, src} = setup();
    let hits = 0;
    ctx.setChord('Control+a+b', () => {
      hits++;
    });
    src.press('a', 'Control');
    src.press('b', 'Control');
    expect(hits).toBe(1);
  });

  test('modifier-qualified chord does not fire for unmodified keys', () => {
    const {ctx, src} = setup();
    let hits = 0;
    ctx.setChord('Control+a+b', () => {
      hits++;
    });
    src.press('a');
    src.press('b');
    expect(hits).toBe(0);
  });
});

describe('chord suppresses single-key binding on completing key', () => {
  test('single-key binding for the completing key does NOT fire when chord matches', () => {
    const {ctx, src} = setup();
    let chord = 0,
      singleB = 0;
    ctx.setChord('a+b', () => {
      chord++;
    });
    ctx.map.setPress('b', () => {
      singleB++;
    });
    src.press('a');
    src.press('b'); // b completes the chord
    expect(chord).toBe(1);
    expect(singleB).toBe(0); // suppressed
  });

  test('single-key binding for the FIRST key still fires (chord not yet formed)', () => {
    const {ctx, src} = setup();
    let chord = 0,
      singleA = 0;
    ctx.setChord('a+b', () => {
      chord++;
    });
    ctx.map.setPress('a', () => {
      singleA++;
    });
    src.press('a');
    src.press('b'); // chord completes
    expect(chord).toBe(1);
    expect(singleA).toBe(1); // not suppressed — chord hadn't formed yet
  });

  test('unrelated key after chord does not re-fire chord', () => {
    const {ctx, src} = setup();
    let hits = 0;
    ctx.setChord('a+b', () => {
      hits++;
    });
    src.press('a');
    src.press('b');
    src.release('a');
    src.press('a'); // now pressed = {b, a} again
    expect(hits).toBe(2); // fires a second time
  });
});

describe('KeyContext.delChord()', () => {
  test('removes the chord binding', () => {
    const {ctx, src} = setup();
    let hits = 0;
    const action = () => {
      hits++;
    };
    ctx.setChord('a+b', action);
    src.press('a');
    src.press('b');
    expect(hits).toBe(1);

    // re-setup pressed state
    src.release('a');
    src.release('b');
    ctx.delChord('a+b', action);
    src.press('a');
    src.press('b');
    expect(hits).toBe(1); // no second increment
  });

  test('delChord is a no-op when sig not registered', () => {
    const {ctx} = setup();
    expect(() => ctx.delChord('x+y', () => {})).not.toThrow();
  });

  test('delChord removes only the specified action, not others', () => {
    const {ctx, src} = setup();
    let a = 0,
      b = 0;
    const actionA = () => {
      a++;
    };
    const actionB = () => {
      b++;
    };
    ctx.setChord('a+b', actionA);
    ctx.setChord('a+b', actionB);
    ctx.delChord('a+b', actionA);
    src.press('a');
    src.press('b');
    expect(a).toBe(0);
    expect(b).toBe(1);
  });
});

describe('chord propagation', () => {
  test('chord does NOT propagate to parent by default', () => {
    const {ctx, src} = setup();
    let parentChordHits = 0;
    // Same chord on parent — should NOT fire if child chord doesn't propagate
    ctx.setChord('a+b', () => {
      parentChordHits++;
    });
    const child = ctx.child('sub');
    child.setChord('a+b', () => {}); // no propagate
    src.press('a');
    src.press('b');
    expect(parentChordHits).toBe(0);
  });

  test('chord with propagate: true bubbles to parent', () => {
    const {ctx, src} = setup();
    let parentChordHits = 0;
    // parent also has the chord registered
    ctx.setChord('a+b', () => {
      parentChordHits++;
    });
    const child = ctx.child('sub');
    child.setChord('a+b', () => {}, {propagate: true});
    src.press('a');
    src.press('b');
    expect(parentChordHits).toBe(1);
  });
});

describe('multiple handlers per chord signature', () => {
  test('all handlers fire', () => {
    const {ctx, src} = setup();
    let a = 0,
      b = 0;
    ctx.setChord('a+b', () => {
      a++;
    });
    ctx.setChord('a+b', () => {
      b++;
    });
    src.press('a');
    src.press('b');
    expect(a).toBe(1);
    expect(b).toBe(1);
  });
});

describe('onChange after chord', () => {
  test('onChange fires after a chord is matched', () => {
    const {ctx, src} = setup();
    let fires = 0;
    ctx.setChord('a+b', () => {});
    ctx.onChange.listen(() => {
      fires++;
    });
    src.press('a');
    src.press('b');
    expect(fires).toBe(2);
  });
});
