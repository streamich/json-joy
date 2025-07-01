import {Model} from '../../Model';

describe('string manipulation', () => {
  test('can edit strings', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set('');
    api.str([]).ins(0, 'var foo = bar');
    api.str([]).ins(10, '"');
    api.str([]).ins(14, '";');
    api.str([]).del(0, 3);
    api.str([]).ins(0, 'const');
    expect(doc.view()).toBe('const foo = "bar";');
  });

  test('can edit strings - 2', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set({foo: [123, '', 5]});
    api.str(['foo', 1]).ins(0, 'var foo = bar');
    api.str(['foo', 1]).ins(10, '"');
    api.str(['foo', 1]).ins(14, '";');
    api.str(['foo', 1]).del(0, 3);
    api.str(['foo', 1]).ins(0, 'const');
    expect(doc.view()).toEqual({
      foo: [123, 'const foo = "bar";', 5],
    });
  });
});

describe('number manipulation', () => {
  test('can edit numbers in object', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set({
      a: [
        {
          b: 123,
        },
      ],
    });
    expect(doc.view()).toEqual({
      a: [
        {
          b: 123,
        },
      ],
    });
    api.obj(['a', 0]).set({b: 0.5});
    expect(doc.view()).toEqual({
      a: [
        {
          b: 0.5,
        },
      ],
    });
  });

  test('can edit numbers in arrays', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set({
      a: [123],
    });
    expect(doc.view()).toEqual({
      a: [123],
    });
    api.val(['a', 0]).set(0.5);
    expect(doc.view()).toEqual({
      a: [0.5],
    });
  });
});

describe('array manipulation', () => {
  test('can edit arrays', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set([]);
    expect(doc.view()).toEqual([]);
    api.arr([]).ins(0, [1, 2, true, null, false, 'asdf']);
    expect(doc.view()).toEqual([1, 2, true, null, false, 'asdf']);
    api.arr([]).ins(0, [0]);
    expect(doc.view()).toEqual([0, 1, 2, true, null, false, 'asdf']);
    api.arr([]).ins(3, [{4: '4'}, 'five']);
    expect(doc.view()).toEqual([0, 1, 2, {4: '4'}, 'five', true, null, false, 'asdf']);
    api.arr([]).del(0, 5);
    expect(doc.view()).toEqual([true, null, false, 'asdf']);
  });
});

describe('object manipulation', () => {
  test('can create objects', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set({a: {}});
    expect(doc.view()).toEqual({a: {}});
    api.obj([]).set({gg: true});
    expect(doc.view()).toEqual({a: {}, gg: true});
    api.obj(['a']).set({1: 1, 2: 2});
    expect(doc.view()).toEqual({a: {'1': 1, '2': 2}, gg: true});
  });

  test('can delete object keys', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set({a: 'a'});
    expect(doc.view()).toEqual({a: 'a'});
    api.obj([]).set({b: 'b', c: {c: 'c'}});
    expect(doc.view()).toEqual({a: 'a', b: 'b', c: {c: 'c'}});
    api.obj(['c']).set({c: undefined});
    expect(doc.view()).toEqual({a: 'a', b: 'b', c: {}});
    api.obj([]).set({c: undefined});
    expect(doc.view()).toEqual({a: 'a', b: 'b'});
    api.obj([]).set({b: undefined});
    expect(doc.view()).toEqual({a: 'a'});
    api.obj([]).set({a: undefined});
    expect(doc.view()).toEqual({});
    api.set({gg: 'bet'});
    expect(doc.view()).toEqual({gg: 'bet'});
  });

  test('can use ID to insert in object', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set({a: 'a'});
    expect(doc.view()).toEqual({a: 'a'});
    const str = api.builder.str();
    api.obj('').set({
      b: str,
    });
    expect(doc.view()).toEqual({a: 'a', b: ''});
  });

  test('can use ID to insert in array', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set([1, 2]);
    expect(doc.view()).toEqual([1, 2]);
    const str = api.builder.str();
    api.arr('').ins(1, [str]);
    expect(doc.view()).toEqual([1, '', 2]);
  });
});
