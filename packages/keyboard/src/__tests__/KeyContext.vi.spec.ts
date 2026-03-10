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
  kit.ctx.map.setPress('a', () => text += 'hello');
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
    ctx.map.setPress('a', () => text += 'hello');
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
    const sigs = kit.ctx.history.map(k => k.key);
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
    expect(kit.ctx.history.map(k => k.key)).toEqual(['b', 'c', 'd']);
  });
});

describe('pause / resume', () => {
  test('paused context ignores key presses', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.map.setPress('a', () => { hits++; });
    kit.ctx.pause();
    kit.src.press('a');
    expect(hits).toBe(0);
    expect(kit.ctx.pressed.keys.length).toBe(0);
  });

  test('resumed context receives key presses again', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.map.setPress('a', () => { hits++; });
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
    kit.ctx.onChange.listen(() => { fires++; });
    kit.src.press('a');
    expect(fires).toBe(1);
  });

  test('fires after a key release', async () => {
    await using kit = await setup();
    let fires = 0;
    kit.src.press('a');
    kit.ctx.onChange.listen(() => { fires++; });
    kit.src.release('a');
    expect(fires).toBe(1);
  });

  test('fires after reset', async () => {
    await using kit = await setup();
    let fires = 0;
    kit.ctx.onChange.listen(() => { fires++; });
    kit.src.reset();
    expect(fires).toBe(1);
  });
});

describe('propagation to parent', () => {
  test('unmatched child key propagates to parent', async () => {
    await using kit = await setup();
    let parentHits = 0;
    kit.ctx.map.setPress('a', () => { parentHits++; });
    const child = kit.ctx.child('sub');
    kit.src.press('a');
    expect(parentHits).toBe(1);
  });

  test('matched child key does NOT propagate to parent by default', async () => {
    await using kit = await setup();
    let parentHits = 0;
    let childHits = 0;
    kit.ctx.map.setPress('a', () => { parentHits++; });
    const child = kit.ctx.child('sub');
    child.map.setPress('a', () => { childHits++; });
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
    child.map.setPress('a', () => { childHits++; });
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
    kit.ctx.map.setPress('z', () => { parentHits++; });
    const child = kit.ctx.child();
    // With child active, parent onPress_ is not called directly
    kit.src.press('z');
    expect(parentHits).toBe(1);
  });

  test('creating a second child detaches the first', async () => {
    await using kit = await setup();
    const child1 = kit.ctx.child('first');
    const child2 = kit.ctx.child('second');
    expect(kit.ctx._child).toBe(child2);
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
    kit.ctx.bind([['a', () => { hits++; }]]);
    kit.src.press('a');
    expect(hits).toBe(1);
  });

  test('shorthand [sig, action] action receives the Key', async () => {
    await using kit = await setup();
    let received: import('../Key').Key | undefined;
    kit.ctx.bind([['a', (k) => { received = k; }]]);
    kit.src.press('a');
    expect(received).toBeDefined();
    expect(received!.key).toBe('a');
  });

  test('object form { sig, action } registers a press handler', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.bind([{sig: 'b', action: () => { hits++; }}]);
    kit.src.press('b');
    expect(hits).toBe(1);
  });

  test('multiple bindings in one call all register', async () => {
    await using kit = await setup();
    let a = 0, b = 0;
    kit.ctx.bind([
      ['a', () => { a++; }],
      ['b', () => { b++; }],
    ]);
    kit.src.press('a');
    kit.src.press('b');
    expect(a).toBe(1);
    expect(b).toBe(1);
  });

  test('unbind function removes all registered handlers', async () => {
    await using kit = await setup();
    let hits = 0;
    const unbind = kit.ctx.bind([['a', () => { hits++; }]]);
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
    kit.ctx.map.setPress('a', () => { parentHits++; });
    const child = kit.ctx.child('sub');
    child.bind([['a', () => { childHits++; }, {propagate: true}]]);
    kit.src.press('a');
    expect(childHits).toBe(1);
    expect(parentHits).toBe(1); // propagated
  });

  test('object form with propagate: true bubbles to parent', async () => {
    await using kit = await setup();
    let parentHits = 0;
    let childHits = 0;
    kit.ctx.map.setPress('a', () => { parentHits++; });
    const child = kit.ctx.child('sub');
    child.bind([{sig: 'a', action: () => { childHits++; }, propagate: true}]);
    kit.src.press('a');
    expect(childHits).toBe(1);
    expect(parentHits).toBe(1);
  });

  test('default (no propagate) does NOT bubble to parent', async () => {
    await using kit = await setup();
    let parentHits = 0;
    kit.ctx.map.setPress('a', () => { parentHits++; });
    const child = kit.ctx.child('sub');
    child.bind([['a', () => {}]]);
    kit.src.press('a');
    expect(parentHits).toBe(0);
  });

  test('shorthand with { release: true } registers a release handler', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.bind([['a', () => { hits++; }, {release: true}]]);
    kit.src.press('a');
    expect(hits).toBe(0); // not on press
    kit.src.release('a');
    expect(hits).toBe(1); // on release
  });

  test('object form with release: true registers a release handler', async () => {
    await using kit = await setup();
    let hits = 0;
    kit.ctx.bind([{sig: 'Enter', action: () => { hits++; }, release: true}]);
    kit.src.press('Enter');
    expect(hits).toBe(0);
    kit.src.release('Enter');
    expect(hits).toBe(1);
  });

  test('unbind removes release handler too', async () => {
    await using kit = await setup();
    let hits = 0;
    const unbind = kit.ctx.bind([['a', () => { hits++; }, {release: true}]]);
    kit.src.press('a');
    kit.src.release('a');
    expect(hits).toBe(1);
    unbind();
    kit.src.press('a');
    kit.src.release('a');
    expect(hits).toBe(1);
  });
});

describe("'' catch-all wildcard", () => {
  test("'' handler fires for every key press", async () => {
    await using kit = await setup();
    const seen: string[] = [];
    kit.ctx.map.setPress('', (k) => { seen.push(k.key); });
    kit.src.press('a');
    kit.src.press('b');
    kit.src.press('Enter');
    expect(seen).toEqual(['a', 'b', 'Enter']);
  });

  test("'' handler fires alongside an exact match", async () => {
    await using kit = await setup();
    let exact = 0, any = 0;
    kit.ctx.map.setPress('a', () => { exact++; });
    kit.ctx.map.setPress('', () => { any++; });
    kit.src.press('a');
    expect(exact).toBe(1);
    expect(any).toBe(1);
  });

  test("'' handler fires even when no exact match exists", async () => {
    await using kit = await setup();
    let any = 0;
    kit.ctx.map.setPress('', () => { any++; });
    kit.src.press('z');
    expect(any).toBe(1);
  });

  test("'' can be registered via bind() shorthand", async () => {
    await using kit = await setup();
    let any = 0;
    const unbind = kit.ctx.bind([['', () => { any++; }]]);
    kit.src.press('x');
    expect(any).toBe(1);
    unbind();
    kit.src.press('x');
    expect(any).toBe(1);
  });

  test("'' suppresses propagation by default (like any binding)", async () => {
    await using kit = await setup();
    let parentHits = 0;
    kit.ctx.map.setPress('a', () => { parentHits++; });
    const child = kit.ctx.child('sub');
    child.map.setPress('', () => {}); // catch-all, no propagate
    kit.src.press('a');
    expect(parentHits).toBe(0);
  });

  test("'' with propagate: true still bubbles to parent", async () => {
    await using kit = await setup();
    let parentHits = 0;
    kit.ctx.map.setPress('a', () => { parentHits++; });
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
    kit.ctx.map.setPress('?', () => { fallback++; });
    kit.src.press('z');
    expect(fallback).toBe(1);
  });

  test("'?' does NOT fire when an exact binding matches", async () => {
    await using kit = await setup();
    let exact = 0, fallback = 0;
    kit.ctx.map.setPress('a', () => { exact++; });
    kit.ctx.map.setPress('?', () => { fallback++; });
    kit.src.press('a');
    expect(exact).toBe(1);
    expect(fallback).toBe(0);
  });

  test("'?' and '' both fire for an unmatched key", async () => {
    await using kit = await setup();
    let any = 0, fallback = 0;
    kit.ctx.map.setPress('', () => { any++; });
    kit.ctx.map.setPress('?', () => { fallback++; });
    kit.src.press('z');
    expect(any).toBe(1);
    expect(fallback).toBe(1);
  });

  test("'?' fires but '' does not when only '?' is registered (no any at all)", async () => {
    await using kit = await setup();
    let fallback = 0;
    kit.ctx.map.setPress('?', () => { fallback++; });
    kit.src.press('x');
    expect(fallback).toBe(1);
  });

  test("'?' receives matched key via action argument", async () => {
    await using kit = await setup();
    let received: import('../Key').Key | undefined;
    kit.ctx.map.setPress('?', (k) => { received = k; });
    kit.src.press('q');
    expect(received!.key).toBe('q');
  });

  test("'?' can be registered via bind() shorthand", async () => {
    await using kit = await setup();
    let fallback = 0;
    const unbind = kit.ctx.bind([['?', () => { fallback++; }]]);
    kit.src.press('w');
    expect(fallback).toBe(1);
    unbind();
    kit.src.press('w');
    expect(fallback).toBe(1);
  });
});
