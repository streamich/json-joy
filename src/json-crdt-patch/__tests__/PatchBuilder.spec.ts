import {LogicalClock, LogicalTimestamp} from '../clock';
import {ORIGIN, TRUE_ID} from '../constants';
import {DeleteOperation} from '../operations/DeleteOperation';
import {InsertArrayElementsOperation} from '../operations/InsertArrayElementsOperation';
import {InsertBinaryDataOperation} from '../operations/InsertBinaryDataOperation';
import {InsertStringSubstringOperation} from '../operations/InsertStringSubstringOperation';
import {MakeArrayOperation} from '../operations/MakeArrayOperation';
import {MakeBinaryOperation} from '../operations/MakeBinaryOperation';
import {MakeNumberOperation} from '../operations/MakeNumberOperation';
import {MakeObjectOperation} from '../operations/MakeObjectOperation';
import {MakeStringOperation} from '../operations/MakeStringOperation';
import {NoopOperation} from '../operations/NoopOperation';
import {SetNumberOperation} from '../operations/SetNumberOperation';
import {SetObjectKeysOperation} from '../operations/SetObjectKeysOperation';
import {SetRootOperation} from '../operations/SetRootOperation';
import {PatchBuilder} from '../PatchBuilder';

test('can set document root', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 2));
  expect(builder.patch.ops.length).toBe(1);
  expect(builder.patch.ops[0]).toBeInstanceOf(SetRootOperation);
});

test('uses ID of the first operation as the patch ID', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 2));
  builder.obj();
  expect(builder.patch.ops.length).toBe(2);
  expect(builder.patch.getId()).toBe(builder.patch.ops[0].id);
});

test('computes the total span of the patch', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 2));
  builder.obj();
  expect(builder.patch.ops.length).toBe(2);
  expect(builder.patch.span()).toBe(2);
});

test('uses injected clock to set operations IDs', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 2));
  builder.obj();
  expect(builder.patch.ops[0].id.getSessionId()).toBe(1);
  expect(builder.patch.ops[0].id.time).toBe(5);
  expect(builder.patch.ops[1].id.getSessionId()).toBe(1);
  expect(builder.patch.ops[1].id.time).toBe(6);
});

test('adds "noop" padding when clock jumps', () => {
  const clock = new LogicalClock(1, 10);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 2)); // 0
  clock.tick(2); // 1
  builder.obj(); // 2
  clock.tick(3); // 3
  builder.str(); // 4
  clock.tick(4); // 5
  builder.num(); // 6
  clock.tick(5); // 7
  builder.arr(); // 8
  builder.arr(); // 9
  builder.arr(); // 10
  clock.tick(5); // 11
  const arr = builder.arr(); // 12
  clock.tick(8); // 13
  builder.insArr(arr, arr, [TRUE_ID]); // 14
  clock.tick(9); // 15
  builder.insStr(ORIGIN, ORIGIN, 'asf'); // 16
  clock.tick(1); // 17
  builder.del(ORIGIN, ORIGIN, 1); // 18
  clock.tick(1); // 19
  builder.setNum(ORIGIN, 123); // 20
  clock.tick(1); // 21
  builder.setKeys(ORIGIN, [['asdf', TRUE_ID]]); // 22
  clock.tick(1); // 23
  const bin = builder.bin(); // 24
  clock.tick(1); // 25
  builder.insBin(bin, bin, new Uint8Array([1, 2])); // 26
  expect(builder.patch.ops[0]).toBeInstanceOf(SetRootOperation);
  expect(builder.patch.ops[1]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[2]).toBeInstanceOf(MakeObjectOperation);
  expect(builder.patch.ops[3]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[4]).toBeInstanceOf(MakeStringOperation);
  expect(builder.patch.ops[5]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[6]).toBeInstanceOf(MakeNumberOperation);
  expect(builder.patch.ops[7]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[8]).toBeInstanceOf(MakeArrayOperation);
  expect(builder.patch.ops[9]).toBeInstanceOf(MakeArrayOperation);
  expect(builder.patch.ops[10]).toBeInstanceOf(MakeArrayOperation);
  expect(builder.patch.ops[11]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[12]).toBeInstanceOf(MakeArrayOperation);
  expect(builder.patch.ops[13]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[14]).toBeInstanceOf(InsertArrayElementsOperation);
  expect(builder.patch.ops[15]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[16]).toBeInstanceOf(InsertStringSubstringOperation);
  expect(builder.patch.ops[17]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[18]).toBeInstanceOf(DeleteOperation);
  expect(builder.patch.ops[19]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[20]).toBeInstanceOf(SetNumberOperation);
  expect(builder.patch.ops[21]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[22]).toBeInstanceOf(SetObjectKeysOperation);
  expect(builder.patch.ops[23]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[24]).toBeInstanceOf(MakeBinaryOperation);
  expect(builder.patch.ops[25]).toBeInstanceOf(NoopOperation);
  expect(builder.patch.ops[26]).toBeInstanceOf(InsertBinaryDataOperation);
  expect(builder.patch.ops[1].span()).toBe(2);
  expect(builder.patch.ops[3].span()).toBe(3);
  expect(builder.patch.ops[5].span()).toBe(4);
});
