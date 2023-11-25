import {Model} from '../..';

test('does not fire events after node is deleted', () => {
  const model = Model.withLogicalClock();
  model.api.root({
    foo: {
      bar: {
        baz: 'asdf',
      },
    },
  });
  const bar = model.api.obj(['foo', 'bar']);
  let cnt = 0;
  bar.events.changes.listen(() => {
    cnt++;
  });
  expect(cnt).toBe(0);
  bar.set({
    gg: 'wp',
  });
  expect(cnt).toBe(1);
  model.api.obj(['foo']).del(['bar']);
  model.api.obj(['foo']).set({gl: 'hf'});
  expect(cnt).toBe(1);
});
