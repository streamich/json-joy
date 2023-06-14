import {StrOp} from '../../../operations/StrOp';
import {StrInsOp} from '../../../operations/StrInsOp';
import {decode} from '../decode';
import {ObjOp} from '../../../operations/ObjOp';
import {ObjSetOp} from '../../../operations/ObjSetOp';
import {NoopOp} from '../../../operations/NoopOp';
import {ValSetOp} from '../../../operations/ValSetOp';

test('decodes a simple patch', () => {
  const patch = decode({
    id: [3, 5],
    ops: [{op: 'val_set', obj: [0, 0], value: [0, 3]}],
  });
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(ValSetOp);
  expect((patch.ops[0] as ValSetOp).val.sid).toBe(0);
  expect((patch.ops[0] as ValSetOp).val.time).toBe(3);
});

test('decodes {foo: "bar"} object', () => {
  const patch = decode({
    id: [5, 25],
    ops: [
      {op: 'str'}, // 25
      {op: 'str_ins', obj: [5, 123], after: [5, 25], value: 'bar'}, // 26-28
      {op: 'noop', len: 2},
      {op: 'obj'}, // 31
      {op: 'obj_set', obj: [5, 31], tuples: [['foo', [5, 25]]]}, // 32
      {op: 'val_set', obj: [0, 0], value: [5, 31]}, // 33
    ],
  });
  expect(patch.ops.length).toBe(6);
  expect(patch.span()).toBe(7);
  expect(patch.getId()!.sid).toBe(5);
  expect(patch.getId()!.time).toBe(25);
  expect(patch.ops[0]).toBeInstanceOf(StrOp);
  expect(patch.ops[1]).toBeInstanceOf(StrInsOp);
  expect(patch.ops[2]).toBeInstanceOf(NoopOp);
  expect(patch.ops[3]).toBeInstanceOf(ObjOp);
  expect(patch.ops[4]).toBeInstanceOf(ObjSetOp);
  expect(patch.ops[5]).toBeInstanceOf(ValSetOp);
  expect((patch.ops[1] as StrInsOp).obj.sid).toBe(5);
  expect((patch.ops[1] as StrInsOp).obj.time).toBe(123);
  expect((patch.ops[1] as StrInsOp).ref.sid).toBe(5);
  expect((patch.ops[1] as StrInsOp).ref.time).toBe(25);
  expect((patch.ops[1] as StrInsOp).data).toBe('bar');
  expect((patch.ops[4] as ObjSetOp).obj.sid).toBe(5);
  expect((patch.ops[4] as ObjSetOp).obj.time).toBe(31);
  expect((patch.ops[4] as ObjSetOp).data[0][0]).toBe('foo');
  expect((patch.ops[4] as ObjSetOp).data[0][1].sid).toBe(5);
  expect((patch.ops[4] as ObjSetOp).data[0][1].time).toBe(25);
  expect((patch.ops[5] as ValSetOp).val.sid).toBe(5);
  expect((patch.ops[5] as ValSetOp).val.time).toBe(31);
});
