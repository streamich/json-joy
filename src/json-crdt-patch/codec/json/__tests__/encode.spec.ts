import {LogicalClock, LogicalTimestamp} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {encode} from '../encode';

test('encodes a simple patch', () => {
  const clock = new LogicalClock(3, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 3));
  const encoded = encode(builder.patch);
  expect(encoded).toEqual({
    id: [ 3, 5 ],
    ops: [
      { op: 'root', value: [0, 3] }
    ]
  });
});

test('create {foo: "bar"} object', () => {
  const clock = new LogicalClock(5, 25);
  const builder = new PatchBuilder(clock);
  
  const strId = builder.str();
  builder.insStr(strId, 'bar');
  const objId = builder.obj();
  builder.setKeys(objId, [['foo', strId]]);
  builder.root(objId);

  const encoded = encode(builder.patch);
  expect(encoded).toEqual({
    id: [ 5, 25 ],
    ops: [
      { op: 'str' }, // 25
      { op: 'str_ins', after: [5, 25], value: 'bar' }, // 26-28
      { op: 'obj' }, // 29
      { op: 'obj_set', obj: [5, 29], tuples: [['foo', [5, 25]]] }, // 30
      { op: 'root', value: [5, 29] } // 31
    ]
  });
});

test('test all operations', () => {
  const clock = new LogicalClock(3, 100);
  const builder = new PatchBuilder(clock);

  const strId = builder.str();
  const strInsertId = builder.insStr(strId, 'qq');
  const arrId = builder.arr();
  const objId = builder.obj();
  builder.setKeys(objId, [['foo', strId], ['hmm', arrId]]);
  const numId = builder.num();
  builder.setNum(numId, 123.4);
  const numInsertionId = builder.insArr(arrId, arrId, [numId])
  builder.root(objId);
  builder.del(numInsertionId, 1);
  builder.del(strInsertId, 2);

  const encoded = encode(builder.patch);
  expect(encoded).toEqual({
    id: [ 3, 100 ],
    ops: [
      { op: 'str' }, // 100
      { op: 'str_ins', after: [3, 100], value: 'qq' }, // 101, 102
      { op: 'arr' }, // 103
      { op: 'obj' }, // 104
      { op: 'obj_set', obj: [3, 104], tuples: [
        ['foo', [3, 100]],
        ['hmm', [3, 103]]
      ] }, // 105, 106
      { op: 'num' }, // 107
      { op: 'num_set', after: [3, 107], value: 123.4}, // 108
      { op: 'arr_ins', arr: [3, 103], after: [3, 103], values: [[3, 107]]}, // 109
      { op: 'root', value: [3, 104]}, // 110
      { op: 'del', after: [3, 109]}, // 111
      { op: 'del', after: [3, 101], len: 2}, // 112
    ]
  });
});