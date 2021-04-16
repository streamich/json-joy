import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {FALSE_ID, NULL_ID, TRUE_ID} from '../../../json-crdt-patch/constants';
import {Model} from '../Model';

describe('Document', () => {
  describe('root', () => {
    test('default root value is undefined', () => {
      const doc = Model.withLogicalClock();
      expect(doc.toJson()).toBe(undefined);
    });

    test('can set root value to "true"', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      builder.root(TRUE_ID);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toBe(true);
    });

    test('can set root value to "false"', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      builder.root(TRUE_ID);
      builder.root(FALSE_ID);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toBe(false);
    });

    test('can set root value to "null"', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      builder.root(TRUE_ID);
      builder.root(FALSE_ID);
      builder.root(NULL_ID);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toBe(null);
    });
  });
});
