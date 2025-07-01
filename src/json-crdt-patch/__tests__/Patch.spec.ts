import {Model} from '../../json-crdt/model';
import {s} from '../schema';
import {LogicalClock, ts} from '../clock';
import {SESSION} from '../constants';
import type {InsArrOp} from '../operations';
import {PatchBuilder} from '../PatchBuilder';

describe('.rebase()', () => {
  describe('when sever clock is ahead', () => {
    test('rewrites IDs of new operations', () => {
      const builder = new PatchBuilder(new LogicalClock(SESSION.SERVER, 5));
      builder.insArr(ts(SESSION.SERVER, 3), ts(SESSION.SERVER, 3), [ts(0, 10)]);
      expect(builder.patch.ops[0].id.time).toBe(5);
      const patch = builder.patch.rebase(10, 5);
      expect(patch.ops[0].id.time).toBe(10);
    });

    test('does not rewrite references, which are committed on the server', () => {
      const builder = new PatchBuilder(new LogicalClock(SESSION.SERVER, 5));
      builder.insArr(ts(SESSION.SERVER, 3), ts(SESSION.SERVER, 3), [ts(0, 10)]);
      expect((builder.patch.ops[0] as InsArrOp).ref.time).toBe(3);
      const patch = builder.patch.rebase(10, 5);
      expect((patch.ops[0] as InsArrOp).ref.time).toBe(3);
    });

    test('rewrites new references, which are of the first ID in the patch', () => {
      const builder = new PatchBuilder(new LogicalClock(SESSION.SERVER, 5));
      builder.insArr(ts(SESSION.SERVER, 7), ts(SESSION.SERVER, 7), [ts(0, 10)]);
      expect((builder.patch.ops[0] as InsArrOp).ref.time).toBe(7);
      const patch = builder.patch.rebase(10, 5);
      expect((patch.ops[0] as InsArrOp).ref.time).toBe(12);
    });

    test('can advance patch ID', () => {
      const model = Model.create();
      model.api.set({
        foo: 'bar',
        num: s.con(123),
        arr: [null],
        vec: s.vec(s.con(1), s.con(2)),
        id: s.con(ts(4, 5)),
        val: s.val(s.con('asdf')),
        bin: s.bin(new Uint8Array([1, 2, 3])),
      });
      const patch1 = model.api.flush();
      const patch2 = patch1.rebase(1000);
      expect(patch1.getId()!.time).not.toBe(1000);
      expect(patch2.getId()!.time).toBe(1000);
      expect(patch2.getId()!.sid).toBe(patch1.getId()!.sid);
      const model2 = Model.create();
      model2.applyPatch(patch2);
      expect(model2.view()).toEqual(model.view());
    });

    test('transforms "con" ID values, if they share the patch SID', () => {
      const model = Model.create();
      const sid = model.clock.sid;
      model.api.set({
        id1: s.con(ts(4, 5)),
        id2: s.con(ts(model.clock.sid, 5)),
      });
      const patch1 = model.api.flush();
      const base = patch1.getId()!.time;
      const patch2 = patch1.rebase(1000);
      expect(patch1.getId()!.time).not.toBe(1000);
      expect(patch2.getId()!.time).toBe(1000);
      expect(patch2.getId()!.sid).toBe(patch1.getId()!.sid);
      const model2 = Model.create();
      model2.applyPatch(patch2);
      expect((model2.view() as any).id1).toEqual(ts(4, 5));
      expect((model2.view() as any).id2).toEqual(ts(sid, 1000 - base + 5));
    });
  });
});
