import {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';
import {Document} from '../document';
import {NumberType} from '../types/lww-number/NumberType';

describe('Document', () => {
  describe('number', () => {
    test('can create a number', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const numId = builder.num();
      doc.applyPatch(builder.patch);
      const obj = doc.nodes.get(numId);
      expect(obj).toBeInstanceOf(NumberType);
    });

    test('can set number as document root', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const numId = builder.num();
      builder.root(numId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(0);
    });

    test('can set number value', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const numId = builder.num();
      builder.setNum(numId, 123);
      builder.root(numId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(123);
    });

    test('can overwrite number value', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const numId = builder.num();
      builder.setNum(numId, 123);
      builder.setNum(numId, 5.5);
      builder.root(numId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(5.5);
    });

    test('can set object field value as number', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      const numId = builder.num();
      builder.setKeys(objId, [['gg', numId]]);
      builder.setNum(numId, 123);
      builder.setNum(numId, 99);
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual({gg: 99});
    });
  });
});
