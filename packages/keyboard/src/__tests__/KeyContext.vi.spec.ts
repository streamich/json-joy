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

test('can create KeyContext', async () => {
  await using kit = await setup();
  let text = '';
  kit.ctx.map.onDown('a', () => text = 'hello');
  kit.src.press('a');
  expect(text).toBe('hello');
});
