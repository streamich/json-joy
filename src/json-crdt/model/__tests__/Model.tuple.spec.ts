import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';
import {VecNode} from '../../nodes';

describe('Document', () => {
  describe('tuple', () => {
    test('can create a tuple', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.vec();
      doc.applyPatch(builder.patch);
      const obj = doc.index.get(id);
      expect(obj).toBeInstanceOf(VecNode);
      expect(obj?.view()).toStrictEqual([]);
    });

    test('can add elements to the tuple', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.vec();
      builder.insVec(id, [
        [0, builder.const(1)],
        [1, builder.json('2')],
      ]);
      doc.applyPatch(builder.patch);
      const obj = doc.index.get(id);
      expect(obj?.view()).toStrictEqual([1, '2']);
    });

    test('tuple holes are filled with "undefined" values', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.vec();
      builder.insVec(id, [
        [0, builder.const(1)],
        [2, builder.json({})],
      ]);
      doc.applyPatch(builder.patch);
      const obj = doc.index.get(id);
    });
  });
});
