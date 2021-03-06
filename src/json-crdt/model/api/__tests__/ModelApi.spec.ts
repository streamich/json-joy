import {Model} from '../../Model';

describe('string manipulation', () => {
  test('can edit strings', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api
      .root('')
      .commit();
    api.strIns([], 0, 'var foo = bar')
      .commit();
    api.strIns([], 10, '"')
      .commit();
    api.strIns([], 14, '";')
      .commit();
    api.strDel([], 0, 3)
      .commit();
    api.strIns([], 0, 'const')
      .commit();
    expect(doc.toJson()).toBe('const foo = "bar";');
  });

  test('can edit strings - 2', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api
      .root({foo: [123, '', 5]})
      .commit();
    api
      .strIns(['foo', 1], 0, 'var foo = bar')
      .commit();
    api.strIns(['foo', 1], 10, '"')
      .commit()
    api.strIns(['foo', 1], 14, '";')
      .commit();
    api.strDel(['foo', 1], 0, 3)
      .commit()
    api.strIns(['foo', 1], 0, 'const')
      .commit();
    expect(doc.toJson()).toEqual({
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
    expect(doc.toJson()).toEqual({
      a: [
        {
          b: 123,
        },
      ],
    });
    api.valSet(['a', 0, 'b'], 0.5);
    expect(doc.toJson()).toEqual({
      a: [
        {
          b: 123,
        },
      ],
    });
    api.commit();
    expect(doc.toJson()).toEqual({
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
    expect(doc.toJson()).toEqual({
      a: [123],
    });
    api.valSet(['a', 0], 0.5);
    expect(doc.toJson()).toEqual({
      a: [123],
    });
    api.commit();
    expect(doc.toJson()).toEqual({
      a: [0.5],
    });
  });
});

describe('array manipulation', () => {
  test('can edit arrays', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root([]).commit();
    expect(doc.toJson()).toEqual([]);
    api.patch(() => {
      api.arrIns([], 0, [1, 2, true, null, false, 'asdf']);
    });
    expect(doc.toJson()).toEqual([1, 2, true, null, false, 'asdf']);
    api.arrIns([], 0, [0]).commit();
    expect(doc.toJson()).toEqual([0, 1, 2, true, null, false, 'asdf']);
    api.arrIns([], 3, [{4: '4'}, 'five']).commit();
    expect(doc.toJson()).toEqual([0, 1, 2, {4: '4'}, 'five', true, null, false, 'asdf']);
    api.arrDel([], 0, 5).commit();
    expect(doc.toJson()).toEqual([true, null, false, 'asdf']);
  });
});

describe('object manipulation', () => {
  test('can create objects', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({a: {}}).commit();
    expect(doc.toJson()).toEqual({a: {}});
    api.objSet([], {gg: true}).commit();
    expect(doc.toJson()).toEqual({a: {}, gg: true});
    api.objSet(['a'], {1: 1, 2: 2}).commit();
    expect(doc.toJson()).toEqual({a: {'1': 1, '2': 2}, gg: true});
  });

  test('can delete object keys', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({a: 'a'}).commit();
    expect(doc.toJson()).toEqual({a: 'a'});
    api.objSet([], {b: 'b', c: {c: 'c'}}).commit();
    expect(doc.toJson()).toEqual({a: 'a', b: 'b', c: {c: 'c'}});
    api.objSet(['c'], {c: undefined}).commit();
    expect(doc.toJson()).toEqual({a: 'a', b: 'b', c: {}});
    api.objSet([], {c: undefined}).commit();
    expect(doc.toJson()).toEqual({a: 'a', b: 'b'});
    api.objSet([], {b: undefined}).commit();
    expect(doc.toJson()).toEqual({a: 'a'});
    api.objSet([], {a: undefined}).commit();
    expect(doc.toJson()).toEqual({});
    api.root({gg: 'bet'}).commit();
    expect(doc.toJson()).toEqual({gg: 'bet'});
  });
});

describe('patch()', () => {
  test('can patch multiple operations into a single patch', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({foo: 'abc'}).commit();
    expect(api.patches.length).toBe(1);
    expect(doc.toJson()).toEqual({foo: 'abc'});
    api.patch(() => {
      api.strIns(['foo'], 1, '1');
      api.strIns(['foo'], 3, '2');
    });
    expect(api.patches.length).toBe(2);
    expect(doc.toJson()).toEqual({foo: 'a1bc2'});
  });
});
