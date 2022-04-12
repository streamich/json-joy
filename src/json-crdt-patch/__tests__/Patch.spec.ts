import {ServerClock, ServerTimestamp} from '../clock';
import {TRUE_ID} from '../constants';
import {InsertArrayElementsOperation} from '../operations/InsertArrayElementsOperation';
import {PatchBuilder} from '../PatchBuilder';

describe('.rebase()', () => {
  describe('when sever clock is ahead', () => {
    test('rewrites IDs of new operations', () => {
      const builder = new PatchBuilder(new ServerClock(5));
      builder.insArr(new ServerTimestamp(3), new ServerTimestamp(3), [TRUE_ID]);
      expect(builder.patch.ops[0].id.time).toBe(5);
      const patch = builder.patch.rebase(10, 5);
      expect(patch.ops[0].id.time).toBe(10);
    });

    test('does not rewrite references, which are commited on the server', () => {
      const builder = new PatchBuilder(new ServerClock(5));
      builder.insArr(new ServerTimestamp(3), new ServerTimestamp(3), [TRUE_ID]);
      expect((builder.patch.ops[0] as InsertArrayElementsOperation).after.time).toBe(3);
      const patch = builder.patch.rebase(10, 5);
      expect((patch.ops[0] as InsertArrayElementsOperation).after.time).toBe(3);
    });

    test('rewrites new references, which are of the first ID in the patch', () => {
      const builder = new PatchBuilder(new ServerClock(5));
      builder.insArr(new ServerTimestamp(7), new ServerTimestamp(7), [TRUE_ID]);
      expect((builder.patch.ops[0] as InsertArrayElementsOperation).after.time).toBe(7);
      const patch = builder.patch.rebase(10, 5);
      expect((patch.ops[0] as InsertArrayElementsOperation).after.time).toBe(12);
    });
  });
});
