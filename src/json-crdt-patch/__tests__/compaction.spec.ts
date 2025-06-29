import {equal, LogicalClock, tick, ts} from '../clock';
import {combine, compact} from '../compaction';
import {InsStrOp, NopOp} from '../operations';
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
      combine([patch1, patch2]);
      const str2 = patch1 + '';
      expect(str2).toBe(str1);
    }
  });

  test('can combine three adjacent patches', () => {
    const builder = new PatchBuilder(new LogicalClock(123456789, 1));
    const objId = builder.json({
      str: 'hello',
      num: 123,
      tags: ['a', 'b', 'c'],
    });
    builder.root(objId);
    const patch = builder.flush();
    const str1 = patch + '';
    const ops1 = patch.ops.slice(0, 2);
    const ops2 = patch.ops.slice(2, 4);
    const ops3 = patch.ops.slice(4);
    const patch1 = new Patch();
    patch1.ops = patch1.ops.concat(ops1);
    const patch2 = new Patch();
    patch2.ops = patch2.ops.concat(ops2);
    const patch3 = new Patch();
    patch3.ops = patch3.ops.concat(ops3);
    combine([patch1, patch2, patch3]);
    const str2 = patch1 + '';
    expect(str2).toBe(str1);
  });

  test('can combine two patches with gap', () => {
    const builder1 = new PatchBuilder(new LogicalClock(123456789, 1));
    const builder2 = new PatchBuilder(new LogicalClock(123456789, 100));
    builder1.str();
    builder2.con(123);
    const patch1 = builder1.flush();
    const patch2 = builder2.flush();
    combine([patch1, patch2]);
    expect(patch1.ops.length).toBe(3);
    expect(patch1.ops[1]).toBeInstanceOf(NopOp);
    const nop = patch1.ops[1] as NopOp;
    expect(nop.id.sid).toBe(123456789);
    expect(nop.id.time).toBe(2);
    expect(nop.len).toBe(98);
  });

  test('can combine four patches with gap', () => {
    const builder1 = new PatchBuilder(new LogicalClock(123456789, 1));
    const builder2 = new PatchBuilder(new LogicalClock(123456789, 100));
    const builder3 = new PatchBuilder(new LogicalClock(123456789, 110));
    const builder4 = new PatchBuilder(new LogicalClock(123456789, 220));
    builder1.str();
    builder2.con(123);
    builder3.obj();
    builder4.bin();
    const patch1 = builder1.flush();
    const patch2 = builder2.flush();
    const patch3 = builder3.flush();
    const patch4 = builder4.flush();
    combine([patch1, patch2, patch3, patch4]);
    expect(patch1.ops.length).toBe(7);
    expect(patch1.ops[1]).toBeInstanceOf(NopOp);
    expect(patch1.ops[3]).toBeInstanceOf(NopOp);
    expect(patch1.ops[5]).toBeInstanceOf(NopOp);
  });

  test('throws on mismatching sessions', () => {
    const builder1 = new PatchBuilder(new LogicalClock(1111111, 1));
    const builder2 = new PatchBuilder(new LogicalClock(2222222, 100));
    builder1.str();
    builder2.con(123);
    const patch1 = builder1.flush();
    const patch2 = builder2.flush();
    expect(() => combine([patch1, patch2])).toThrow(new Error('SID_MISMATCH'));
  });

  test('first patch can be empty', () => {
    const builder2 = new PatchBuilder(new LogicalClock(2222222, 100));
    builder2.con(123);
    const patch1 = new Patch();
    const patch2 = builder2.flush();
    combine([patch1, patch2]);
    expect(patch1 + '').toBe(patch2 + '');
  });

  test('second patch can be empty', () => {
    const builder2 = new PatchBuilder(new LogicalClock(2222222, 100));
    builder2.con(123);
    const patch1 = new Patch();
    const patch2 = builder2.flush();
    const str1 = patch2 + '';
    combine([patch2, patch1]);
    const str2 = patch2 + '';
    expect(str2).toBe(str1);
    expect(patch1.getId()).toBe(undefined);
  });

  test('throws if first patch has higher logical time', () => {
    const builder1 = new PatchBuilder(new LogicalClock(123456789, 1));
    const builder2 = new PatchBuilder(new LogicalClock(123456789, 100));
    builder1.str();
    builder2.con(123);
    const patch1 = builder1.flush();
    const patch2 = builder2.flush();
    expect(() => combine([patch2, patch1])).toThrow(new Error('TIMESTAMP_CONFLICT'));
    combine([patch1, patch2]);
  });
});

describe('.compact()', () => {
  test('can combine two consecutive string inserts', () => {
    const builder = new PatchBuilder(new LogicalClock(123456789, 1));
    const strId = builder.str();
    const ins1Id = builder.insStr(strId, strId, 'hello');
    builder.insStr(strId, tick(ins1Id, 'hello'.length - 1), ' world');
    builder.root(strId);
    const patch = builder.flush();
    const patch2 = patch.clone();
    compact(patch);
    expect(equal(patch.ops[0].id, patch2.ops[0].id)).toBe(true);
    expect(equal(patch.ops[1].id, patch2.ops[1].id)).toBe(true);
    expect(equal(patch.ops[2].id, patch2.ops[3].id)).toBe(true);
    expect((patch.ops[1] as any).data).toBe('hello world');
  });

  test('can combine two consecutive string inserts - 2', () => {
    const builder = new PatchBuilder(new LogicalClock(123456789, 1));
    const strId = builder.str();
    const ins1Id = builder.insStr(strId, strId, 'a');
    builder.insStr(strId, tick(ins1Id, 'a'.length - 1), 'b');
    builder.root(strId);
    const patch = builder.flush();
    const patch2 = patch.clone();
    compact(patch);
    expect(equal(patch.ops[0].id, patch2.ops[0].id)).toBe(true);
    expect(equal(patch.ops[1].id, patch2.ops[1].id)).toBe(true);
    expect(equal(patch.ops[2].id, patch2.ops[3].id)).toBe(true);
    expect((patch.ops[1] as any).data).toBe('ab');
  });

  test('can combine two consecutive string inserts - 3', () => {
    const patch = new Patch();
    patch.ops.push(new InsStrOp(ts(123, 30), ts(123, 10), ts(123, 20), 'a'));
    patch.ops.push(new InsStrOp(ts(123, 31), ts(123, 10), ts(123, 30), 'b'));
    compact(patch);
    expect(patch.ops.length).toBe(1);
    expect((patch.ops[0] as InsStrOp).data).toBe('ab');
  });

  test('does not combine inserts, if they happen into different strings', () => {
    const patch = new Patch();
    patch.ops.push(new InsStrOp(ts(123, 30), ts(123, 10), ts(123, 20), 'a'));
    patch.ops.push(new InsStrOp(ts(123, 31), ts(123, 99), ts(123, 30), 'b'));
    compact(patch);
    expect(patch.ops.length).toBe(2);
  });

  test('does not combine inserts, if time is not consecutive', () => {
    const patch = new Patch();
    patch.ops.push(new InsStrOp(ts(123, 30), ts(123, 10), ts(123, 20), 'a'));
    patch.ops.push(new InsStrOp(ts(123, 99), ts(123, 10), ts(123, 30), 'b'));
    compact(patch);
    expect(patch.ops.length).toBe(2);
  });

  test('does not combine inserts, if the second operation is not an append', () => {
    const patch = new Patch();
    patch.ops.push(new InsStrOp(ts(123, 30), ts(123, 10), ts(123, 20), 'a'));
    patch.ops.push(new InsStrOp(ts(123, 31), ts(123, 10), ts(123, 22), 'b'));
    compact(patch);
    expect(patch.ops.length).toBe(2);
  });

  test('does not combine inserts, if the second operation is not an append - 2', () => {
    const patch = new Patch();
    patch.ops.push(new InsStrOp(ts(123, 30), ts(123, 10), ts(123, 20), 'a'));
    patch.ops.push(new InsStrOp(ts(123, 31), ts(123, 10), ts(999, 30), 'b'));
    compact(patch);
    expect(patch.ops.length).toBe(2);
  });

  test('returns a patch as-is', () => {
    const builder = new PatchBuilder(new LogicalClock(123456789, 1));
    builder.root(builder.json({str: 'hello'}));
    const patch = builder.flush();
    const str1 = patch + '';
    compact(patch);
    const str2 = patch + '';
    expect(str2).toBe(str1);
  });
});
