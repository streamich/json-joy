import {LogicalClock, ts, ClockVector} from '../clock';
import {ORIGIN} from '../constants';
import {PatchBuilder} from '../PatchBuilder';
import {InsValOp} from '../operations';

test('can set document root', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(ts(0, 2));
  expect(builder.patch.ops.length).toBe(1);
  expect(builder.patch.ops[0]).toBeInstanceOf(InsValOp);
  expect((builder.patch.ops[0] as any).obj).toBe(ORIGIN);
});

test('uses ID of the first operation as the patch ID', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(ts(0, 2));
  builder.obj();
  expect(builder.patch.getId()).toBe(builder.patch.ops[0].id);
});

test('computes the total span of the patch', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(ts(0, 2));
  builder.obj();
  expect(builder.patch.span()).toBe(2);
});

test('uses injected clock to set operations IDs', () => {
  const clock = new LogicalClock(1, 5);
  const builder = new PatchBuilder(clock);
  builder.root(ts(0, 2));
  builder.obj();
  expect(builder.patch.ops[0].id.sid).toBe(1);
  expect(builder.patch.ops[0].id.time).toBe(5);
  expect(builder.patch.ops[1].id.sid).toBe(1);
  expect(builder.patch.ops[1].id.time).toBe(6);
});

test('pads clock jumps in between string inserts', () => {
  const str = ts(122, 50);
  const clock = new ClockVector(123, 100);
  const builder = new PatchBuilder(clock);
  const insert1 = builder.insStr(str, str, 'asdf');
  expect(insert1.sid).toBe(clock.sid);
  expect(insert1.time).toBe(100);
  clock.observe(ts(555, 102), 10);
  const insert2 = builder.insStr(str, str, 'qwerty');
  expect(insert2.sid).toBe(clock.sid);
  expect(insert2.time).toBe(112);
});
