import {MakeStringOperation} from '../../../operations/MakeStringOperation';
import {SetRootOperation} from '../../../operations/SetRootOperation';
import {InsertStringSubstringOperation} from '../../../operations/InsertStringSubstringOperation';
import {decode} from '../decode';
import {MakeObjectOperation} from '../../../operations/MakeObjectOperation';
import {SetObjectKeysOperation} from '../../../operations/SetObjectKeysOperation';
import {encode} from '../encode';
import {NoopOperation} from '../../../operations/NoopOperation';
import {Code} from '../constants';

test('decodes a simple patch', () => {
  const patch = decode([
    3, 5, // Patch ID
    Code.SetRoot, // root
    0, 3, // root.value
  ]);
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(SetRootOperation);
  expect((patch.ops[0] as SetRootOperation).value.toString()).toBe('0!3');
});

test('decodes {foo: "bar"} object', () => {
  const patch = decode([
    5, 25, // Patch ID
    Code.MakeString, // str
    Code.InsertStringSubstring, "bar", -1, -1, // str_ins
    Code.NoopOne,
    Code.MakeObject, // obj
    Code.SetObjectKeys, 1, -6, "foo", -1, // obj_set
    Code.SetRoot, -6, // root
    Code.Noop, 5,
  ]);
  expect(patch.ops.length).toBe(7);
  expect(patch.span()).toBe(13);
  expect(patch.getId()!.toString()).toBe('5!25');
  expect(patch.ops[0]).toBeInstanceOf(MakeStringOperation);
  expect(patch.ops[1]).toBeInstanceOf(InsertStringSubstringOperation);
  expect(patch.ops[2]).toBeInstanceOf(NoopOperation);
  expect(patch.ops[3]).toBeInstanceOf(MakeObjectOperation);
  expect(patch.ops[4]).toBeInstanceOf(SetObjectKeysOperation);
  expect(patch.ops[5]).toBeInstanceOf(SetRootOperation);
  expect(patch.ops[6]).toBeInstanceOf(NoopOperation);
  expect((patch.ops[1] as InsertStringSubstringOperation).obj.toString()).toBe('5!25');
  expect((patch.ops[1] as InsertStringSubstringOperation).after.toString()).toBe('5!25');
  expect((patch.ops[1] as InsertStringSubstringOperation).substring).toBe('bar');
  expect((patch.ops[2] as NoopOperation).length).toBe(1);
  expect((patch.ops[4] as SetObjectKeysOperation).object.toString()).toBe('5!30');
  expect((patch.ops[4] as SetObjectKeysOperation).tuples[0][0]).toBe('foo');
  expect((patch.ops[4] as SetObjectKeysOperation).tuples[0][1].toString()).toBe('5!25');
  expect((patch.ops[5] as SetRootOperation).value.toString()).toBe('5!30');
  expect((patch.ops[6] as NoopOperation).length).toBe(5);
});

test('test all operations', () => {
  const json: unknown[] = [
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
    Code.MakeConstant, {a: 'b'},
    Code.NoopOne, // noop (1)
    Code.DeleteOne, -8, -10, // del_one
    Code.Noop, 3, // noop (3)
    Code.Delete, 2, -1, -2, // del
    Code.MakeValue, {'1': 2}, // val
    Code.SetValue, -20, null, // val_set
  ];
  const patch = decode(json);
  const encoded = encode(patch);
  expect(json).toEqual(encoded);
});
