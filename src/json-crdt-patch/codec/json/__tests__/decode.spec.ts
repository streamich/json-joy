import {MakeStringOperation} from '../../../operations/MakeStringOperation';
import {SetRootOperation} from '../../../operations/SetRootOperation';
import {InsertStringSubstringOperation} from '../../../operations/InsertStringSubstringOperation';
import {decode} from '../decode';
import {MakeObjectOperation} from '../../../operations/MakeObjectOperation';
import {SetObjectKeysOperation} from '../../../operations/SetObjectKeysOperation';
import {JsonCodecPatch} from '../types';
import {encode} from '../encode';

test('decodes a simple patch', () => {
  const patch = decode({
    id: [ 3, 5 ],
    ops: [
      { op: 'root', after: [0, 0], value: [0, 3] }
    ]
  });
  expect(patch.ops.length).toBe(1);
  expect(patch.ops[0]).toBeInstanceOf(SetRootOperation);
  expect((patch.ops[0] as SetRootOperation).after.toString()).toBe('0!0');
  expect((patch.ops[0] as SetRootOperation).value.toString()).toBe('0!3');
});

test('decodes {foo: "bar"} object', () => {
  const patch = decode({
    id: [ 5, 25 ],
    ops: [
      { op: 'str' }, // 25
      { op: 'str_ins', after: [5, 25], value: 'bar' }, // 26-28
      { op: 'obj' }, // 29
      { op: 'obj_set', after: [5, 29], tuples: [['foo', [5, 25]]] }, // 30
      { op: 'root', after: [0, 0], value: [5, 29] } // 31
    ]
  });
  expect(patch.ops.length).toBe(5);
  expect(patch.getSpan()).toBe(7);
  expect(patch.getId()!.toString()).toBe('5!25');
  expect(patch.ops[0]).toBeInstanceOf(MakeStringOperation);
  expect(patch.ops[1]).toBeInstanceOf(InsertStringSubstringOperation);
  expect(patch.ops[2]).toBeInstanceOf(MakeObjectOperation);
  expect(patch.ops[3]).toBeInstanceOf(SetObjectKeysOperation);
  expect(patch.ops[4]).toBeInstanceOf(SetRootOperation);
  expect((patch.ops[1] as InsertStringSubstringOperation).after.toString()).toBe('5!25');
  expect((patch.ops[1] as InsertStringSubstringOperation).substring).toBe('bar');
  expect((patch.ops[3] as SetObjectKeysOperation).after.toString()).toBe('5!29');
  expect((patch.ops[3] as SetObjectKeysOperation).tuples[0][0]).toBe('foo');
  expect((patch.ops[3] as SetObjectKeysOperation).tuples[0][1].toString()).toBe('5!25');
  expect((patch.ops[4] as SetRootOperation).after.toString()).toBe('0!0');
  expect((patch.ops[4] as SetRootOperation).value.toString()).toBe('5!29');
});

test('test all operations', () => {
  const json: JsonCodecPatch = {
    id: [ 3, 100 ],
    ops: [
      { op: 'str' }, // 100
      { op: 'str_ins', after: [3, 100], value: 'qq' }, // 101, 102
      { op: 'arr' }, // 103
      { op: 'obj' }, // 104
      { op: 'obj_set', after: [3, 104], tuples: [
        ['foo', [3, 100]],
        ['hmm', [3, 103]]
      ] }, // 105, 106
      { op: 'num' }, // 107
      { op: 'num_set', after: [3, 107], value: 123.4}, // 108
      { op: 'arr_ins', after: [3, 103], values: [[3, 107]]}, // 109
      { op: 'root', after: [0, 0], value: [3, 104]}, // 110
      { op: 'del', after: [3, 109]}, // 111
      { op: 'del', after: [3, 101], len: 2}, // 112
    ]
  };
  const patch = decode(json);
  const encoded = encode(patch);

  expect(json).toEqual(encoded);
});