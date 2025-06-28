import {Model} from '../..';

test('does not fire events after node is deleted', async () => {
  const model = Model.withLogicalClock();
  model.api.set({
    foo: {
      bar: {
        baz: 'asdf',
      },
    },
  });
  const bar = model.api.obj(['foo', 'bar']);
  let cnt = 0;
  bar.events.onViewChanges.listen(() => {
    cnt++;
  });
  expect(cnt).toBe(0);
  bar.set({
    gg: 'wp',
  });
  await Promise.resolve();
  expect(cnt).toBe(1);
  model.api.obj(['foo']).del(['bar']);
  model.api.obj(['foo']).set({gl: 'hf'});
  expect(cnt).toBe(1);
});
