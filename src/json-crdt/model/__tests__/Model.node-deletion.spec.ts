import {ValueLww} from '../../nodes/lww-value/ValueLww';
import {Model} from '../Model';

test('removes from index rewritten root nodes', () => {
  const doc = Model.withLogicalClock();
  doc.api.root(123);
  const rootValue = doc.root.val;
  expect(!!doc.index.get(rootValue)).toBe(true);
  doc.api.root(456);
  expect(!!doc.index.get(rootValue)).toBe(false);
});

test('removes from index rewritten object keys', () => {
  const doc = Model.withLogicalClock();
  doc.api.root({
    foo: 123,
  });
  const obj = doc.api.obj([]).node;
  const keyValue = obj.keys.get('foo')!;
  expect(!!doc.index.get(keyValue)).toBe(true);
  doc.api.obj([]).set({foo: 456});
  expect(!!doc.index.get(keyValue)).toBe(false);
});

test('removes from index deleted object keys', () => {
  const doc = Model.withLogicalClock();
  doc.api.root({
    foo: 123,
  });
  const obj = doc.api.obj([]).node;
  const keyValue = obj.keys.get('foo')!;
  expect(!!doc.index.get(keyValue)).toBe(true);
  doc.api.obj([]).del(['foo']);
  expect(!!doc.index.get(keyValue)).toBe(false);
});

test('removes from index rewritten ValueLww register values', () => {
  const doc = Model.withLogicalClock();
  doc.api.root([123]);
  const register = doc.api.val([0]).node;
  expect(register).toBeInstanceOf(ValueLww);
  const oldValue = register.val;
  expect(!!doc.index.get(oldValue)).toBe(true);
  doc.api.val([0]).set(456);
  expect(!!doc.index.get(oldValue)).toBe(false);
});

test('removes from index deleted array element nodes', () => {
  const doc = Model.withLogicalClock();
  doc.api.root([123, 456]);
  const val1 = doc.api.val([0]).node.id;
  const val2 = doc.api.val([1]).node.id;
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val2)).toBe(true);
  doc.api.arr([]).del(0, 2);
  expect(!!doc.index.get(val1)).toBe(false);
  expect(!!doc.index.get(val2)).toBe(false);
});

test('removes from index recursively after object key overwrite', () => {
  const doc = Model.withLogicalClock();
  doc.api.root({
    foo: {
      bar: 123,
      baz: [123],
    },
  });
  const val1 = doc.api.obj(['foo']).node.id;
  const val2 = doc.api.const(['foo', 'bar']).node.id;
  const val3 = doc.api.arr(['foo', 'baz']).node.id;
  const val4 = doc.api.val(['foo', 'baz', 0]).node.id;
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val2)).toBe(true);
  expect(!!doc.index.get(val3)).toBe(true);
  expect(!!doc.index.get(val4)).toBe(true);
  doc.api.obj([]).set({foo: 'adsf'});
  expect(!!doc.index.get(val1)).toBe(false);
  expect(!!doc.index.get(val2)).toBe(false);
  expect(!!doc.index.get(val3)).toBe(false);
  expect(!!doc.index.get(val4)).toBe(false);
});

test('removes from index recursively after array element delete', () => {
  const doc = Model.withLogicalClock();
  doc.api.root([
    0,
    1,
    {
      foo: {
        bar: 123,
        baz: [123],
      },
    },
  ]);
  const val1 = doc.api.obj([2, 'foo']).node.id;
  const val2 = doc.api.const([2, 'foo', 'bar']).node.id;
  const val3 = doc.api.arr([2, 'foo', 'baz']).node.id;
  const val4 = doc.api.val([2, 'foo', 'baz', 0]).node.id;
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val2)).toBe(true);
  expect(!!doc.index.get(val3)).toBe(true);
  expect(!!doc.index.get(val4)).toBe(true);
  doc.api.arr([]).del(2, 1);
  expect(!!doc.index.get(val1)).toBe(false);
  expect(!!doc.index.get(val2)).toBe(false);
  expect(!!doc.index.get(val3)).toBe(false);
  expect(!!doc.index.get(val4)).toBe(false);
});

test('removes from index recursively after LWW register write', () => {
  const doc = Model.withLogicalClock();
  doc.api.root([0, 1, 2]);
  doc.api.val([2]).set({
    foo: {
      bar: 123,
      baz: [123],
    },
  });
  const val0 = doc.api.val([2]).node.id;
  const val1 = doc.api.obj([2, 'foo']).node.id;
  const val2 = doc.api.const([2, 'foo', 'bar']).node.id;
  const val3 = doc.api.arr([2, 'foo', 'baz']).node.id;
  const val4 = doc.api.val([2, 'foo', 'baz', 0]).node.id;
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val2)).toBe(true);
  expect(!!doc.index.get(val3)).toBe(true);
  expect(!!doc.index.get(val4)).toBe(true);
  doc.api.val([2]).set(123);
  expect(!!doc.index.get(val0)).toBe(true);
  expect(!!doc.index.get(val1)).toBe(false);
  expect(!!doc.index.get(val2)).toBe(false);
  expect(!!doc.index.get(val3)).toBe(false);
  expect(!!doc.index.get(val4)).toBe(false);
});

test('removes from index recursively after LWW register write', () => {
  const doc = Model.withLogicalClock();
  doc.api.root([0, 1, 2]);
  doc.api.val([2]).set({
    foo: {
      bar: 123,
      baz: [123],
    },
  });
  const val0 = doc.api.val([2]).node.id;
  const val1 = doc.api.obj([2, 'foo']).node.id;
  const val2 = doc.api.const([2, 'foo', 'bar']).node.id;
  const val3 = doc.api.arr([2, 'foo', 'baz']).node.id;
  const val4 = doc.api.val([2, 'foo', 'baz', 0]).node.id;
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val2)).toBe(true);
  expect(!!doc.index.get(val3)).toBe(true);
  expect(!!doc.index.get(val4)).toBe(true);
  doc.api.root(123);
  expect(!!doc.index.get(val0)).toBe(false);
  expect(!!doc.index.get(val1)).toBe(false);
  expect(!!doc.index.get(val2)).toBe(false);
  expect(!!doc.index.get(val3)).toBe(false);
  expect(!!doc.index.get(val4)).toBe(false);
});
