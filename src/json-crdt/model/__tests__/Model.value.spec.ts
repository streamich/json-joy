import {Model} from '../Model';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {ValNode} from '../../nodes';

describe('Document', () => {
  describe('value', () => {
    test('can create a value', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const numId = builder.val();
      const val = builder.const([1, 2, 3]);
      builder.setVal(numId, val);
      doc.applyPatch(builder.patch);
      const obj = doc.index.get(numId);
      expect(obj).toBeInstanceOf(ValNode);
    });

    test('can set value as document root', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const numId = builder.val();
      builder.setVal(numId, builder.const(10_000));
      builder.root(numId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(10_000);
    });

    test('can update value to a number', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.val();
      builder.setVal(objId, builder.const(1));
      builder.setVal(objId, builder.const(2));
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(2);
    });

    test('can update value to a string', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.val();
      builder.setVal(objId, builder.const(1));
      builder.setVal(objId, builder.const('boom'));
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('boom');
    });

    test('can overwrite number value', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const valId = builder.val();
      builder.setVal(valId, builder.const(-1));
      builder.setVal(valId, builder.const(123));
      builder.setVal(valId, builder.const(5.5));
      builder.root(valId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(5.5);
    });

    test('can set object field value as number', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      const valId = builder.val();
      builder.setVal(valId, builder.const(25));
      builder.insObj(objId, [['gg', valId]]);
      builder.setVal(valId, builder.const(123));
      builder.setVal(valId, builder.const(99));
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual({gg: 99});
    });

    test('can update object field value to boolean', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      const valId = builder.val();
      builder.setVal(valId, builder.const(25));
      builder.insObj(objId, [['gg', valId]]);
      builder.setVal(valId, builder.const(123));
      builder.setVal(valId, builder.const(true));
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual({gg: true});
    });

    test('can update array value to boolean', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.arr();
      const valId = builder.val();
      builder.setVal(valId, builder.const(25));
      builder.insArr(objId, objId, [valId]);
      builder.setVal(valId, builder.const(123));
      builder.setVal(valId, builder.const(true));
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true]);
    });
  });
});
