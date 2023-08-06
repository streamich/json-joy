import {onlyOnNode20} from '../../../../__tests__/util';
import {Model} from '../../Model';

describe('string manipulation', () => {
  test('can edit strings', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root('');
    api.str([]).ins(0, 'var foo = bar');
    api.str([]).ins(10, '"');
    api.str([]).ins(14, '";');
    api.str([]).del(0, 3);
    api.str([]).ins(0, 'const');
    expect(doc.view()).toBe('const foo = "bar";');
  });

  test('can edit strings - 2', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({foo: [123, '', 5]});
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
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({
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
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({
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
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root([]);
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
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({a: {}});
    expect(doc.view()).toEqual({a: {}});
    api.obj([]).set({gg: true});
    expect(doc.view()).toEqual({a: {}, gg: true});
    api.obj(['a']).set({1: 1, 2: 2});
    expect(doc.view()).toEqual({a: {'1': 1, '2': 2}, gg: true});
  });

  test('can delete object keys', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({a: 'a'});
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
    api.root({gg: 'bet'});
    expect(doc.view()).toEqual({gg: 'bet'});
  });

  test('can use ID to insert in object', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root({a: 'a'});
    expect(doc.view()).toEqual({a: 'a'});
    const str = api.builder.str();
    api.obj('').set({
      b: str,
    });
    expect(doc.view()).toEqual({a: 'a', b: ''});
  });

  test('can use ID to insert in array', () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    api.root([1, 2]);
    expect(doc.view()).toEqual([1, 2]);
    const str = api.builder.str();
    api.arr('').ins(1, [str]);
    expect(doc.view()).toEqual([1, '', 2]);
  });
});

onlyOnNode20('events', () => {
  test('dispatches "change" events on document change', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    let cnt = 0;
    api.root({a: {}});
    expect(cnt).toBe(0);
    api.events.addEventListener('change', () => {
      cnt++;
    });
    api.obj([]).set({gg: true});
    await Promise.resolve();
    expect(cnt).toBe(1);
    api.obj(['a']).set({1: 1, 2: 2});
    await Promise.resolve();
    expect(cnt).toBe(2);
  });

  test('fires change event for each executed update', async () => {
    const doc = Model.withLogicalClock();
    const api = doc.api;
    let cnt = 0;
    api.root({a: {}});
    expect(cnt).toBe(0);
    api.events.addEventListener('change', () => {
      cnt++;
    });
    api.obj([]).set({gg: true});
    api.obj([]).set({gg: false});
    await Promise.resolve();
    expect(cnt).toBe(1);
  });
});
