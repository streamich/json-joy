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
