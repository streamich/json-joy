import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';

describe('Document', () => {
  describe('root', () => {
    test('default root value is undefined', () => {
      const doc = Model.create();
      expect(doc.view()).toBe(undefined);
    });

    test('can set root value to "true"', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const t = builder.json(true);
      builder.root(t);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toBe(true);
    });

    test('can set root value to "false"', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const t = builder.json(true);
      const f = builder.json(false);
      builder.root(t);
      builder.root(f);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toBe(false);
    });

    test('can set root value to "null"', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const t = builder.json(true);
      const f = builder.json(false);
      const n = builder.json(null);
      builder.root(t);
      builder.root(f);
      builder.root(n);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toBe(null);
    });
  });
});
