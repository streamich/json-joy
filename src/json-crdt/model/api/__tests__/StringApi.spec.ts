import {Model} from '../../Model';

test('can edit a simple string', () => {
  const doc = Model.withLogicalClock();
  const api = doc.api;
  api.root([0, '123', 2]).commit();
  const str = api.str([1]);
  str.ins(0, '0').commit();
  str.ins(4, '-xxxx').commit();
  str.ins(9, '-yyyyyyyy').commit();
  str.del(9, 1).commit();
  expect(str.toView()).toEqual('0123-xxxxyyyyyyyy');
  expect(doc.toJson()).toEqual([0, '0123-xxxxyyyyyyyy', 2]);
});

test('can delete across two chunks', () => {
  const doc = Model.withLogicalClock();
  const api = doc.api;
  api.root('').commit();
  const str = api.str([]);
  str.ins(0, 'aaa').commit();
  str.ins(0, 'bbb').commit();
  str.ins(0, 'ccc').commit();
  str.del(1, 7).commit();
  expect(str.toView()).toEqual('ca');
});
