import {Model} from '../Model';

test('"obj" node returns same object if deep equality does not change', () => {
  const model = Model.create();
  model.api.set({
    foo: 'bar',
    qux: [1, 2, 3],
  });
  const view1 = model.view();
  const time1 = model.clock.time;
  model.api.obj([]).set({
    foo: 'bar',
  });
  model.api.val(['qux', 1]).set(2);
  const view2 = model.view();
  const time2 = model.clock.time;
  expect(view1).toBe(view2);
  expect(time2 > time1).toBe(true);
});
