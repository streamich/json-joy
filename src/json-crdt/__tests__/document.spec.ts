import {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from '../constants';
import {Document} from '../document';
import {LWWNumberType} from '../lww-number/LWWNumberType';
import {LWWObjectType} from '../lww-object/LWWObjectType';
import {ArrayType} from '../array/ArrayType';

describe('Document', () => {
  describe('root', () => {
    test('default root value is undefined', () => {
      const doc = new Document();
      expect(doc.toJson()).toBe(undefined);
    });

    test('can set root value to "true"', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      builder.root(TRUE_ID);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toBe(true);
    });

    test('can set root value to "false"', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      builder.root(TRUE_ID);
      builder.root(FALSE_ID);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toBe(false);
    });

    test('can set root value to "null"', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      builder.root(TRUE_ID);
      builder.root(FALSE_ID);
      builder.root(NULL_ID);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toBe(null);
    });
  });

  describe('object', () => {
    test('can crate an object', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      doc.applyPatch(builder.patch);
      const obj = doc.nodes.get(objId);
      expect(obj).toBeInstanceOf(LWWObjectType);
    });

    test('can set object as document root', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual({});
    });

    test('can set object key', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      builder.setKeys(objId, [
        ['foo', TRUE_ID],
      ]);
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual({foo: true});
    });

    test('can set multiple object keys and nested object', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      const objId2 = builder.obj();
      builder.setKeys(objId, [
        ['foo', FALSE_ID],
        ['', NULL_ID],
        ['obj', objId2],
      ]);
      builder.setKeys(objId2, [
        ['a', TRUE_ID],
      ]);
      builder.setKeys(objId, [
        ['b', FALSE_ID],
      ]);
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual({
        foo: false,
        '': null,
        obj: {
          a: true,
        },
        b: false,
      });
    });

    test('can delete keys', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const objId = builder.obj();
      const objId2 = builder.obj();
      builder.setKeys(objId, [
        ['foo', FALSE_ID],
        ['', NULL_ID],
        ['obj', objId2],
      ]);
      builder.setKeys(objId2, [
        ['a', TRUE_ID],
      ]);
      builder.setKeys(objId, [
        ['b', FALSE_ID],
        ['obj', UNDEFINED_ID],
      ]);
      builder.setKeys(objId, [
        ['b', UNDEFINED_ID],
      ]);
      builder.root(objId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual({
        foo: false,
        '': null,
      });
    });
  });

  describe('number', () => {
    test('can crate a number', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const numId = builder.num();
      doc.applyPatch(builder.patch);
      const obj = doc.nodes.get(numId);
      expect(obj).toBeInstanceOf(LWWNumberType);
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

  describe('array', () => {
    test('can crate an array', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      doc.applyPatch(builder.patch);
      const obj = doc.nodes.get(arrId);
      expect(obj).toBeInstanceOf(ArrayType);
    });

    test('can set array as document root', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([]);
    });

    test('can add one element to array', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      builder.insArr(arrId, arrId, [TRUE_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true]);
    });

    test('can add two elements to array', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      builder.insArr(arrId, arrId, [TRUE_ID, NULL_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, null]);
    });

    test('can have array-in-array', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr1 = builder.arr();
      const arr2 = builder.arr();
      builder.insArr(arr1, arr1, [arr2]);
      builder.root(arr1);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([[]]);
    });

    test('can add two elements with two operations', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID]);
      builder.insArr(arrId, ins1, [NULL_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, null]);
    });

    test('can add three elements sequentially with three operations', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1, [NULL_ID]);
      const ins3 = builder.insArr(arrId, ins2, [FALSE_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, null, false]);
    });

    test('can add three elements with in-the-middle insertion', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1, [NULL_ID]);
      const ins3 = builder.insArr(arrId, ins1, [FALSE_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, false, null]);
    });

    test('can add three elements with two operations', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID]);
      const ins3 = builder.insArr(arrId, ins1, [FALSE_ID, NULL_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, false, null]);
    });

    test('can insert after last element in the chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID]);
      const lastElementId = ins1.tick(1);
      const ins2 = builder.insArr(arrId, lastElementId, [FALSE_ID, NULL_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, true, false, null]);
    });

    test('can insert after last element in the chunk twice', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID]);
      const lastElementId1 = ins1.tick(1);
      const ins2 = builder.insArr(arrId, lastElementId1, [FALSE_ID, NULL_ID]);
      const lastElementId2 = ins2.tick(1);
      const ins3 = builder.insArr(arrId, lastElementId2, [NULL_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, true, false, null, null]);
    });

    test('can insert after last element twice for the same chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID]);
      const lastElementId1 = ins1.tick(1);
      const ins2 = builder.insArr(arrId, lastElementId1, [FALSE_ID, NULL_ID]);
      const ins3 = builder.insArr(arrId, lastElementId1, [NULL_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      // console.log(doc.nodes.get(arrId)!.toString())
      expect(doc.toJson()).toEqual([true, true, null, false, null]);
    });
  });
});
