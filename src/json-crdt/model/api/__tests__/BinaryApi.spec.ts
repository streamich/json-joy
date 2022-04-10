import {Model} from '../../Model';

test('can edit a simple binary', () => {
  const doc = Model.withLogicalClock();
  const api = doc.api;
  api.root([0, new Uint8Array([1, 2, 3]), 2]).commit();
  const bin = api.bin([1]);
  bin.ins(0, new Uint8Array([0])).commit();
  bin.ins(4, new Uint8Array([44, 4, 4, 4, 4])).commit();
  bin.ins(9, new Uint8Array([77, 7, 7, 7, 7, 7, 7, 7])).commit();
  bin.del(9, 1).commit();
  const result = new Uint8Array([0, 1, 2, 3, 44, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7]);
  expect(bin.toView()).toStrictEqual(result);
  expect(doc.toView()).toStrictEqual([0, result, 2]);
});

test('can delete across two chunks', () => {
  const doc = Model.withLogicalClock();
  const api = doc.api;
  api.root(new Uint8Array([])).commit();
  const bin = api.bin([]);
  bin.ins(0, new Uint8Array([1, 1, 1])).commit();
  bin.ins(0, new Uint8Array([2, 2, 2])).commit();
  bin.ins(0, new Uint8Array([3, 3, 3])).commit();
  bin.del(1, 7).commit();
  expect(bin.toView()).toEqual(new Uint8Array([3, 1]));
});
