import {LogicalClock, LogicalTimestamp} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {encode} from '../encode';

test('encodes a .obj() operation', () => {
  const clock = new LogicalClock(3, 5);
  const builder = new PatchBuilder(clock);
  builder.obj();
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    3, 0, 0, 0, 5,
    0, 0, 0, 0
  ]);
});

test('encodes a .arr() operation', () => {
  const clock = new LogicalClock(3, 5);
  const builder = new PatchBuilder(clock);
  builder.arr();
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    3, 0, 0, 0, 5,
    0, 0, 0, 1
  ]);
});

test('encodes a .str() operation', () => {
  const clock = new LogicalClock(6, 7);
  const builder = new PatchBuilder(clock);
  builder.str();
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    6, 0, 0, 0, 7,
    0, 0, 0, 2
  ]);
});

test('encodes a .num() operation', () => {
  const clock = new LogicalClock(6, 7);
  const builder = new PatchBuilder(clock);
  builder.num();
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    6, 0, 0, 0, 7,
    0, 0, 0, 3
  ]);
});

test('encodes a .root() operation', () => {
  const clock = new LogicalClock(6, 7);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(3, 4));
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    6, 0, 0, 0, 7, 0, 0, 0,
    4,
    3, 0, 0, 0, 4, 0, 0, 0,
  ]);
});

test('encodes a single key string using .setKeys() operation', () => {
  const clock = new LogicalClock(6, 7);
  const builder = new PatchBuilder(clock);
  builder.setKeys(new LogicalTimestamp(123, 333), [
    ['foo', new LogicalTimestamp(33, 44)],
  ]);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    6, 0, 0, 0, 7, 0, 0, 0, // Patch ID = 6!7
    5, // obj_set
    123, 0, 0, 0, 77, 1, 0, 0, // after = 123!333
    1, // One key
    33, 0, 0, 0, 44, 0, 0, 0, // Key value = 33!44
    3, // Key length
    102, 111, 111 // Key = "foo"
  ]);
});

test('encodes a two key string using .setKeys() operation', () => {
  const clock = new LogicalClock(6, 7);
  const builder = new PatchBuilder(clock);
  builder.setKeys(new LogicalTimestamp(123, 333), [
    ['foo', new LogicalTimestamp(33, 44)],
    ['quzz', new LogicalTimestamp(5, 5)],
  ]);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    6, 0, 0, 0, 7, 0, 0, 0, // Patch ID = 6!7
    5, // obj_set
    123, 0, 0, 0, 77, 1, 0, 0, // Object = 123!333
    2, // Two keys
    33, 0, 0, 0, 44, 0, 0, 0, // Key value = 33!44
    3, // Key length
    102, 111, 111, // Key = "foo"
    5, 0, 0, 0, 5, 0, 0, 0, // Key value = 5!5
    4, // Key length
    113, 117, 122, 122, // Key = "foo"
  ]);
});

test('encodes a .setNum() operation', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.setNum(new LogicalTimestamp(1, 2), 123.456);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID = 1!1
    6, // num_set
    1, 0, 0, 0, 2, 0, 0, 0, // After = 1!2
    119, 190, 159, 26, 47, 221, 94, 64 // Double value
  ]);
});

test('encodes a .insStr() operation', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.insStr(new LogicalTimestamp(2, 2), new LogicalTimestamp(3, 3), 'haha');
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID = 1!1
    7, // str_ins
    2, 0, 0, 0, 2, 0, 0, 0, // After = 2!2
    3, 0, 0, 0, 3, 0, 0, 0, // After = 3!3
    4, // String length
    104, 97, 104, 97, // "haha"
  ]);
});

test('encodes a .insArr() operation', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.insArr(new LogicalTimestamp(1, 1), new LogicalTimestamp(1, 2), [
    new LogicalTimestamp(3, 3),
    new LogicalTimestamp(4, 4),
    new LogicalTimestamp(5, 5),
  ]);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    8, // arr_ins
    1, 0, 0, 0, 1, 0, 0, 0, // Arr = 1!2
    1, 0, 0, 0, 2, 0, 0, 0, // After = 1!2
    3, // Length
    3, 0, 0, 0, 3, 0, 0, 0, // After 3!3
    4, 0, 0, 0, 4, 0, 0, 0, // After 4!4
    5, 0, 0, 0, 5, 0, 0, 0, // After 5!5
  ]);
});

test('encodes a .del() operation with span > 1', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.del(new LogicalTimestamp(1, 2), new LogicalTimestamp(1, 2), 0b11_00000001);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    9, // del
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
    0b10000001, 0b110, // Span length
  ]);
});

test('encodes a .del() operation with span = 3', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.del(new LogicalTimestamp(4, 4), new LogicalTimestamp(1, 2), 3);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    9, // del
    4, 0, 0, 0, 4, 0, 0, 0, // Obj 4!4
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
    3, // Span length
  ]);
});

test('encodes a .del() operation with span = 1', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.del(new LogicalTimestamp(6, 6), new LogicalTimestamp(1, 2), 1);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    10, // del
    6, 0, 0, 0, 6, 0, 0, 0, // Obj 6!6
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
  ]);
});

test('encodes a .noop() operation with span = 1', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.noop(1);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    11, // noop
  ]);
});

test('encodes a .noop() operation with span = 22', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.noop(22);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    12, // noop
    22,
  ]);
});

test('encodes a simple patch', () => {
  const clock = new LogicalClock(3, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 3));
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    3, 0, 0, 0, 5, 0, 0, 0, // Patch ID = 3!5
    4, // root
    0, 0, 0, 0, 3, 0, 0, 0, // Value = 0!3
  ]);
});

test('create {foo: "bar"} object', () => {
  const clock = new LogicalClock(5, 25);
  const builder = new PatchBuilder(clock);
  
  const strId = builder.str();
  builder.insStr(strId, strId, 'bar');
  const objId = builder.obj();
  builder.setKeys(objId, [['foo', strId]]);
  builder.noop(3);
  builder.noop(1);
  builder.root(objId);

  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    5, 0, 0, 0, 25, 0, 0, 0, // Patch ID = 5!25
    2, // str
    7, // str_ins
    5, 0, 0, 0, 25, 0, 0, 0, // Obj = 5!25
    5, 0, 0, 0, 25, 0, 0, 0, // After = 5!25
    3, // String length
    98, 97, 114, // "bar"
    0, // obj
    5, // obj_set
    5, 0, 0, 0, 29, 0, 0, 0, // Object ID = 5!29
    1, // Number of fields
    5, 0, 0, 0, 25, 0, 0, 0, // First field value = 5!25
    3, // Field key length
    102, 111, 111, // "foo"
    12, 3, // noop (3)
    11, // noop (1)
    4, // root
    5, 0, 0, 0, 29, 0, 0, 0, // Value = 5!29
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
  builder.del(numId, numInsertionId, 1);
  builder.del(strId, strInsertId, 2);

  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    3,0,0,0,100,0,0,0, // Patch ID = 3!100
    2, // str
    7, // str_ins
    3,0,0,0,100,0,0,0, // Obj = 3!100
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
});