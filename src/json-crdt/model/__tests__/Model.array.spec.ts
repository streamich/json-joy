import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';
import {ArrNode} from '../../nodes';
import {interval, ClockVector, tick} from '../../../json-crdt-patch/clock';

describe('Document', () => {
  describe('array', () => {
    test('can create an array', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      doc.applyPatch(builder.patch);
      const obj = doc.index.get(arrId);
      expect(obj).toBeInstanceOf(ArrNode);
    });

    test('can set array as document root', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([]);
    });

    test('can add one element to array', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      builder.insArr(arrId, arrId, [t]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true]);
    });

    test('can add two elements to array', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const n = builder.const(null);
      builder.insArr(arrId, arrId, [t, n]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, null]);
    });

    test('can have array-in-array', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr1 = builder.arr();
      const arr2 = builder.arr();
      builder.insArr(arr1, arr1, [arr2]);
      builder.root(arr1);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([[]]);
    });

    test('can add two elements with two operations', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t]);
      builder.insArr(arrId, ins1, [n]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, null]);
    });

    test('can add three elements sequentially with three operations', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t]);
      const ins2 = builder.insArr(arrId, ins1, [n]);
      const ins3 = builder.insArr(arrId, ins2, [f]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, null, false]);
    });

    test('can add three elements with in-the-middle insertion', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t]);
      const ins2 = builder.insArr(arrId, ins1, [n]);
      const ins3 = builder.insArr(arrId, ins1, [f]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, false, null]);
    });

    test('can add three elements with two operations', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t]);
      const ins3 = builder.insArr(arrId, ins1, [f, n]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, false, null]);
    });

    test('can insert after last element in the chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, t]);
      const lastElementId = tick(ins1, 1);
      const ins2 = builder.insArr(arrId, lastElementId, [f, n]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, true, false, null]);
    });

    test('can insert after last element in the chunk twice', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, t]);
      const lastElementId1 = tick(ins1, 1);
      const ins2 = builder.insArr(arrId, lastElementId1, [f, n]);
      const lastElementId2 = tick(ins2, 1);
      const ins3 = builder.insArr(arrId, lastElementId2, [n]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, true, false, null, null]);
    });

    test('can insert after last element twice for the same chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, t]);
      const lastElementId1 = tick(ins1, 1);
      const ins2 = builder.insArr(arrId, lastElementId1, [f, n]);
      const ins3 = builder.insArr(arrId, lastElementId1, [n]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, true, null, false, null]);
    });

    test('can apply same patch trice', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, t]);
      const lastElementId1 = tick(ins1, 1);
      const ins2 = builder.insArr(arrId, lastElementId1, [f, n]);
      const ins3 = builder.insArr(arrId, lastElementId1, [n]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, true, null, false, null]);
    });

    test('insert at the beginning of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, t]);
      const ins2 = builder.insArr(arrId, ins1, [f, n]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, false, null, true]);
    });

    test('insert at the beginning of a chunk using two patches', () => {
      const doc = Model.withLogicalClock();
      const builder1 = new PatchBuilder(doc.clock);
      const arrId = builder1.arr();
      const t = builder1.const(true);
      const f = builder1.const(false);
      const n = builder1.const(null);
      const ins1 = builder1.insArr(arrId, arrId, [t, t]);
      builder1.root(arrId);
      const builder2 = new PatchBuilder(doc.clock);
      const ins2 = builder2.insArr(arrId, ins1, [f, n]);
      doc.applyPatch(builder1.patch);
      doc.applyPatch(builder2.patch);
      expect(doc.view()).toEqual([true, false, null, true]);
    });

    test('insert at the beginning of a chunk trice', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, t]);
      const ins2 = builder.insArr(arrId, ins1, [f, n]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, false, null, true]);
    });

    test('can delete a single element from single-element chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t]);
      const ins2 = builder.insArr(arrId, ins1, [f]);
      builder.del(arrId, [interval(ins2, 0, 1)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true]);
    });

    test('can delete a single element from single-element chunk in the middle of array', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t]);
      const ins2 = builder.insArr(arrId, ins1, [f]);
      const ins3 = builder.insArr(arrId, ins2, [n]);
      builder.del(arrId, [interval(ins2, 0, 1)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, null]);
    });

    test('delete last element in a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, f]);
      builder.del(arrId, [interval(ins1, 1, 1)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true]);
    });

    test('delete first two elements in chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, f, n]);
      builder.del(arrId, [interval(ins1, 0, 2)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([null]);
    });

    test('delete a section in the middle of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, f, n, t]);
      builder.del(arrId, [interval(ins1, 1, 2)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, true]);
    });

    test('delete two chunks using one delete operation', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t]);
      const ins2 = builder.insArr(arrId, ins1, [f]);
      const ins3 = builder.insArr(arrId, ins2, [n]);
      const ins4 = builder.insArr(arrId, ins3, [t]);
      builder.del(arrId, [interval(ins2, 0, 2)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, true]);
    });

    test('can delete across chunks', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t1 = builder.const(true);
      const t2 = builder.const(true);
      const t3 = builder.const(true);
      const f1 = builder.const(false);
      const f2 = builder.const(false);
      const f3 = builder.const(false);
      const f4 = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t1, t2, t3]);
      const ins2 = builder.insArr(arrId, tick(ins1, 2), [f1, f2]);
      const ins3 = builder.insArr(arrId, tick(ins2, 1), [n]);
      const ins4 = builder.insArr(arrId, ins3, [f3, f4]);
      builder.del(arrId, [interval(ins1, 1, 6)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, false]);
    });

    test('can delete across chunk when chunk were split due to insertion', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t1 = builder.const(true);
      const t2 = builder.const(true);
      const t3 = builder.const(true);
      const f1 = builder.const(false);
      const f2 = builder.const(false);
      const ins1 = builder.insArr(arrId, arrId, [t1, t2, t3]);
      const ins2 = builder.insArr(arrId, tick(ins1, 1), [f1, f2]);
      builder.del(arrId, [interval(ins1, 1, 2)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, false, false]);
    });

    test('can delete across chunk when chunk were split due to insertion - 2', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t1 = builder.const(true);
      const t2 = builder.const(true);
      const t3 = builder.const(true);
      const f1 = builder.const(false);
      const f2 = builder.const(false);
      const ins1 = builder.insArr(arrId, arrId, [t1, t2, t3]);
      const ins2 = builder.insArr(arrId, tick(ins1, 1), [f1, f2]);
      builder.del(arrId, [interval(ins1, 2, 1)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, true, false, false]);
    });

    test('can delete across chunk when chunk were split due to insertion - 3', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t1 = builder.const(true);
      const t2 = builder.const(true);
      const t3 = builder.const(true);
      const f1 = builder.const(false);
      const f2 = builder.const(false);
      const ins1 = builder.insArr(arrId, arrId, [t1, t2, t3]);
      const ins2 = builder.insArr(arrId, tick(ins1, 1), [f1, f2]);
      builder.del(arrId, [interval(ins1, 1, 1)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([true, false, false, true]);
    });

    test('can delete across chunk when chunk were split due to insertion - 4', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arrId = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arrId, arrId, [t, t, t]);
      const ins2 = builder.insArr(arrId, tick(ins1, 1), [f, f]);
      builder.del(arrId, [interval(ins1, 0, 3)]);
      builder.root(arrId);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual([false, false]);
    });

    test('can find ID in one one-element one-chunk array', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const f = builder.const(false);
      const ins1 = builder.insArr(arr, arr, [f]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      expect(node.find(0)).toStrictEqual(ins1);
    });

    test('can find ID in one one-chunk array', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const ins1 = builder.insArr(arr, arr, [builder.const(false), builder.const(true), builder.const(true)]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      expect(node.find(0)).toStrictEqual(ins1);
      expect(node.find(1)).toStrictEqual(tick(ins1, 1));
      expect(node.find(2)).toStrictEqual(tick(ins1, 2));
      expect(node.find(3)).toBe(undefined);
    });

    test('can find ID in multi-chunk array', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const ins1 = builder.insArr(arr, arr, [f, t, t]);
      const ins2 = builder.insArr(arr, tick(ins1, 2), [f, t, t]);
      const ins3 = builder.insArr(arr, tick(ins2, 2), [f, t, t]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      expect(node.find(0)).toStrictEqual(ins1);
      expect(node.find(1)).toStrictEqual(tick(ins1, 1));
      expect(node.find(2)).toStrictEqual(tick(ins1, 2));
      expect(node.find(3)).toStrictEqual(tick(ins2, 0));
      expect(node.find(4)).toStrictEqual(tick(ins2, 1));
      expect(node.find(5)).toStrictEqual(tick(ins2, 2));
      expect(node.find(6)).toStrictEqual(tick(ins3, 0));
      expect(node.find(7)).toStrictEqual(tick(ins3, 1));
      expect(node.find(8)).toStrictEqual(tick(ins3, 2));
      expect(node.find(9)).toBe(undefined);
    });

    test('can find value in multi-chunk array', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arr, arr, [f, t, t]);
      const ins2 = builder.insArr(arr, tick(ins1, 2), [f, t, t]);
      const ins3 = builder.insArr(arr, tick(ins2, 2), [f, t, t]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      expect(node.getNode(0)!.id).toStrictEqual(f);
      expect(node.getNode(1)!.id).toStrictEqual(t);
      expect(node.getNode(2)!.id).toStrictEqual(t);
      expect(node.getNode(3)!.id).toStrictEqual(f);
      expect(node.getNode(4)!.id).toStrictEqual(t);
      expect(node.getNode(5)!.id).toStrictEqual(t);
      expect(node.getNode(6)!.id).toStrictEqual(f);
      expect(node.getNode(7)!.id).toStrictEqual(t);
      expect(node.getNode(8)!.id).toStrictEqual(t);
      expect(node.getNode(9)).toBe(undefined);
    });

    test('can find span within one chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arr, arr, [f, t, t, n]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      const span = node.findInterval(1, 2);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 1);
      expect(span[0].span).toBe(2);
    });

    test('can find span at the beginning of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arr, arr, [f, t, t, n]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      const span = node.findInterval(0, 2);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time);
      expect(span[0].span).toBe(2);
    });

    test('can find span at the end of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arr, arr, [f, t, t, n]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      const span = node.findInterval(2, 2);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
    });

    test('can find span across two chunks', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arr, arr, [f, t, t, n]);
      builder.nop(1);
      const ins2 = builder.insArr(arr, tick(ins1, 3), [t, t, t]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      const span = node.findInterval(2, 3);
      expect(span.length).toBe(2);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
      expect(span[1].sid).toBe(ins2.sid);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
    });

    test('can find span across three chunks', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arr, arr, [f, t, t, n]);
      builder.nop(1);
      const ins2 = builder.insArr(arr, tick(ins1, 3), [t]);
      builder.nop(1);
      const ins3 = builder.insArr(arr, ins2, [t, t]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      const span = node.findInterval(2, 5);
      expect(span.length).toBe(3);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
      expect(span[1].sid).toBe(ins2.sid);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
      expect(span[2].sid).toBe(ins3.sid);
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(2);
    });

    test('can find span across three chunks - 2', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arr, arr, [f, t, t, n]);
      builder.nop(1);
      const ins2 = builder.insArr(arr, tick(ins1, 3), [t]);
      builder.nop(1);
      const ins3 = builder.insArr(arr, ins2, [t, t]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      const span = node.findInterval(2, 4);
      expect(span.length).toBe(3);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
      expect(span[1].sid).toBe(ins2.sid);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
      expect(span[2].sid).toBe(ins3.sid);
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(1);
    });

    test('can find span across two chunks, second with on element', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const arr = builder.arr();
      const t = builder.const(true);
      const f = builder.const(false);
      const n = builder.const(null);
      const ins1 = builder.insArr(arr, arr, [f, t, t, n]);
      builder.nop(1);
      const ins2 = builder.insArr(arr, tick(ins1, 3), [t]);
      builder.nop(1);
      const ins3 = builder.insArr(arr, ins2, [t, t]);
      builder.root(arr);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(arr)! as ArrNode;
      const span = node.findInterval(2, 3);
      expect(span.length).toBe(2);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
      expect(span[1].sid).toBe(ins2.sid);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
    });

    test('can insert element into a forked model', () => {
      const model1 = Model.withLogicalClock(new ClockVector(1234, 0));
      model1.api.set([[1]]);
      const model2 = model1.fork();
      model1.api.arr([]).ins(0, [2]);
      model2.api.arr([]).ins(0, [3]);
      expect(model1.view()).toStrictEqual([2, [1]]);
      expect(model2.view()).toStrictEqual([3, [1]]);
    });

    test('array in forked document is independent', () => {
      const model1 = Model.withLogicalClock();
      model1.api.set([1, {}]);
      const model2 = model1.fork();
      expect(model1.view()).toEqual([1, {}]);
      expect(model2.view()).toEqual([1, {}]);
      model2.api.obj([1]).set({foo: 'bar'});
      expect(model1.view()).toEqual([1, {}]);
      expect(model2.view()).toEqual([1, {foo: 'bar'}]);
    });
  });
});
