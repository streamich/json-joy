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
  builder.insStr(strId, strId, 'bar');
  const objId = builder.obj();
  builder.setKeys(objId, [['foo', strId]]);
  builder.root(objId);

  const encoded = encode(builder.patch);
  expect(encoded).toEqual({
    id: [ 5, 25 ],
    ops: [
      { op: 'str' }, // 25
      { op: 'str_ins', obj: [5, 25], after: [5, 25], value: 'bar' }, // 26-28
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
  const strInsertId = builder.insStr(strId, strId, 'qq');
  const arrId = builder.arr();
  const objId = builder.obj();
  builder.setKeys(objId, [['foo', strId], ['hmm', arrId]]);
  const numId = builder.num();
  builder.setNum(numId, 123.4);
  const numInsertionId = builder.insArr(arrId, arrId, [numId])
  builder.root(objId);
  builder.const({a: 999});
  builder.noop(1);
  builder.del(numId, numInsertionId, 1);
  builder.noop(2);
  builder.del(strId, strInsertId, 2);
  const valId = builder.val({a: 'b'});
  builder.setVal(valId, 'lala');

  const encoded = encode(builder.patch);
  expect(encoded).toEqual({
    id: [ 3, 100 ],
    ops: [
      { op: 'str' }, // 100
      { op: 'str_ins', obj: [3, 100], after: [3, 100], value: 'qq' }, // 101, 102
      { op: 'arr' }, // 103
      { op: 'obj' }, // 104
      { op: 'obj_set', obj: [3, 104], tuples: [
        ['foo', [3, 100]],
        ['hmm', [3, 103]]
      ] }, // 105, 106
      { op: 'num' }, // 107
      { op: 'num_set', after: [3, 107], value: 123.4}, // 108
      { op: 'arr_ins', obj: [3, 103], after: [3, 103], values: [[3, 107]]}, // 109
      { op: 'root', value: [3, 104]}, // 110
      { op: 'const', value: {a: 999}}, // 111
      { op: 'noop' }, // 112
      { op: 'del', obj: [3, 107], after: [3, 109]}, // 113
      { op: 'noop', len: 2 }, // 114, 115
      { op: 'del', obj: [3, 100], after: [3, 101], len: 2}, // 116
      { op: 'val', value: {a: 'b'} }, // 117
      { op: 'val_set', obj: [3, 118], value: 'lala' }, // 118
    ]
  });
});
