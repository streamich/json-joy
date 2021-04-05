import {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';
import {FALSE_ID, NULL_ID, TRUE_ID} from '../../json-crdt-patch/constants';
import {Document} from '../document';
import {ArrayType} from '../types/rga-array/ArrayType';

describe('Document', () => {
  describe('array', () => {
    test('can create an array', () => {
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
      expect(doc.toJson()).toEqual([true, true, null, false, null]);
    });

    test('can apply same patch trice', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID]);
      const lastElementId1 = ins1.tick(1);
      const ins2 = builder.insArr(arrId, lastElementId1, [FALSE_ID, NULL_ID]);
      const ins3 = builder.insArr(arrId, lastElementId1, [NULL_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, true, null, false, null]);
    });

    test('insert at the beginning of a chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1, [FALSE_ID, NULL_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, false, null, true]);
    });

    test('insert at the beginning of a chunk using two patches', () => {
      const doc = new Document();
      const builder1 = new PatchBuilder(doc.clock);
      const arrId = builder1.arr();
      const ins1 = builder1.insArr(arrId, arrId, [TRUE_ID, TRUE_ID]);
      builder1.root(arrId);
      const builder2 = new PatchBuilder(doc.clock);
      const ins2 = builder2.insArr(arrId, ins1, [FALSE_ID, NULL_ID]);
      doc.applyPatch(builder1.patch);
      doc.applyPatch(builder2.patch);
      expect(doc.toJson()).toEqual([true, false, null, true]);
    });

    test('insert at the beginning of a chunk trice', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1, [FALSE_ID, NULL_ID]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, false, null, true]);
    });

    test('can delete a single element from single-element chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1, [FALSE_ID]);
      builder.del(arrId, ins2, 1);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true]);
    });

    test('can delete a single element from single-element chunk in the middle of array', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1, [FALSE_ID]);
      const ins3 = builder.insArr(arrId, ins2, [NULL_ID]);
      builder.del(arrId, ins2, 1);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, null]);
    });

    test('delete last element in a chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, FALSE_ID]);
      builder.del(arrId, ins1.tick(1), 1);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true]);
    });

    test('delete first two elements in chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, FALSE_ID, NULL_ID]);
      builder.del(arrId, ins1, 2);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([null]);
    });

    test('delete a section in the middle of a chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, FALSE_ID, NULL_ID, TRUE_ID]);
      builder.del(arrId, ins1.tick(1), 2);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, true]);
    });

    test('delete two chunks using one delete operation', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1, [FALSE_ID]);
      const ins3 = builder.insArr(arrId, ins2, [NULL_ID]);
      const ins4 = builder.insArr(arrId, ins3, [TRUE_ID]);
      builder.del(arrId, ins2, 2);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, true]);
    });

    test('can delete across chunks', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID, TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1.tick(2), [FALSE_ID, FALSE_ID]);
      const ins3 = builder.insArr(arrId, ins2.tick(1), [NULL_ID]);
      const ins4 = builder.insArr(arrId, ins3, [FALSE_ID, FALSE_ID]);
      builder.del(arrId, ins1.tick(1), 6);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, false]);
    });

    test('can delete across chunk when chunk were split due to insertion', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID, TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1.tick(1), [FALSE_ID, FALSE_ID]);
      builder.del(arrId, ins1.tick(1), 2);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, false, false]);
    });

    test('can delete across chunk when chunk were split due to insertion - 2', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID, TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1.tick(1), [FALSE_ID, FALSE_ID]);
      builder.del(arrId, ins1.tick(2), 1);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, true, false, false]);
    });

    test('can delete across chunk when chunk were split due to insertion - 3', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID, TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1.tick(1), [FALSE_ID, FALSE_ID]);
      builder.del(arrId, ins1.tick(1), 1);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([true, false, false, true]);
    });

    test('can delete across chunk when chunk were split due to insertion - 4', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const ins1 = builder.insArr(arrId, arrId, [TRUE_ID, TRUE_ID, TRUE_ID]);
      const ins2 = builder.insArr(arrId, ins1.tick(1), [FALSE_ID, FALSE_ID]);
      builder.del(arrId, ins1, 3);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual([false, false]);
    });

    test('can find ID in one one-element one-chunk array', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      expect(node.findId(0).toString()).toBe(ins1.toString());
    });

    test('can find ID in one one-chunk array', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      expect(node.findId(0).toString()).toBe(ins1.toString());
      expect(node.findId(1).toString()).toBe(ins1.tick(1).toString());
      expect(node.findId(2).toString()).toBe(ins1.tick(2).toString());
      expect(() => node.findId(3)).toThrowError(new Error('OUT_OF_BOUNDS'));
    });

    test('can find ID in multi-chunk array', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID]);
      const ins2 = builder.insArr(arr, ins1.tick(2), [FALSE_ID, TRUE_ID, TRUE_ID]);
      const ins3 = builder.insArr(arr, ins2.tick(2), [FALSE_ID, TRUE_ID, TRUE_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      expect(node.findId(0).toString()).toBe(ins1.toString());
      expect(node.findId(1).toString()).toBe(ins1.tick(1).toString());
      expect(node.findId(2).toString()).toBe(ins1.tick(2).toString());
      expect(node.findId(3).toString()).toBe(ins2.tick(0).toString());
      expect(node.findId(4).toString()).toBe(ins2.tick(1).toString());
      expect(node.findId(5).toString()).toBe(ins2.tick(2).toString());
      expect(node.findId(6).toString()).toBe(ins3.tick(0).toString());
      expect(node.findId(7).toString()).toBe(ins3.tick(1).toString());
      expect(node.findId(8).toString()).toBe(ins3.tick(2).toString());
      expect(() => node.findId(9)).toThrowError(new Error('OUT_OF_BOUNDS'));
    });

    test('can find value in multi-chunk array', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID]);
      const ins2 = builder.insArr(arr, ins1.tick(2), [FALSE_ID, TRUE_ID, TRUE_ID]);
      const ins3 = builder.insArr(arr, ins2.tick(2), [FALSE_ID, TRUE_ID, TRUE_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      expect(node.findValue(0).toString()).toBe(FALSE_ID.toString());
      expect(node.findValue(1).toString()).toBe(TRUE_ID.toString());
      expect(node.findValue(2).toString()).toBe(TRUE_ID.toString());
      expect(node.findValue(3).toString()).toBe(FALSE_ID.toString());
      expect(node.findValue(4).toString()).toBe(TRUE_ID.toString());
      expect(node.findValue(5).toString()).toBe(TRUE_ID.toString());
      expect(node.findValue(6).toString()).toBe(FALSE_ID.toString());
      expect(node.findValue(7).toString()).toBe(TRUE_ID.toString());
      expect(node.findValue(8).toString()).toBe(TRUE_ID.toString());
      expect(() => node.findId(9)).toThrowError(new Error('OUT_OF_BOUNDS'));
    });

    test('can find span within one chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID, NULL_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      const span = node.findIdSpans(1, 2);
      expect(span[0].sessionId).toBe(ins1.sessionId);
      expect(span[0].time).toBe(ins1.time + 1);
      expect(span[0].span).toBe(2);
    });

    test('can find span at the beginning of a chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID, NULL_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      const span = node.findIdSpans(0, 2);
      expect(span[0].sessionId).toBe(ins1.sessionId);
      expect(span[0].time).toBe(ins1.time);
      expect(span[0].span).toBe(2);
    });

    test('can find span at the end of a chunk', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID, NULL_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      const span = node.findIdSpans(2, 2);
      expect(span[0].sessionId).toBe(ins1.sessionId);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
    });

    test('can find span across two chunks', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID, NULL_ID]);
      builder.noop(1);
      const ins2 = builder.insArr(arr, ins1.tick(3), [TRUE_ID, TRUE_ID, TRUE_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      const span = node.findIdSpans(2, 3);
      expect(span.length).toBe(2);
      expect(span[0].sessionId).toBe(ins1.sessionId);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
      expect(span[1].sessionId).toBe(ins2.sessionId);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
    });

    test('can find span across three chunks', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID, NULL_ID]);
      builder.noop(1);
      const ins2 = builder.insArr(arr, ins1.tick(3), [TRUE_ID]);
      builder.noop(1);
      const ins3 = builder.insArr(arr, ins2, [TRUE_ID, TRUE_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      const span = node.findIdSpans(2, 5);
      expect(span.length).toBe(3);
      expect(span[0].sessionId).toBe(ins1.sessionId);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
      expect(span[1].sessionId).toBe(ins2.sessionId);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
      expect(span[2].sessionId).toBe(ins3.sessionId);
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(2);
    });

    test('can find span across three chunks - 2', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID, NULL_ID]);
      builder.noop(1);
      const ins2 = builder.insArr(arr, ins1.tick(3), [TRUE_ID]);
      builder.noop(1);
      const ins3 = builder.insArr(arr, ins2, [TRUE_ID, TRUE_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      const span = node.findIdSpans(2, 4);
      expect(span.length).toBe(3);
      expect(span[0].sessionId).toBe(ins1.sessionId);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
      expect(span[1].sessionId).toBe(ins2.sessionId);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
      expect(span[2].sessionId).toBe(ins3.sessionId);
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(1);
    });

    test('can find span across two chunks, second with on element', () => {
      const doc = new Document();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [FALSE_ID, TRUE_ID, TRUE_ID, NULL_ID]);
      builder.noop(1);
      const ins2 = builder.insArr(arr, ins1.tick(3), [TRUE_ID]);
      builder.noop(1);
      const ins3 = builder.insArr(arr, ins2, [TRUE_ID, TRUE_ID]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.nodes.get(arr)! as ArrayType;
      const span = node.findIdSpans(2, 3);
      expect(span.length).toBe(2);
      expect(span[0].sessionId).toBe(ins1.sessionId);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
      expect(span[1].sessionId).toBe(ins2.sessionId);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
    });
  });
});
