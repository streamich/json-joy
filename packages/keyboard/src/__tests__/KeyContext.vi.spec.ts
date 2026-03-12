import {KeyContext} from '../KeyContext';
import {KeySourceManual} from '../KeySourceManual';

const setup = async () => {
  const ctx = new KeyContext();
  const src = new KeySourceManual();
  const unbind = src.bind(ctx);
  return {
    ctx,
    src,
    unbind,
    [Symbol.asyncDispose]: async () => {
      unbind();
    },
  };
};

test('can create KeyContext', async () => {
  await using kit = await setup();
  expect(kit.ctx).toBeInstanceOf(KeyContext);
});

test('triggers "press" event', async () => {
  await using kit = await setup();
  let text = '';
  kit.ctx.map.setPress('a', () => (text += 'hello'));
  kit.src.press('a');
  expect(text).toBe('hello');
  expect(kit.ctx.pressed.keys.length).toBe(1);
  kit.src.release('a');
  expect(text).toBe('hello');
  expect(kit.ctx.pressed.keys.length).toBe(0);
});

describe('.child() context', () => {
  test('can create a child context (which inherits parent key source)', async () => {
    await using kit = await setup();
    let text = '';
    const ctx = kit.ctx.child();
    ctx.map.setPress('a', () => (text += 'hello'));
    kit.src.press('a');
    expect(text).toBe('hello');
    expect(ctx.pressed.keys.length).toBe(1);
    expect(kit.ctx.pressed.keys.length).toBe(0);
    kit.src.release('a');
    expect(text).toBe('hello');
    expect(ctx.pressed.keys.length).toBe(0);
    expect(kit.ctx.pressed.keys.length).toBe(0);
  });
});

describe('history', () => {
  test('records pressed keys in order', async () => {
    await using kit = await setup();
    kit.src.press('a');
    kit.src.press('b');
    kit.src.press('c');
    const sigs = kit.ctx.history.map((k) => k.key);
    expect(sigs).toEqual(['a', 'b', 'c']);
  });

  test('trims history to historyLimit', async () => {
    await using kit = await setup();
    kit.ctx.historyLimit = 3;
    kit.src.press('a');
    kit.src.press('b');
    kit.src.press('c');
    kit.src.press('d');
    expect(kit.ctx.history.length).toBe(3);
    expect(kit.ctx.history.map((k) => k.key)).toEqual(['b', 'c', 'd']);
  });
});

describe('pause / resume', () => {
  test('paused context ignores key presses', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.map.setPress('a', () => {
      hits++;
    });
    kit.ctx.pause();
    kit.src.press('a');
    expect(hits).toBe(0);
    expect(kit.ctx.pressed.keys.length).toBe(0);
  });

  test('resumed context receives key presses again', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.map.setPress('a', () => {
      hits++;
    });
    kit.ctx.pause();
    kit.src.press('a');
    kit.src.release('a');
    kit.ctx.resume();
    kit.src.press('a');
    expect(hits).toBe(1);
  });
});

describe('onChange', () => {
  test('fires after a key press', async () => {
    await using kit = await setup();
    let fires = 0;
    kit.ctx.onChange.listen(() => {
      fires++;
    });
    kit.src.press('a');
    expect(fires).toBe(1);
  });

  test('fires after a key release', async () => {
    await using kit = await setup();
    let fires = 0;
    kit.src.press('a');
    kit.ctx.onChange.listen(() => {
      fires++;
    });
    kit.src.release('a');
    expect(fires).toBe(1);
  });

  test('fires after reset', async () => {
    await using kit = await setup();
    let fires = 0;
    kit.ctx.onChange.listen(() => {
      fires++;
    });
    kit.src.reset();
    expect(fires).toBe(1);
  });
});

describe('propagation to parent', () => {
  test('unmatched child key propagates to parent', async () => {
    await using kit = await setup();
    let parentHits = 0;
    kit.ctx.map.setPress('a', () => {
      parentHits++;
    });
    const _child = kit.ctx.child('sub');
    kit.src.press('a');
    expect(parentHits).toBe(1);
  });

  test('matched child key does NOT propagate to parent by default', async () => {
    await using kit = await setup();
    let parentHits = 0;
    let childHits = 0;
    kit.ctx.map.setPress('a', () => {
      parentHits++;
    });
    const child = kit.ctx.child('sub');
    child.map.setPress('a', () => {
      childHits++;
    });
    kit.src.press('a');
    expect(childHits).toBe(1);
    expect(parentHits).toBe(0);
  });
});

describe('.child() with custom source', () => {
  test('parent source events do NOT reach child with own source', async () => {
    await using kit = await setup();
    const childSrc = new KeySourceManual();
    let childHits = 0;
    const child = kit.ctx.child('child', childSrc as any);
    child.map.setPress('a', () => {
      childHits++;
    });
    kit.src.press('a');
    expect(childHits).toBe(0);
    // child's own source does reach child
    childSrc.bind(child);
    childSrc.press('a');
    expect(childHits).toBe(1);
  });

  test('detaching child restores parent routing', async () => {
    await using kit = await setup();
    let parentHits = 0;
    kit.ctx.map.setPress('z', () => {
      parentHits++;
    });
    const _child = kit.ctx.child();
    // With child active, parent onPress_ is not called directly
    kit.src.press('z');
    expect(parentHits).toBe(1);
  });

  test('creating multiple children adds all to the children set', async () => {
    await using kit = await setup();
    const child1 = kit.ctx.child('first');
    const child2 = kit.ctx.child('second');
    expect(kit.ctx.children.has(child1)).toBe(true);
    expect(kit.ctx.children.has(child2)).toBe(true);
  });
});

describe('Meta key stuck workaround', () => {
  test('releasing Meta clears non-modifier keys from pressed', async () => {
    await using kit = await setup();
    kit.src.press('Meta', 'Meta');
    kit.src.press('c', 'Meta');
    expect(kit.ctx.pressed.keys.map((k) => k.key)).toEqual(['Meta', 'c']);
    // Browser does not fire keyup for 'c' on macOS — only Meta keyup fires
    kit.src.release('Meta', 'Meta');
    expect(kit.ctx.pressed.keys.map((k) => k.key)).toEqual([]);
  });

  test('releasing Meta keeps other modifier keys in pressed', async () => {
    await using kit = await setup();
    kit.src.press('Control', 'Control');
    kit.src.press('Meta', 'Control+Meta');
    kit.src.press('s', 'Control+Meta');
    // simulate macOS: no keyup for 's', only Meta keyup
    kit.src.release('Meta', 'Control+Meta');
    // Control should still be in pressed; 's' should be gone
    expect(kit.ctx.pressed.keys.map((k) => k.key)).toEqual(['Control']);
  });

  test('normal (non-Meta) key release is unaffected', async () => {
    await using kit = await setup();
    kit.src.press('a');
    kit.src.press('b');
    kit.src.release('a');
    expect(kit.ctx.pressed.keys.map((k) => k.key)).toEqual(['b']);
  });
});

describe('toString()', () => {
  test('returns a string without throwing', async () => {
    await using kit = await setup();
    kit.src.press('a');
    expect(typeof kit.ctx.toString()).toBe('string');
  });

  test('includes child context in output', async () => {
    await using kit = await setup();
    kit.ctx.child('inner');
    const s = kit.ctx.toString();
    expect(s).toContain('inner');
  });
});

describe('KeyContext.bind()', () => {
  test('shorthand [sig, action] registers a press handler', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.bind([
      [
        'a',
        () => {
          hits++;
        },
      ],
    ]);
    kit.src.press('a');
    expect(hits).toBe(1);
  });

  test('shorthand [sig, action] action receives the Key', async () => {
    await using kit = await setup();
    let received: import('../Key').Key | undefined;
    kit.ctx.bind([
      [
        'a',
        (k) => {
          received = k;
        },
      ],
    ]);
    kit.src.press('a');
    expect(received).toBeDefined();
    expect(received!.key).toBe('a');
  });

  test('object form { sig, action } registers a press handler', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.bind([
      {
        sig: 'b',
        action: () => {
          hits++;
        },
      },
    ]);
    kit.src.press('b');
    expect(hits).toBe(1);
  });

  test('multiple bindings in one call all register', async () => {
    await using kit = await setup();
    let a = 0,
      b = 0;
    kit.ctx.bind([
      [
        'a',
        () => {
          a++;
        },
      ],
      [
        'b',
        () => {
          b++;
        },
      ],
    ]);
    kit.src.press('a');
    kit.src.press('b');
    expect(a).toBe(1);
    expect(b).toBe(1);
  });

  test('unbind function removes all registered handlers', async () => {
    await using kit = await setup();
    let hits = 0;
    const unbind = kit.ctx.bind([
      [
        'a',
        () => {
          hits++;
        },
      ],
    ]);
    kit.src.press('a');
    expect(hits).toBe(1);
    unbind();
    kit.src.press('a');
    expect(hits).toBe(1); // no second increment
  });

  test('shorthand with { propagate: true } bubbles to parent', async () => {
    await using kit = await setup();
    let parentHits = 0;
    let childHits = 0;
    kit.ctx.map.setPress('a', () => {
      parentHits++;
    });
    const child = kit.ctx.child('sub');
    child.bind([
      [
        'a',
        () => {
          childHits++;
        },
        {propagate: true},
      ],
    ]);
    kit.src.press('a');
    expect(childHits).toBe(1);
    expect(parentHits).toBe(1); // propagated
  });

  test('object form with propagate: true bubbles to parent', async () => {
    await using kit = await setup();
    let parentHits = 0;
    let childHits = 0;
    kit.ctx.map.setPress('a', () => {
      parentHits++;
    });
    const child = kit.ctx.child('sub');
    child.bind([
      {
        sig: 'a',
        action: () => {
          childHits++;
        },
        propagate: true,
      },
    ]);
    kit.src.press('a');
    expect(childHits).toBe(1);
    expect(parentHits).toBe(1);
  });

  test('default (no propagate) does NOT bubble to parent', async () => {
    await using kit = await setup();
    let parentHits = 0;
    kit.ctx.map.setPress('a', () => {
      parentHits++;
    });
    const child = kit.ctx.child('sub');
    child.bind([['a', () => {}]]);
    kit.src.press('a');
    expect(parentHits).toBe(0);
  });

  test('shorthand with { release: true } registers a release handler', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.bind([
      [
        'a',
        () => {
          hits++;
        },
        {release: true},
      ],
    ]);
    kit.src.press('a');
    expect(hits).toBe(0); // not on press
    kit.src.release('a');
    expect(hits).toBe(1); // on release
  });

  test('object form with release: true registers a release handler', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.bind([
      {
        sig: 'Enter',
        action: () => {
          hits++;
        },
        release: true,
      },
    ]);
    kit.src.press('Enter');
    expect(hits).toBe(0);
    kit.src.release('Enter');
    expect(hits).toBe(1);
  });

  test('unbind removes release handler too', async () => {
    await using kit = await setup();
    let hits = 0;
    const unbind = kit.ctx.bind([
      [
        'a',
        () => {
          hits++;
        },
        {release: true},
      ],
    ]);
    kit.src.press('a');
    kit.src.release('a');
    expect(hits).toBe(1);
    unbind();
    kit.src.press('a');
    kit.src.release('a');
    expect(hits).toBe(1);
  });

  test('chord shorthand [sig, action] fires when both keys are pressed', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.bind([
      [
        'a+b',
        () => {
          hits++;
        },
      ],
    ]);
    kit.src.press('a');
    expect(hits).toBe(0);
    kit.src.press('b');
    expect(hits).toBe(1);
  });

  test('chord shorthand unbind removes the chord handler', async () => {
    await using kit = await setup();
    let hits = 0;
    const unbind = kit.ctx.bind([
      [
        'a+b',
        () => {
          hits++;
        },
      ],
    ]);
    kit.src.press('a');
    kit.src.press('b');
    expect(hits).toBe(1);
    unbind();
    kit.src.release('a');
    kit.src.release('b');
    kit.src.press('a');
    kit.src.press('b');
    expect(hits).toBe(1);
  });

  test('chord object form { sig, action } fires correctly', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.bind([
      {
        sig: 'j+k',
        action: () => {
          hits++;
        },
      },
    ]);
    kit.src.press('j');
    kit.src.press('k');
    expect(hits).toBe(1);
  });

  test('chord and single-key binding can coexist in one bind() call', async () => {
    await using kit = await setup();
    let single = 0,
      chord = 0;
    kit.ctx.bind([
      [
        'a',
        () => {
          single++;
        },
      ],
      [
        'a+b',
        () => {
          chord++;
        },
      ],
    ]);
    kit.src.press('a'); // single fires; chord not yet complete
    expect(single).toBe(1);
    expect(chord).toBe(0);
    kit.src.press('b'); // chord completes, suppresses single for 'b'
    expect(chord).toBe(1);
    expect(single).toBe(1); // no extra single increment
  });
});

describe("'' catch-all wildcard", () => {
  test("'' handler fires for every key press", async () => {
    await using kit = await setup();
    const seen: string[] = [];
    kit.ctx.map.setPress('', (k) => {
      seen.push(k.key);
    });
    kit.src.press('a');
    kit.src.press('b');
    kit.src.press('Enter');
    expect(seen).toEqual(['a', 'b', 'Enter']);
  });

  test("'' handler fires alongside an exact match", async () => {
    await using kit = await setup();
    let exact = 0,
      any = 0;
    kit.ctx.map.setPress('a', () => {
      exact++;
    });
    kit.ctx.map.setPress('', () => {
      any++;
    });
    kit.src.press('a');
    expect(exact).toBe(1);
    expect(any).toBe(1);
  });

  test("'' handler fires even when no exact match exists", async () => {
    await using kit = await setup();
    let any = 0;
    kit.ctx.map.setPress('', () => {
      any++;
    });
    kit.src.press('z');
    expect(any).toBe(1);
  });

  test("'' can be registered via bind() shorthand", async () => {
    await using kit = await setup();
    let any = 0;
    const unbind = kit.ctx.bind([
      [
        '',
        () => {
          any++;
        },
      ],
    ]);
    kit.src.press('x');
    expect(any).toBe(1);
    unbind();
    kit.src.press('x');
    expect(any).toBe(1);
  });

  test("'' suppresses propagation by default (like any binding)", async () => {
    await using kit = await setup();
    let parentHits = 0;
    kit.ctx.map.setPress('a', () => {
      parentHits++;
    });
    const child = kit.ctx.child('sub');
    child.map.setPress('', () => {}); // catch-all, no propagate
    kit.src.press('a');
    expect(parentHits).toBe(0);
  });

  test("'' with propagate: true still bubbles to parent", async () => {
    await using kit = await setup();
    let parentHits = 0;
    kit.ctx.map.setPress('a', () => {
      parentHits++;
    });
    const child = kit.ctx.child('sub');
    child.bind([['', () => {}, {propagate: true}]]);
    kit.src.press('a');
    expect(parentHits).toBe(1);
  });
});

describe("'?' fallback wildcard", () => {
  test("'?' fires for an unmatched key", async () => {
    await using kit = await setup();
    let fallback = 0;
    kit.ctx.map.setPress('?', () => {
      fallback++;
    });
    kit.src.press('z');
    expect(fallback).toBe(1);
  });

  test("'?' does NOT fire when an exact binding matches", async () => {
    await using kit = await setup();
    let exact = 0,
      fallback = 0;
    kit.ctx.map.setPress('a', () => {
      exact++;
    });
    kit.ctx.map.setPress('?', () => {
      fallback++;
    });
    kit.src.press('a');
    expect(exact).toBe(1);
    expect(fallback).toBe(0);
  });

  test("'?' and '' both fire for an unmatched key", async () => {
    await using kit = await setup();
    let any = 0,
      fallback = 0;
    kit.ctx.map.setPress('', () => {
      any++;
    });
    kit.ctx.map.setPress('?', () => {
      fallback++;
    });
    kit.src.press('z');
    expect(any).toBe(1);
    expect(fallback).toBe(1);
  });

  test("'?' fires but '' does not when only '?' is registered (no any at all)", async () => {
    await using kit = await setup();
    let fallback = 0;
    kit.ctx.map.setPress('?', () => {
      fallback++;
    });
    kit.src.press('x');
    expect(fallback).toBe(1);
  });

  test("'?' receives matched key via action argument", async () => {
    await using kit = await setup();
    let received: import('../Key').Key | undefined;
    kit.ctx.map.setPress('?', (k) => {
      received = k;
    });
    kit.src.press('q');
    expect(received!.key).toBe('q');
  });

  test("'?' can be registered via bind() shorthand", async () => {
    await using kit = await setup();
    let fallback = 0;
    const unbind = kit.ctx.bind([
      [
        '?',
        () => {
          fallback++;
        },
      ],
    ]);
    kit.src.press('w');
    expect(fallback).toBe(1);
    unbind();
    kit.src.press('w');
    expect(fallback).toBe(1);
  });
});

describe('multi-child', () => {
  test('two sibling children, active receives fed events', async () => {
    await using kit = await setup();
    let hits1 = 0;
    let hits2 = 0;
    const child1 = kit.ctx.child('c1');
    const child2 = kit.ctx.child('c2');
    child1.map.setPress('a', () => { hits1++; });
    child2.map.setPress('a', () => { hits2++; });
    // child1 is auto-active (first fed child); child2 is not active yet
    kit.src.press('a');
    expect(hits1).toBe(1);
    expect(hits2).toBe(0);
    // switch to child2
    child2.focus();
    kit.src.press('a');
    expect(hits1).toBe(1);
    expect(hits2).toBe(1);
  });

  test('calling .focus() sets active up the chain', async () => {
    await using kit = await setup();
    const [global] = KeyContext.global('g');
    const view = global.child('view');
    const editor1 = view.child('editor1');
    const editor2 = view.child('editor2');
    expect(view.active).toBe(editor1); // auto-activated first child
    editor2.focus();
    expect(view.active).toBe(editor2);
    expect(global.active).toBe(view);
  });

  test('auto-focus via onFocus() propagates up', async () => {
    await using kit = await setup();
    const [global] = KeyContext.global('g');
    const view = global.child('view');
    const editor1 = view.child('editor1');
    const editor2 = view.child('editor2');
    // editor1 is auto-active; simulate focus on editor2
    editor2.onFocus();
    expect(view.active).toBe(editor2);
    expect(global.active).toBe(view);
    void editor1;
  });

  test('only active fed child receives onPress_', async () => {
    await using kit = await setup();
    let hits1 = 0;
    let hits2 = 0;
    const child1 = kit.ctx.child('c1');
    const child2 = kit.ctx.child('c2');
    child1.map.setPress('x', () => { hits1++; });
    child2.map.setPress('x', () => { hits2++; });
    // child1 is auto-active
    kit.src.press('x');
    expect(hits1).toBe(1);
    expect(hits2).toBe(0);
    child2.focus();
    kit.src.press('x');
    expect(hits1).toBe(1);
    expect(hits2).toBe(1);
  });

  test('child with own source: parent drops its source event', async () => {
    await using kit = await setup();
    let parentHits = 0;
    let childHits = 0;
    kit.ctx.map.setPress('a', () => { parentHits++; });
    const ownSrc = new KeySourceManual();
    const child = kit.ctx.child('ownSrc', ownSrc as any);
    child.map.setPress('a', () => { childHits++; });
    // child._fed is false → ctx.active is not set → parent handles its own event
    kit.src.press('a');
    expect(parentHits).toBe(1); // parent handles its own source directly
    expect(childHits).toBe(0);
    // child's own source fires separately
    ownSrc.press('a');
    expect(childHits).toBe(1);
  });

  test('dispose() removes child from parent.children', async () => {
    await using kit = await setup();
    const child = kit.ctx.child('toRemove');
    expect(kit.ctx.children.has(child)).toBe(true);
    child.dispose();
    expect(kit.ctx.children.has(child)).toBe(false);
  });

  test('dispose() clears parent.active when disposed child was active', async () => {
    await using kit = await setup();
    const child = kit.ctx.child('active');
    expect(kit.ctx.active).toBe(child);
    child.dispose();
    expect(kit.ctx.active).toBeUndefined();
  });

  test('dispose() recursively disposes grandchildren', async () => {
    await using kit = await setup();
    const child = kit.ctx.child('child');
    const grandchild = child.child('grandchild');
    expect(child.children.has(grandchild)).toBe(true);
    child.dispose();
    expect(child.children.size).toBe(0);
    expect(kit.ctx.children.has(child)).toBe(false);
    void grandchild;
  });

  test('keys bubble from active leaf up through all ancestors', async () => {
    await using kit = await setup();
    let rootHits = 0;
    let childHits = 0;
    let grandchildHits = 0;
    kit.ctx.bind([['b', () => { rootHits++; }, {propagate: true}]]);
    const child = kit.ctx.child('child');
    child.bind([['b', () => { childHits++; }, {propagate: true}]]);
    const grandchild = child.child('grandchild');
    grandchild.bind([['b', () => { grandchildHits++; }, {propagate: true}]]);
    // grandchild is auto-active in child; child is auto-active in ctx
    kit.src.press('b');
    expect(grandchildHits).toBe(1);
    expect(childHits).toBe(1);
    expect(rootHits).toBe(1);
  });
});
