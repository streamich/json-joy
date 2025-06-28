import {Model} from '..';

test('returns cached value, when shallow object keys not modified', () => {
  const model = Model.withLogicalClock();
  model.api.set({
    a: {
      value: 1,
    },
    b: {
      value: 2,
    },
  });
  const view1 = model.view();
  expect(view1).toStrictEqual({
    a: {value: 1},
    b: {value: 2},
  });
  model.api.obj(['a']).set({value: 3});
  const view2 = model.view();
  expect(view2).toStrictEqual({
    a: {value: 3},
    b: {value: 2},
  });
  expect((view1 as any).a).not.toBe((view2 as any).a);
  expect((view2 as any).b).toBe((view2 as any).b); // cache hit!
});

test('returns cached value, when shallow array is not modified', () => {
  const model = Model.withLogicalClock();
  model.api.set({
    a: [1],
    b: [2],
  });
  const view1 = model.view();
  expect(view1).toStrictEqual({
    a: [1],
    b: [2],
  });
  model.api.arr(['a']).ins(1, [3]);
  const view2 = model.view();
  expect(view2).toStrictEqual({
    a: [1, 3],
    b: [2],
  });
  expect((view1 as any).a).not.toBe((view2 as any).a);
  expect((view2 as any).b).toBe((view2 as any).b); // cache hit!
});

test('caches multiple levels deep objects', () => {
  const model = Model.withLogicalClock();
  model.api.set({
    foo: [
      {
        a: [{}],
        b: [{}],
      },
    ],
  });
  const view1 = model.view() as any;
  model.api.obj(['foo', 0, 'a', 0]).set({value: 1});
  const view2 = model.view() as any;
  expect(view1.foo !== view2.foo).toBe(true);
  expect(view1.foo[0] !== view2.foo[0]).toBe(true);
  expect(view1.foo[0].a !== view2.foo[0].a).toBe(true);
  expect(view1.foo[0].a[0] !== view2.foo[0].a[0]).toBe(true);
  expect(view1.foo[0].a[0].value).toBe(undefined);
  expect(view2.foo[0].a[0].value).toBe(1);
  expect(view1.foo[0].b === view2.foo[0].b).toBe(true); // cache hit!
  expect(view1.foo[0].b[0] === view2.foo[0].b[0]).toBe(true); // cache hit!
});
