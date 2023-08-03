import {NewStrOp, InsValOp, InsStrOp, NewObjOp, InsObjOp, NopOp} from '../../../operations';
import {decode} from '../decode';

test('decodes a simple patch', () => {
  const patch = decode({
    id: [3, 5],
    ops: [{op: 'ins_val', obj: [0, 0], value: [0, 3]}],
  });
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(InsValOp);
  expect((patch.ops[0] as InsValOp).val.sid).toBe(0);
  expect((patch.ops[0] as InsValOp).val.time).toBe(3);
});

test('decodes {foo: "bar"} object', () => {
  const patch = decode({
    id: [5, 25],
    ops: [
      {op: 'new_str'}, // 25
      {op: 'ins_str', obj: [5, 123], after: [5, 25], value: 'bar'}, // 26-28
      {op: 'nop', len: 2},
      {op: 'new_obj'}, // 31
      {op: 'ins_obj', obj: [5, 31], value: [['foo', [5, 25]]]}, // 32
      {op: 'ins_val', obj: [0, 0], value: [5, 31]}, // 33
    ],
  });
  expect(patch.ops.length).toBe(6);
  expect(patch.span()).toBe(9);
  expect(patch.getId()!.sid).toBe(5);
  expect(patch.getId()!.time).toBe(25);
  expect(patch.ops[0]).toBeInstanceOf(NewStrOp);
  expect(patch.ops[1]).toBeInstanceOf(InsStrOp);
  expect(patch.ops[2]).toBeInstanceOf(NopOp);
  expect(patch.ops[3]).toBeInstanceOf(NewObjOp);
  expect(patch.ops[4]).toBeInstanceOf(InsObjOp);
  expect(patch.ops[5]).toBeInstanceOf(InsValOp);
  expect((patch.ops[1] as InsStrOp).obj.sid).toBe(5);
  expect((patch.ops[1] as InsStrOp).obj.time).toBe(123);
  expect((patch.ops[1] as InsStrOp).ref.sid).toBe(5);
  expect((patch.ops[1] as InsStrOp).ref.time).toBe(25);
  expect((patch.ops[1] as InsStrOp).data).toBe('bar');
  expect((patch.ops[4] as InsObjOp).obj.sid).toBe(5);
  expect((patch.ops[4] as InsObjOp).obj.time).toBe(31);
  expect((patch.ops[4] as InsObjOp).data[0][0]).toBe('foo');
  expect((patch.ops[4] as InsObjOp).data[0][1].sid).toBe(5);
  expect((patch.ops[4] as InsObjOp).data[0][1].time).toBe(25);
  expect((patch.ops[5] as InsValOp).val.sid).toBe(5);
  expect((patch.ops[5] as InsValOp).val.time).toBe(31);
});
