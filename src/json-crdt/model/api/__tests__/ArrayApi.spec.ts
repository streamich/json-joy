import {Model} from '../../Model';

test('can insert a value and delete all previous ones', () => {
  const doc = Model.withLogicalClock();
  doc.api.root({
    arr: [1, 2, 3],
  });
  const arr = doc.api.arr(['arr']);
  const length = arr.length();
  arr.ins(length, [42]);
  arr.del(0, length);
  arr.ins(1, [69]);
  expect(arr.view()).toEqual([42, 69]);
});
