import {LogicalClock, LogicalTimestamp} from '../../../../json-crdt/clock';
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
  builder.root(new LogicalTimestamp(1, 2), new LogicalTimestamp(3, 4));
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    6, 0, 0, 0, 7, 0, 0, 0,
    4,
    1, 0, 0, 0, 2, 0, 0, 0,
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
    123, 0, 0, 0, 77, 1, 0, 0, // after = 123!333
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
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    6, // num_set
    119, 190, 159, 26, 47, 221, 94,  64 // Double value
  ]);
});

test('encodes a .setNum() operation', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.setNum(new LogicalTimestamp(1, 2), 123.456);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    6, // num_set
    119, 190, 159, 26, 47, 221, 94,  64 // Double value
  ]);
});

test('encodes a .insStr() operation', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.insStr(new LogicalTimestamp(3, 3), 'haha');
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID = 1!1
    7, // str_ins
    3, 0, 0, 0, 3, 0, 0, 0, // After = 3!3
    4, // String length
    104, 97, 104, 97, // "haha"
  ]);
});

test('encodes a .insArr() operation', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.insArr(new LogicalTimestamp(1, 2), [
    new LogicalTimestamp(3, 3),
    new LogicalTimestamp(4, 4),
    new LogicalTimestamp(5, 5),
  ]);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    8, // arr_ins
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
    3, // Length
    3, 0, 0, 0, 3, 0, 0, 0, // After 3!3
    4, 0, 0, 0, 4, 0, 0, 0, // After 4!4
    5, 0, 0, 0, 5, 0, 0, 0, // After 5!5
  ]);
});

test('encodes a .del() operation with span > 1', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.del(new LogicalTimestamp(1, 2), 0b11_00000001);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    9, // arr_ins
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
    0b10000001, 0b110, // Span length
  ]);
});

test('encodes a .del() operation with span = 3', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.del(new LogicalTimestamp(1, 2), 3);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    9, // arr_ins
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
    3, // Span length
  ]);
});

test('encodes a .del() operation with span = 1', () => {
  const clock = new LogicalClock(1, 1);
  const builder = new PatchBuilder(clock);
  builder.del(new LogicalTimestamp(1, 2), 1);
  const encoded = encode(builder.patch);
  expect([...encoded]).toEqual([
    1, 0, 0, 0, 1, 0, 0, 0, // Patch ID
    10, // arr_ins
    1, 0, 0, 0, 2, 0, 0, 0, // After 1!2
  ]);
});

// test('encodes a simple patch', () => {`
//   const clock = new LogicalClock(3, 5);
//   const builder = new PatchBuilder(clock);
//   builder.root(new LogicalTimestamp(0, 0), new LogicalTimestamp(0, 3));
//   const encoded = encode(builder.patch);
//   expect(encoded).toEqual([
//     3, 5, // Patch ID
//     4, // root
//       0, 0, // root.after
//       0, 3, // root.value
//     ]);
// });

// test('create {foo: "bar"} object', () => {
//   const clock = new LogicalClock(5, 25);
//   const builder = new PatchBuilder(clock);
  
//   const strId = builder.str();
//   builder.insStr(strId, 'bar');
//   const objId = builder.obj();
//   builder.setKeys(objId, [['foo', strId]]);
//   builder.root(new LogicalTimestamp(0, 0), objId);

//   const encoded = encode(builder.patch);
//   expect(encoded).toEqual([
//     5, 25, // Patch ID
//     2, // str
//     7, 5, 25, "bar", // str_ins
//     0, // obj
//     5, 5, 29, ["foo", 5, 25], // obj_set
//     4, 0, 0, 5, 29 // root
//   ]);
// });

// test('test all operations', () => {
//   const clock = new LogicalClock(3, 100);
//   const builder = new PatchBuilder(clock);

//   const strId = builder.str();
//   const strInsertId = builder.insStr(strId, 'qq');
//   const arrId = builder.arr();
//   const objId = builder.obj();
//   builder.setKeys(objId, [['foo', strId], ['hmm', arrId]]);
//   const numId = builder.num();
//   builder.setNum(numId, 123.4);
//   const numInsertionId = builder.insArr(arrId, [numId])
//   builder.root(new LogicalTimestamp(0, 0), objId);
//   builder.delArr(numInsertionId, 1);
//   builder.delStr(strInsertId, 1);

//   const encoded = encode(builder.patch);
//   expect(encoded).toEqual([
//     3, 100, // Patch ID
//     2, // str 3!100
//     7, 3, 100, "qq", // str_ins 3!101,3!102
//     1, // arr 3!103
//     0, // obj 3!104
//     5, 3, 104, ["foo", 3, 100, "hmm", 3, 103], // obj_set 3!105,3!106
//     3, // num 3!107
//     6, 3, 107, 123.4, // num_set 3!108
//     8, 3, 103, [3, 107], // arr_ins 3!109
//     4, 0, 0, 3, 104, // root 3!110
//     10, 3, 109, 1, // arr_del
//     9, 3, 101, 1 // str_del
//   ]);
// });