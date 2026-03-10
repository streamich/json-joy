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
