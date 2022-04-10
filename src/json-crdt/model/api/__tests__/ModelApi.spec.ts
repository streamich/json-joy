import {Model} from '../../Model';

describe('string manipulation', () => {
  test('can edit strings', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root('').commit();
    api.str([]).ins(0, 'var foo = bar').commit();
    api.str([]).ins(10, '"').commit();
    api.str([]).ins(14, '";').commit();
    api.str([]).del(0, 3).commit();
    api.str([]).ins(0, 'const').commit();
    expect(doc.toView()).toBe('const foo = "bar";');
  });

  test('can edit strings - 2', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({foo: [123, '', 5]}).commit();
    api.str(['foo', 1]).ins(0, 'var foo = bar').commit();
    api.str(['foo', 1]).ins(10, '"').commit();
    api.str(['foo', 1]).ins(14, '";').commit();
    api.str(['foo', 1]).del(0, 3).commit();
    api.str(['foo', 1]).ins(0, 'const').commit();
    expect(doc.toView()).toEqual({
      foo: [123, 'const foo = "bar";', 5],
    });
  });
});

describe('number manipulation', () => {
  test('can edit numbers in object', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api
      .root({
        a: [
          {
            b: 123,
          },
        ],
      })
      .commit();
    expect(doc.toView()).toEqual({
      a: [
        {
          b: 123,
        },
      ],
    });
    api.val(['a', 0, 'b']).set(0.5);
    expect(doc.toView()).toEqual({
      a: [
        {
          b: 123,
        },
      ],
    });
    api.commit();
    expect(doc.toView()).toEqual({
      a: [
        {
          b: 0.5,
        },
      ],
    });
  });

  test('can edit numbers in arrays', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api
      .root({
        a: [123],
      })
      .commit();
    expect(doc.toView()).toEqual({
      a: [123],
    });
    api.val(['a', 0]).set(0.5);
    expect(doc.toView()).toEqual({
      a: [123],
    });
    api.commit();
    expect(doc.toView()).toEqual({
      a: [0.5],
    });
  });
});

describe('array manipulation', () => {
  test('can edit arrays', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root([]).commit();
    expect(doc.toView()).toEqual([]);
    api.patch(() => {
      api.arr([]).ins(0, [1, 2, true, null, false, 'asdf']);
    });
    expect(doc.toView()).toEqual([1, 2, true, null, false, 'asdf']);
    api.arr([]).ins(0, [0]).commit();
    expect(doc.toView()).toEqual([0, 1, 2, true, null, false, 'asdf']);
    api
      .arr([])
      .ins(3, [{4: '4'}, 'five'])
      .commit();
    expect(doc.toView()).toEqual([0, 1, 2, {4: '4'}, 'five', true, null, false, 'asdf']);
    api.arr([]).del(0, 5).commit();
    expect(doc.toView()).toEqual([true, null, false, 'asdf']);
  });
});

describe('object manipulation', () => {
  test('can create objects', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({a: {}}).commit();
    expect(doc.toView()).toEqual({a: {}});
    api.obj([]).set({gg: true}).commit();
    expect(doc.toView()).toEqual({a: {}, gg: true});
    api.obj(['a']).set({1: 1, 2: 2}).commit();
    expect(doc.toView()).toEqual({a: {'1': 1, '2': 2}, gg: true});
  });

  test('can delete object keys', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({a: 'a'}).commit();
    expect(doc.toView()).toEqual({a: 'a'});
    api
      .obj([])
      .set({b: 'b', c: {c: 'c'}})
      .commit();
    expect(doc.toView()).toEqual({a: 'a', b: 'b', c: {c: 'c'}});
    api.obj(['c']).set({c: undefined}).commit();
    expect(doc.toView()).toEqual({a: 'a', b: 'b', c: {}});
    api.obj([]).set({c: undefined}).commit();
    expect(doc.toView()).toEqual({a: 'a', b: 'b'});
    api.obj([]).set({b: undefined}).commit();
    expect(doc.toView()).toEqual({a: 'a'});
    api.obj([]).set({a: undefined}).commit();
    expect(doc.toView()).toEqual({});
    api.root({gg: 'bet'}).commit();
    expect(doc.toView()).toEqual({gg: 'bet'});
  });
});

describe('patch()', () => {
  test('can patch multiple operations into a single patch', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({foo: 'abc'}).commit();
    expect(api.patches.length).toBe(1);
    expect(doc.toView()).toEqual({foo: 'abc'});
    api.patch(() => {
      api.str(['foo']).ins(1, '1');
      api.str(['foo']).ins(3, '2');
    });
    expect(api.patches.length).toBe(2);
    expect(doc.toView()).toEqual({foo: 'a1bc2'});
  });
});
