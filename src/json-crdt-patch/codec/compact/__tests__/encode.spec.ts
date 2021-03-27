import {LogicalClock, LogicalTimestamp} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {encode} from '../encode';

test('encodes a simple patch', () => {
  const clock = new LogicalClock(3, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 3));
  const encoded = encode(builder.patch);
  expect(encoded).toEqual([
    3, 5, // Patch ID
    4, // root
    0, 3, // root.value
  ]);
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
  expect(encoded).toEqual([
    5, 25, // Patch ID
    2, // str
    7, "bar", -1, -1, // str_ins
    0, // obj
    5, 1, -5, "foo", -1, // obj_set
    4, -5 // root
  ]);
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
  builder.noop(1);
  builder.del(numId, numInsertionId, 1);
  builder.noop(3);
  builder.del(strId, strInsertId, 2);

  const encoded = encode(builder.patch);
  expect(encoded).toEqual([
    3, 100, // Patch ID
    2, // str 3!100
    7, "qq", -1, -1, // str_ins 3!101,3!102
    1, // arr 3!103
    0, // obj 3!104
    5, 2, -5, "foo", -1, "hmm", -4, // obj_set 3!105,3!106
    3, // num 3!107
    6, 123.4, -8, // num_set 3!108
    8, 1, -4, -4, -8, // arr_ins 3!109
    4, -5, // root 3!110
    11, // noop (1)
    9, -8, -10, // del_one
    12, 3, // noop (3)
    10, 2, -1, -2 // del
  ]);
});