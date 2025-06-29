import {LogicalClock, ts} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {encode} from '../encode';

test('encodes a simple patch', () => {
  const clock = new LogicalClock(3, 5);
  const builder = new PatchBuilder(clock);
  builder.root(ts(0, 3));
  const encoded = encode(builder.patch);
  expect(encoded).toEqual({
    id: [3, 5],
    ops: [{op: 'ins_val', obj: [0, 0], value: [0, 3]}],
  });
});

test('create {foo: "bar"} object', () => {
  const clock = new LogicalClock(5, 25);
  const builder = new PatchBuilder(clock);
  const strId = builder.str();
  builder.insStr(strId, strId, 'bar');
  const objId = builder.obj();
  builder.insObj(objId, [['foo', strId]]);
  builder.root(objId);
  const encoded = encode(builder.patch);
  expect(encoded).toEqual({
    id: [5, 25],
    ops: [
      {op: 'new_str'}, // 25
      {op: 'ins_str', obj: [5, 25], after: [5, 25], value: 'bar'}, // 26-28
      {op: 'new_obj'}, // 29
      {op: 'ins_obj', obj: [5, 29], value: [['foo', [5, 25]]]}, // 30
      {op: 'ins_val', obj: [0, 0], value: [5, 29]}, // 31
    ],
  });
});

test('can encode "upd_arr" operation', () => {
  const clock = new LogicalClock(5, 25);
  const builder = new PatchBuilder(clock);
  builder.updArr(clock.tick(1), clock.tick(1), clock.tick(1));
  const encoded = encode(builder.patch);
  expect(encoded).toEqual({
    id: [5, 28],
    ops: [
      {op: 'upd_arr', obj: [5, 25], ref: [5, 26], value: [5, 27]},
    ],
  });
});
