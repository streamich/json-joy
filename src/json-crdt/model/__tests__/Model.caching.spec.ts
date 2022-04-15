import {Model} from "..";

test('returns cached value, when shallow object keys not modified', () => {
  const model = Model.withLogicalClock();
  model.api.root({
    a: {
      value: 1,
    },
    b: {
      value: 2,
    },
  });
  model.api.commit();
  const view1 = model.toView();
  expect(view1).toStrictEqual({
    a: {value: 1},
    b: {value: 2},
  });
  model.api.val(['a', 'value']).set(3);
  model.api.commit();
  const view2 = model.toView();
  expect(view2).toStrictEqual({
    a: {value: 3},
    b: {value: 2},
  });
  expect((view1 as any).a).not.toBe((view2 as any).a);
  expect((view2 as any).b).toBe((view2 as any).b); // cache hit!
});

test('returns cached value, when shallow array is not modified', () => {
  const model = Model.withLogicalClock();
  model.api.root({
    a: [1],
    b: [2],
  });
  model.api.commit();
  const view1 = model.toView();
  expect(view1).toStrictEqual({
    a: [1],
    b: [2],
  });
  model.api.arr(['a']).ins(1, [3]);
  model.api.commit();
  const view2 = model.toView();
  expect(view2).toStrictEqual({
    a: [1, 3],
    b: [2],
  });
  expect((view1 as any).a).not.toBe((view2 as any).a);
  expect((view2 as any).b).toBe((view2 as any).b); // cache hit!
});
