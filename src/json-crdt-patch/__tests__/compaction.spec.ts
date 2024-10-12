import {LogicalClock} from '../clock';
import {combine} from '../compaction';
import {SESSION} from '../constants';
import {NopOp} from '../operations';
import {Patch} from '../Patch';
import {PatchBuilder} from '../PatchBuilder';

describe('.combine()', () => {
  test('can combine two adjacent patches', () => {
    const builder = new PatchBuilder(new LogicalClock(123456789, 1));
    const objId = builder.json({
      str: 'hello',
      num: 123,
      tags: ['a', 'b', 'c'],
    });
    builder.root(objId);
    const patch = builder.flush();
    const str1 = patch + '';
    for (let i = 1; i < patch.ops.length - 2; i++) {
      const ops1 = patch.ops.slice(0, i);
      const ops2 = patch.ops.slice(i);
      const patch1 = new Patch();
      patch1.ops = patch1.ops.concat(ops1);
      const patch2 = new Patch();
      patch2.ops = patch2.ops.concat(ops2);
      combine(patch1, patch2);
      const str2 = patch1 + '';
      expect(str2).toBe(str1);
    }
  });

  test('can combine two patches with gap', () => {
    const builder1 = new PatchBuilder(new LogicalClock(123456789, 1));
    const builder2 = new PatchBuilder(new LogicalClock(123456789, 100));
    builder1.str();
    builder2.const(123);
    const patch1 = builder1.flush();
    const patch2 = builder2.flush();
    combine(patch1, patch2);
    expect(patch1.ops.length).toBe(3);
    expect(patch1.ops[1]).toBeInstanceOf(NopOp);
    const nop = patch1.ops[1] as NopOp;
    expect(nop.id.sid).toBe(123456789);
    expect(nop.id.time).toBe(2);
    expect(nop.len).toBe(98);
  });

  test('throws on mismatching sessions', () => {
    const builder1 = new PatchBuilder(new LogicalClock(1111111, 1));
    const builder2 = new PatchBuilder(new LogicalClock(2222222, 100));
    builder1.str();
    builder2.const(123);
    const patch1 = builder1.flush();
    const patch2 = builder2.flush();
    expect(() => combine(patch1, patch2)).toThrow(new Error('SID_MISMATCH'));
  });

  test('first patch can be empty', () => {
    const builder2 = new PatchBuilder(new LogicalClock(2222222, 100));
    builder2.const(123);
    const patch1 = new Patch();
    const patch2 = builder2.flush();
    combine(patch1, patch2);
    expect(patch1 + '').toBe(patch2 + '');
  });

  test('second patch can be empty', () => {
    const builder2 = new PatchBuilder(new LogicalClock(2222222, 100));
    builder2.const(123);
    const patch1 = new Patch();
    const patch2 = builder2.flush();
    const str1 = patch2 + '';
    combine(patch2, patch1);
    const str2 = patch2 + '';
    expect(str2).toBe(str1);
    expect(patch1.getId()).toBe(undefined);
  });

  test('throws if first patch has higher logical time', () => {
    const builder1 = new PatchBuilder(new LogicalClock(123456789, 1));
    const builder2 = new PatchBuilder(new LogicalClock(123456789, 100));
    builder1.str();
    builder2.const(123);
    const patch1 = builder1.flush();
    const patch2 = builder2.flush();
    expect(() => combine(patch2, patch1)).toThrow(new Error('TIMESTAMP_CONFLICT'));
    combine(patch1, patch2)
  });
});
