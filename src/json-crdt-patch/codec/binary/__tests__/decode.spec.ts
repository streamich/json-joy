import {MakeArrayOperation} from '../../../operations/MakeArrayOperation';
import {MakeNumberOperation} from '../../../operations/MakeNumberOperation';
import {MakeObjectOperation} from '../../../operations/MakeObjectOperation';
import {MakeStringOperation} from '../../../operations/MakeStringOperation';
import {SetNumberOperation} from '../../../operations/SetNumberOperation';
import {SetObjectKeysOperation} from '../../../operations/SetObjectKeysOperation';
import {SetRootOperation} from '../../../operations/SetRootOperation';
import {InsertStringSubstringOperation} from '../../../operations/InsertStringSubstringOperation';
import {decode} from '../decode';
import {InsertArrayElementsOperation} from '../../../operations/InsertArrayElementsOperation';
import {DeleteOperation} from '../../../operations/DeleteOperation';
import {encode} from '../encode';

test('decodes a .obj() operation', () => {
  const buf = new Uint8Array([
    3, 0, 0, 0, 5, 0, 0, 0, // Patch ID = 3!5
    0, // obj
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('3!5');
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(MakeObjectOperation);
  expect(patch.ops[0].id.toString()).toBe('3!5');
});

test('decodes a .arr() operation', () => {
  const buf = new Uint8Array([
    3, 0, 0, 0, 5, 0, 0, 0, // Patch ID = 3!5
    1, // arr
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('3!5');
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(MakeArrayOperation);
  expect(patch.ops[0].id.toString()).toBe('3!5');
});

test('decodes a .str() operation', () => {
  const buf = new Uint8Array([
    3, 0, 0, 0, 5, 0, 0, 0, // Patch ID = 3!5
    2, // str
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('3!5');
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(MakeStringOperation);
  expect(patch.ops[0].id.toString()).toBe('3!5');
});

test('decodes a .num() operation', () => {
  const buf = new Uint8Array([
    3, 0, 0, 0, 5, 0, 0, 0, // Patch ID = 3!5
    3, // num
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('3!5');
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(MakeNumberOperation);
  expect(patch.ops[0].id.toString()).toBe('3!5');
});

test('decodes a .root() operation', () => {
  const buf = new Uint8Array([
    6, 0, 0, 0, 7, 0, 0, 0,
    4,
    3, 0, 0, 0, 4, 0, 0, 0,
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('6!7');
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(SetRootOperation);
  expect(patch.ops[0].id.toString()).toBe('6!7');
  expect((patch.ops[0] as SetRootOperation).value.toString()).toBe('3!4');
});

test('decodes a single key string using .setKeys() operation', () => {
  const buf = new Uint8Array([
    6, 0, 0, 0, 7, 0, 0, 0, // Patch ID = 6!7
    5, // obj_set
    123, 0, 0, 0, 77, 1, 0, 0, // Object = 123!333
    1, // One key
    33, 0, 0, 0, 44, 0, 0, 0, // Key value = 33!44
    3, // Key length
    102, 111, 111 // Key = "foo"
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('6!7');
  expect(patch.ops.length).toBe(1); 
  expect(patch.ops[0]).toBeInstanceOf(SetObjectKeysOperation);
  expect(patch.ops[0].id.toString()).toBe('6!7');
  expect((patch.ops[0] as SetObjectKeysOperation).object.toString()).toBe('123!333');
  expect((patch.ops[0] as SetObjectKeysOperation).tuples.length).toBe(1);
  expect((patch.ops[0] as SetObjectKeysOperation).tuples[0][0]).toBe('foo');
  expect((patch.ops[0] as SetObjectKeysOperation).tuples[0][1].toString()).toBe('33!44');
});

test('decodes a two key string using .setKeys() operation', () => {
  const buf = new Uint8Array([
    6, 0, 0, 0, 7, 0, 0, 0, // Patch ID = 6!7
    5, // obj_set
    123, 0, 0, 0, 77, 1, 0, 0, // Object = 123!333
    2, // Two keys
    33, 0, 0, 0, 44, 0, 0, 0, // Key value = 33!44
    3, // Key length
    102, 111, 111, // Key = "foo"
    5, 0, 0, 0, 5, 0, 0, 0, // Key value = 5!5
    4, // Key length
    113, 117, 122, 122, // Key = "quzz"
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('6!7');
  expect(patch.ops.length).toBe(1); 
  expect(patch.ops[0]).toBeInstanceOf(SetObjectKeysOperation);
  expect(patch.ops[0].id.toString()).toBe('6!7');
  expect((patch.ops[0] as SetObjectKeysOperation).object.toString()).toBe('123!333');
  expect((patch.ops[0] as SetObjectKeysOperation).tuples.length).toBe(2);
  expect((patch.ops[0] as SetObjectKeysOperation).tuples[0][0]).toBe('foo');
  expect((patch.ops[0] as SetObjectKeysOperation).tuples[0][1].toString()).toBe('33!44');
  expect((patch.ops[0] as SetObjectKeysOperation).tuples[1][0]).toBe('quzz');
  expect((patch.ops[0] as SetObjectKeysOperation).tuples[1][1].toString()).toBe('5!5');
});

test('decodes a .setNum() operation', () => {
  const buf = new Uint8Array([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID = 1!1
    6, // num_set
    1, 0, 0, 0, 2, 0, 0, 0, // After = 1!2
    119, 190, 159, 26, 47, 221, 94, 64 // Double value
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('1!1');
  expect(patch.ops.length).toBe(1); 
  expect(patch.ops[0]).toBeInstanceOf(SetNumberOperation);
  expect(patch.ops[0].id.toString()).toBe('1!1');
  expect((patch.ops[0] as SetNumberOperation).num.toString()).toBe('1!2');
  expect((patch.ops[0] as SetNumberOperation).value).toBe(123.456);
});

test('decodes a .insStr() operation', () => {
  const buf = new Uint8Array([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID = 1!1
    7, // str_ins
    3, 0, 0, 0, 3, 0, 0, 0, // After = 3!3
    4, // String length
    104, 97, 104, 97, // "haha"
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('1!1');
  expect(patch.ops.length).toBe(1); 
  expect(patch.ops[0]).toBeInstanceOf(InsertStringSubstringOperation);
  expect(patch.ops[0].id.toString()).toBe('1!1');
  expect((patch.ops[0] as InsertStringSubstringOperation).after.toString()).toBe('3!3');
  expect((patch.ops[0] as InsertStringSubstringOperation).substring.toString()).toBe('haha');
});

test('decodes a .insArr() operation', () => {
  const buf = new Uint8Array([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    8, // arr_ins
    1, 0, 0, 0, 2, 0, 0, 0, // Arr = 1!2
    1, 0, 0, 0, 3, 0, 0, 0, // After = 1!3
    3, // Length
    3, 0, 0, 0, 3, 0, 0, 0, // After 3!3
    4, 0, 0, 0, 4, 0, 0, 0, // After 4!4
    5, 0, 0, 0, 5, 0, 0, 0, // After 5!5
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('1!1');
  expect(patch.ops.length).toBe(1); 
  expect(patch.ops[0]).toBeInstanceOf(InsertArrayElementsOperation);
  expect(patch.ops[0].id.toString()).toBe('1!1');
  expect((patch.ops[0] as InsertArrayElementsOperation).arr.toString()).toBe('1!2');
  expect((patch.ops[0] as InsertArrayElementsOperation).after.toString()).toBe('1!3');
  expect((patch.ops[0] as InsertArrayElementsOperation).elements.length).toBe(3);
  expect((patch.ops[0] as InsertArrayElementsOperation).elements[0].toString()).toBe('3!3');
  expect((patch.ops[0] as InsertArrayElementsOperation).elements[1].toString()).toBe('4!4');
  expect((patch.ops[0] as InsertArrayElementsOperation).elements[2].toString()).toBe('5!5');
});

test('decodes a .del() operation with span > 1', () => {
  const buf = new Uint8Array([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    9, // del
    5, 0, 0, 0, 5, 0, 0, 0, // Obj 5!5
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
    0b10000001, 0b110, // Span length
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('1!1');
  expect(patch.ops.length).toBe(1); 
  expect(patch.ops[0]).toBeInstanceOf(DeleteOperation);
  expect(patch.ops[0].id.toString()).toBe('1!1');
  expect((patch.ops[0] as DeleteOperation).obj.toString()).toBe('5!5');
  expect((patch.ops[0] as DeleteOperation).after.toString()).toBe('1!2');
  expect((patch.ops[0] as DeleteOperation).length).toBe(0b11_00000001);
});

test('decodes a .del() operation with span = 3', () => {
  const buf = new Uint8Array([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    9, // del
    7, 0, 0, 0, 7, 0, 0, 0, // After 7!7
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
    3, // Span length
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('1!1');
  expect(patch.ops.length).toBe(1); 
  expect(patch.ops[0]).toBeInstanceOf(DeleteOperation);
  expect(patch.ops[0].id.toString()).toBe('1!1');
  expect((patch.ops[0] as DeleteOperation).obj.toString()).toBe('7!7');
  expect((patch.ops[0] as DeleteOperation).after.toString()).toBe('1!2');
  expect((patch.ops[0] as DeleteOperation).length).toBe(3);
});

test('decodes a .del() operation with span = 1', () => {
  const buf = new Uint8Array([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    10, // del
    8, 0, 0, 0, 8, 0, 0, 0, // After 8!8
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('1!1');
  expect(patch.ops.length).toBe(1); 
  expect(patch.ops[0]).toBeInstanceOf(DeleteOperation);
  expect(patch.ops[0].id.toString()).toBe('1!1');
  expect((patch.ops[0] as DeleteOperation).obj.toString()).toBe('8!8');
  expect((patch.ops[0] as DeleteOperation).after.toString()).toBe('1!2');
  expect((patch.ops[0] as DeleteOperation).length).toBe(1);
});

test('decodes a simple patch', () => {
  const buf = new Uint8Array([
    3, 0, 0, 0, 5, 0, 0, 0, // Patch ID = 3!5
    4, // root
    0, 0, 0, 0, 3, 0, 0, 0, // Value = 0!3
  ]);
  const patch = decode(buf)
  expect(patch.getId()!.toString()).toBe('3!5');
  expect(patch.ops.length).toBe(1); 
  expect(patch.ops[0]).toBeInstanceOf(SetRootOperation);
  expect(patch.ops[0].id.toString()).toBe('3!5');
  expect((patch.ops[0] as SetRootOperation).value.toString()).toBe('0!3');
});

test('create {foo: "bar"} object', () => {
  const buf = new Uint8Array([
    5, 0, 0, 0, 25, 0, 0, 0, // Patch ID = 5!25
    2, // str
    7, // str_ins
    5, 0, 0, 0, 25, 0, 0, 0, // Sting ID = 5!25
    3, // String length
    98, 97, 114, // "bar"
    0, // obj
    5, // obj_set
    5, 0, 0, 0, 29, 0, 0, 0, // Object ID = 5!29
    1, // Number of fields
    5, 0, 0, 0, 25, 0, 0, 0, // First field value = 5!25
    3, // Field key length
    102, 111, 111, // "foo"
    4, // root
    5, 0, 0, 0, 29, 0, 0, 0, // Value = 5!29
  ]);
  const patch = decode(buf)
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
  const buf = new Uint8Array([
    3,0,0,0,100,0,0,0, // Patch ID = 3!100
    2, // str
    7, // str_ins
    3,0,0,0,100,0,0,0, // After = 3!100
    2, // String length
    113,113, // "qq"
    1, // arr
    0, // obj
    5, // obj_set
    3,0,0,0,104,0,0,0, // Object = 3!104
    2, // Number of fields
    3,0,0,0,100,0,0,0, // Field one value = 3!100
    3, // Field one key length
    102,111,111, // "foo"
    3,0,0,0,103,0,0,0, // Field two value = 3!103
    3, // Field two key length
    104,109,109, // "hmm"
    3, // num
    6, // num_set
    3,0,0,0,107,0,0,0, // After = 3!107
    154,153,153,153,153,217,94,64, // Value = 123.4
    8, // arr_ins
    3,0,0,0,103,0,0,0, // Arr = 3!103
    3,0,0,0,103,0,0,0, // After = 3!103
    1, // Number of elements
    3,0,0,0,107,0,0,0, // First element = 3!107
    4, // root
    3,0,0,0,104,0,0,0, // Value = 3!104
    10, // del_one
    3,0,0,0,107,0,0,0, // Obj = 3!109
    3,0,0,0,109,0,0,0, // After = 3!109
    9, // del
    3,0,0,0,100,0,0,0, // Obj = 3!101
    3,0,0,0,101,0,0,0, // After = 3!101
    2, // Deletion length
  ]);
  const patch = decode(buf);
  const encoded = encode(patch);
  expect([...buf]).toEqual([...encoded]);
});
