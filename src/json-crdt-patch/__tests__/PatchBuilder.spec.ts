import {LogicalClock, LogicalTimestamp} from '../../json-crdt/clock';
import {SetRootOperation} from '../operations/SetRootOperation';
import {PatchBuilder} from '../PatchBuilder';

test('can set document root', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 0), new LogicalTimestamp(0, 2));
  expect(builder.patch.ops.length).toBe(1);
  expect(builder.patch.ops[0]).toBeInstanceOf(SetRootOperation);
});

test('uses ID of the first operation as the patch ID', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 0), new LogicalTimestamp(0, 2));
  builder.obj();
  expect(builder.patch.ops.length).toBe(2);
  expect(builder.patch.getId()).toBe(builder.patch.ops[0].id);
});

test('computes the total span of the patch', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 0), new LogicalTimestamp(0, 2));
  builder.obj();
  expect(builder.patch.ops.length).toBe(2);
  expect(builder.patch.getSpan()).toBe(2);
});

test('uses injected clock to set operations IDs', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(new LogicalTimestamp(0, 0), new LogicalTimestamp(0, 2));
  builder.obj();
  expect(builder.patch.ops[0].id.sessionId).toBe(1);
  expect(builder.patch.ops[0].id.time).toBe(5);
  expect(builder.patch.ops[1].id.sessionId).toBe(1);
  expect(builder.patch.ops[1].id.time).toBe(6);
});
