import {MakeStringOperation} from '../../../operations/MakeStringOperation';
import {SetRootOperation} from '../../../operations/SetRootOperation';
import {InsertStringSubstringOperation} from '../../../operations/InsertStringSubstringOperation';
import {decode} from '../decode';
import {MakeObjectOperation} from '../../../operations/MakeObjectOperation';
import {SetObjectKeysOperation} from '../../../operations/SetObjectKeysOperation';
import {encode} from '../encode';

test('decodes a simple patch', () => {
  const patch = decode([
    3, 5, // Patch ID
    4, // root
    0, 3, // root.value
  ]);
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(SetRootOperation);
  expect((patch.ops[0] as SetRootOperation).value.toString()).toBe('0!3');
});

test('decodes {foo: "bar"} object', () => {
  const patch = decode([
    5, 25, // Patch ID
    2, // str
    7, "bar", -1, // str_ins
    0, // obj
    5, 1, -5, "foo", -1, // obj_set
    4, -5 // root
  ]);
  expect(patch.ops.length).toBe(5);
  expect(patch.span()).toBe(7);
  expect(patch.getId()!.toString()).toBe('5!25');
  expect(patch.ops[0]).toBeInstanceOf(MakeStringOperation);
  expect(patch.ops[1]).toBeInstanceOf(InsertStringSubstringOperation);
  expect(patch.ops[2]).toBeInstanceOf(MakeObjectOperation);
  expect(patch.ops[3]).toBeInstanceOf(SetObjectKeysOperation);
  expect(patch.ops[4]).toBeInstanceOf(SetRootOperation);
  expect((patch.ops[1] as InsertStringSubstringOperation).after.toString()).toBe('5!25');
  expect((patch.ops[1] as InsertStringSubstringOperation).substring).toBe('bar');
  expect((patch.ops[3] as SetObjectKeysOperation).object.toString()).toBe('5!29');
  expect((patch.ops[3] as SetObjectKeysOperation).tuples[0][0]).toBe('foo');
  expect((patch.ops[3] as SetObjectKeysOperation).tuples[0][1].toString()).toBe('5!25');
  expect((patch.ops[4] as SetRootOperation).value.toString()).toBe('5!29');
});

test('test all operations', () => {
  const json: unknown[] = [
    3, 100, // Patch ID
    2, // str 3!100
    7, "qq", -1, // str_ins 3!101,3!102
    1, // arr 3!103
    0, // obj 3!104
    5, 2, -5, "foo", -1, "hmm", -4, // obj_set 3!105,3!106
    3, // num 3!107
    6, 123.4, -8, // num_set 3!108
    8, 1, -4, -4, -8, // arr_ins 3!109
    4, -5, // root 3!110
    9, -8, -10, // del_one
    10, 2, -1, -2, // del
  ];
  const patch = decode(json);
  const encoded = encode(patch);
  expect(json).toEqual(encoded);
});