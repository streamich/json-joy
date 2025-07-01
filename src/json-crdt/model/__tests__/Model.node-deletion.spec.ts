import {s} from '../../../json-crdt-patch';
import {ValNode} from '../../nodes';
import {Model} from '../Model';

test('removes from index rewritten root nodes', () => {
  const doc = Model.create();
  doc.api.set(123);
  const rootValue = doc.root.val;
  expect(!!doc.index.get(rootValue)).toBe(true);
  doc.api.set(456);
  expect(!!doc.index.get(rootValue)).toBe(false);
});

test('removes from index rewritten object keys', () => {
  const doc = Model.create();
  doc.api.set({
    foo: 123,
  });
  const obj = doc.api.obj([]).node;
  const keyValue = obj.keys.get('foo')!;
  expect(!!doc.index.get(keyValue)).toBe(true);
  doc.api.obj([]).set({foo: 456});
  expect(!!doc.index.get(keyValue)).toBe(false);
});

test('removes from index deleted object keys', () => {
  const doc = Model.create();
  doc.api.set({
    foo: 123,
  });
  const obj = doc.api.obj([]).node;
  const keyValue = obj.keys.get('foo')!;
  expect(!!doc.index.get(keyValue)).toBe(true);
  doc.api.obj([]).del(['foo']);
  expect(!!doc.index.get(keyValue)).toBe(false);
});

test('removes from index rewritten ValNode register values', () => {
  const doc = Model.create();
  doc.api.set([123]);
  const register = doc.api.val([0]).node;
  expect(register).toBeInstanceOf(ValNode);
  const oldValue = register.val;
  expect(!!doc.index.get(oldValue)).toBe(true);
  doc.api.val([0]).set(456);
  expect(!!doc.index.get(oldValue)).toBe(false);
});

test('removes from index deleted array element nodes', () => {
  const doc = Model.create();
  doc.api.set([123, 456]);
  const val1 = doc.api.val([0]).node.id;
  const val2 = doc.api.val([1]).node.id;
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val2)).toBe(true);
  doc.api.arr([]).del(0, 2);
  expect(!!doc.index.get(val1)).toBe(false);
  expect(!!doc.index.get(val2)).toBe(false);
});

test('removes from index recursively after object key overwrite', () => {
  const doc = Model.create();
  doc.api.set({
    foo: {
      bar: 123,
      baz: [123],
    },
  });
  const val1 = doc.api.obj(['foo']).node.id;
  const val2 = doc.api.con(['foo', 'bar']).node.id;
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
  const doc = Model.create();
  doc.api.set([
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
  const val2 = doc.api.con([2, 'foo', 'bar']).node.id;
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
  const doc = Model.create();
  doc.api.set([0, 1, 2]);
  doc.api.val([2]).set({
    foo: {
      bar: 123,
      baz: [123],
    },
  });
  const val0 = doc.api.val([2]).node.id;
  const val1 = doc.api.obj([2, 'foo']).node.id;
  const val2 = doc.api.con([2, 'foo', 'bar']).node.id;
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
  const doc = Model.create();
  doc.api.set([0, 1, 2]);
  doc.api.val([2]).set({
    foo: {
      bar: 123,
      baz: [123],
    },
  });
  const val0 = doc.api.val([2]).node.id;
  const val1 = doc.api.obj([2, 'foo']).node.id;
  const val2 = doc.api.con([2, 'foo', 'bar']).node.id;
  const val3 = doc.api.arr([2, 'foo', 'baz']).node.id;
  const val4 = doc.api.val([2, 'foo', 'baz', 0]).node.id;
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val1)).toBe(true);
  expect(!!doc.index.get(val2)).toBe(true);
  expect(!!doc.index.get(val3)).toBe(true);
  expect(!!doc.index.get(val4)).toBe(true);
  doc.api.set(123);
  expect(!!doc.index.get(val0)).toBe(false);
  expect(!!doc.index.get(val1)).toBe(false);
  expect(!!doc.index.get(val2)).toBe(false);
  expect(!!doc.index.get(val3)).toBe(false);
  expect(!!doc.index.get(val4)).toBe(false);
});

test('calling .view() on dangling "obj" when it was deleted, should not throw', () => {
  const doc = Model.create().setSchema(
    s.obj({
      foo: s.obj({
        bar: s.obj({
          baz: s.con(123),
          qux: s.str('asdf'),
        }),
      }),
    }),
  );

  const bar = doc.root.child()!.get('foo')!.get('bar')!;
  const baz = bar.get('baz')!;
  const qux = bar.get('qux')!;
  expect(bar.view()).toStrictEqual({
    baz: 123,
    qux: 'asdf',
  });
  doc.api.obj(['foo']).del(['bar']);
  expect(bar.view()).toStrictEqual({});
  expect((bar + '').includes(bar.id.time + '')).toBe(true);
  expect(baz.view()).toBe(123);
  expect(qux.view()).toBe('asdf');
});

test('calling .view() on dangling "arr" when it was deleted, should not throw', () => {
  const doc = Model.create().setSchema(
    s.obj({
      foo: s.obj({
        bar: s.arr([s.con(123), s.str('asdf')]),
      }),
    }),
  );
  const bar = doc.root.child()!.get('foo')!.get('bar')!;
  expect(bar.view()).toStrictEqual([123, 'asdf']);
  doc.api.obj(['foo']).del(['bar']);
  expect(bar.view()).toStrictEqual([]);
  expect((bar + '').includes(bar.id.time + '')).toBe(true);
});

test('calling .view() on dangling "vec" when it was deleted, should not throw', () => {
  const doc = Model.create().setSchema(
    s.obj({
      foo: s.obj({
        bar: s.vec(s.con(123), s.str('asdf')),
      }),
    }),
  );
  const bar = doc.root.child()!.get('foo')!.get('bar')!;
  expect(bar.view()).toStrictEqual([123, 'asdf']);
  doc.api.obj(['foo']).del(['bar']);
  expect(bar.view()).toStrictEqual([undefined, undefined]);
  expect((bar + '').includes(bar.id.time + '')).toBe(true);
});

test('calling .view() on dangling "val" when it was deleted, should not throw', () => {
  const doc = Model.create().setSchema(
    s.obj({
      foo: s.obj({
        bar: s.val(s.str('asdf')),
      }),
    }),
  );
  const bar = doc.root.child()!.get('foo')!.get('bar')!;
  expect(bar.view()).toStrictEqual('asdf');
  doc.api.obj(['foo']).del(['bar']);
  expect(bar.view()).toStrictEqual(undefined);
  expect((bar + '').includes(bar.id.time + '')).toBe(true);
});
