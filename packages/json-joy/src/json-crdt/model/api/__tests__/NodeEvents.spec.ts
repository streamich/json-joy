import {Model} from '../..';
import {ChangeEvent, ChangeEventOrigin} from '../events';

test('does not fire events after node is deleted', async () => {
  const model = Model.create();
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

test.only('emits "Local" origin on local changes', async () => {
  const model = Model.create({foo: 'bar'});
  model.s.foo.$.events.onChange((event: ChangeEvent) => {
    expect(event.origin()).toBe(ChangeEventOrigin.Local);
    expect(event.isLocal()).toBe(true);
  });
  model.s.foo.$.ins(3, '!');

  console.log(model + '');
});
