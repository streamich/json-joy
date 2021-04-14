import {Model} from '../../model';

test('can edit a simple string', () => {
  const doc = new Model();
  const api = doc.api;
  api.root([0, '123', 2]).commit();
  const str = api.str([1]);
  str.ins(0, '0');
  str.ins(4, '-xxxx');
  str.ins(9, '-yyyyyyyy');
  str.del(9, 1);
  expect(str.toJson()).toEqual('0123-xxxxyyyyyyyy');
  expect(str.toString()).toEqual('0123-xxxxyyyyyyyy');
  expect(doc.toJson()).toEqual([0, '0123-xxxxyyyyyyyy', 2]);
});

test('can delete across two chunks', () => {
  const doc = new Model();
  const api = doc.api;
  api.root('').commit();
  const str = api.str([]);
  str.ins(0, 'aaa');
  str.ins(0, 'bbb');
  str.ins(0, 'ccc');
  str.del(1, 7);
  expect(str.toJson()).toEqual('ca');
});
