import {LogicalClock, LogicalTimestamp} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {Code} from '../constants';
import {encode} from '../encode';

test('encodes a simple patch', () => {
  const clock = new LogicalClock(3, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 3));
  const encoded = encode(builder.patch);
  expect(encoded).toEqual([
    3, 5, // Patch ID
    Code.SetRoot, // root
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
    Code.MakeString, // str
    Code.InsertStringSubstring, "bar", -1, -1, // str_ins
    Code.MakeObject, // obj
    Code.SetObjectKeys, 1, -5, "foo", -1, // obj_set
    Code.SetRoot, -5 // root
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
  builder.const([1, 2]);
  builder.noop(1);
  builder.del(numId, numInsertionId, 1);
  builder.noop(3);
  builder.del(strId, strInsertId, 2);
  const valId = builder.val({'1': 2});
  builder.setVal(valId, null);

  const encoded = encode(builder.patch);
  expect(encoded).toEqual([
    3, 100, // Patch ID
    Code.MakeString, // str 3!100
    Code.InsertStringSubstring, "qq", -1, -1, // str_ins 3!101,3!102
    Code.MakeArray, // arr 3!103
    Code.MakeObject, // obj 3!104
    Code.SetObjectKeys, 2, -5, "foo", -1, "hmm", -4, // obj_set 3!105,3!106
    Code.MakeNumber, // num 3!107
    Code.SetNumber, 123.4, -8, // num_set 3!108
    Code.InsertArrayElements, 1, -4, -4, -8, // arr_ins 3!109
    Code.SetRoot, -5, // root 3!110
    Code.MakeConstant, [1, 2],
    Code.NoopOne, // noop (1)
    Code.DeleteOne, -8, -10, // del_one
    Code.Noop, 3, // noop (3)
    Code.Delete, 2, -1, -2, // del
    Code.MakeValue, {'1': 2}, // val
    Code.SetValue, -20, null, // val_set
  ]);
});
