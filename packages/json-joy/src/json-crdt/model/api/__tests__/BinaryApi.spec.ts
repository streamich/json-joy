import {s} from '../../../../json-crdt-patch';
import {Model} from '../../Model';

test('can edit a simple binary', () => {
  const doc = Model.create();
  const api = doc.api;
  api.set([0, new Uint8Array([1, 2, 3]), 2]);
  const bin = api.bin([1]);
  bin.ins(0, new Uint8Array([0]));
  bin.ins(4, new Uint8Array([44, 4, 4, 4, 4]));
  bin.ins(9, new Uint8Array([77, 7, 7, 7, 7, 7, 7, 7]));
  bin.del(9, 1);
  const result = new Uint8Array([0, 1, 2, 3, 44, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7]);
  expect(bin.view()).toStrictEqual(result);
  expect(doc.view()).toStrictEqual([0, result, 2]);
});

test('can silently return `undefined` on missing node', () => {
  const doc = Model.create({a: new Uint8Array([]), b: 123});
  const api = doc.api;
  api.bin('/a');
  api.bin('/a', true);
  expect(() => api.bin('/b')).toThrow();
  api.bin('/b', true);
  expect(() => api.bin('/c')).toThrow();
  api.bin('/c', true);
});

test('can delete across two chunks', () => {
  const doc = Model.create();
  const api = doc.api;
  api.set(new Uint8Array([]));
  const bin = api.bin([]);
  bin.ins(0, new Uint8Array([1, 1, 1]));
  bin.ins(0, new Uint8Array([2, 2, 2]));
  bin.ins(0, new Uint8Array([3, 3, 3]));
  bin.del(1, 7);
  expect(bin.view()).toEqual(new Uint8Array([3, 1]));
});

test('.length()', () => {
  const doc = Model.create().setSchema(
    s.obj({
      bin: s.bin(new Uint8Array([1, 2, 3])),
    }),
  );
  expect(doc.api.s._.bin.$.length()).toBe(3);
});
