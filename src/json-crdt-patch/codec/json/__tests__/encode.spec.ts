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
    ops: [{op: 'val_set', obj: [0, 0], value: [0, 3]}],
  });
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
  expect(encoded).toEqual({
    id: [5, 25],
    ops: [
      {op: 'str'}, // 25
      {op: 'str_ins', obj: [5, 25], after: [5, 25], value: 'bar'}, // 26-28
      {op: 'obj'}, // 29
      {op: 'obj_set', obj: [5, 29], tuples: [['foo', [5, 25]]]}, // 30
      {op: 'val_set', obj: [0, 0], value: [5, 29]}, // 31
    ],
  });
});
