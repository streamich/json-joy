import {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';
import {Model} from '../model';
import {ValueType} from '../types/lww-value/ValueType';

describe('Document', () => {
  describe('value', () => {
    test('can create a value', () => {
      const doc = new Model();
      const builder = new PatchBuilder(doc.clock);
      const numId = builder.val([1, 2, 3]);
      doc.applyPatch(builder.patch);
      const obj = doc.nodes.get(numId);
      expect(obj).toBeInstanceOf(ValueType);
    });

    test('can set value as document root', () => {
      const doc = new Model();
      const builder = new PatchBuilder(doc.clock);
      const numId = builder.val(10_000);
      builder.root(numId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(10_000);
    });

    test('can update value to a number', () => {
      const doc = new Model();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.val(1);
      builder.setVal(objId, 2);
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(2);
    });

    test('can update value to a string', () => {
      const doc = new Model();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.val(1);
      builder.setVal(objId, 'boom');
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual('boom');
    });

    test('can overwrite number value', () => {
      const doc = new Model();
      const builder = new PatchBuilder(doc.clock);
      const valId = builder.val(-1);
      builder.setVal(valId, 123);
      builder.setVal(valId, 5.5);
      builder.root(valId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(5.5);
    });

    test('can set object field value as number', () => {
      const doc = new Model();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      const valId = builder.val(25);
      builder.setKeys(objId, [['gg', valId]]);
      builder.setVal(valId, 123);
      builder.setVal(valId, 99);
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual({gg: 99});
    });

    test('can update object field value to boolean', () => {
      const doc = new Model();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      const valId = builder.val(25);
      builder.setKeys(objId, [['gg', valId]]);
      builder.setVal(valId, 123);
      builder.setVal(valId, true);
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual({gg: true});
    });

    test('can update array value to boolean', () => {
      const doc = new Model();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.arr();
      const valId = builder.val(25);
      builder.insArr(objId, objId, [valId]);
      builder.setVal(valId, 123);
      builder.setVal(valId, true);
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true]);
    });
  });
});
