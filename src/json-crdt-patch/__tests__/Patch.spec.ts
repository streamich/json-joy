import {LogicalClock, ts} from '../clock';
import {SESSION} from '../constants';
import {ArrInsOp} from '../operations/ArrInsOp';
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

    test('does not rewrite references, which are commited on the server', () => {
      const builder = new PatchBuilder(new LogicalClock(SESSION.SERVER, 5));
      builder.insArr(ts(SESSION.SERVER, 3), ts(SESSION.SERVER, 3), [ts(0, 10)]);
      expect((builder.patch.ops[0] as ArrInsOp).ref.time).toBe(3);
      const patch = builder.patch.rebase(10, 5);
      expect((patch.ops[0] as ArrInsOp).ref.time).toBe(3);
    });

    test('rewrites new references, which are of the first ID in the patch', () => {
      const builder = new PatchBuilder(new LogicalClock(SESSION.SERVER, 5));
      builder.insArr(ts(SESSION.SERVER, 7), ts(SESSION.SERVER, 7), [ts(0, 10)]);
      expect((builder.patch.ops[0] as ArrInsOp).ref.time).toBe(7);
      const patch = builder.patch.rebase(10, 5);
      expect((patch.ops[0] as ArrInsOp).ref.time).toBe(12);
    });
  });
});
