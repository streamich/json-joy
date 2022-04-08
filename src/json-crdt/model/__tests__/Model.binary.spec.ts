import {BinaryType} from '../../types/rga-binary/BinaryType';
import {Model} from '../Model';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';

describe('Document', () => {
  describe('binary', () => {
    test('can create a binary', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      doc.applyPatch(builder.patch);
      const obj = doc.node(id);
      expect(obj).toBeInstanceOf(BinaryType);
    });

    test('can set binary as document root', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([]));
    });

    test('can add one octet to a binary', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      builder.insBin(id, id, new Uint8Array([1]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([1]));
    });

    test('can add many octets in one operation', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      builder.insBin(id, id, new Uint8Array([1, 2, 3, 4]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    test('can insert three octets sequentially using three operations', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([2]));
      const ins3 = builder.insBin(id, ins2, new Uint8Array([3]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([1, 2, 3]));
    });

    test('can insert three octets with two operations', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([2, 3]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([1, 2, 3]));
    });

    test('can insert at the end of two-octet binary', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, ins1.tick(1), new Uint8Array([3, 4]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    test('can insert at the end of two-octet binary twice', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, ins1.tick(1), new Uint8Array([3, 4]));
      const ins3 = builder.insBin(id, ins2.tick(1), new Uint8Array([5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    test('can insert at the end of the same two-octet binary twice', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, ins1.tick(1), new Uint8Array([3, 4]));
      const ins3 = builder.insBin(id, ins1.tick(1), new Uint8Array([5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([1, 2, 5, 3, 4]));
    });

    test('can apply the same patch trice', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, ins1.tick(1), new Uint8Array([3, 4]));
      const ins3 = builder.insBin(id, ins1.tick(1), new Uint8Array([5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([1, 2, 5, 3, 4]));
    });

    test('can insert at the beginning of two-octet binary', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([3, 4]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toJson()).toEqual(new Uint8Array([1, 3, 4, 2]));
    });

    test('can delete a single octet from one-octet chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([5]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([13]));
      builder.del(id, ins1, 1);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([13]));
    });

    test('can delete a single octet from one-octet chunk in the middle of binary', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([5]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([6]));
      const ins3 = builder.insBin(id, ins2, new Uint8Array([7]));
      builder.del(id, ins2, 1);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([5, 7]));
    });

    test('can delete last octet in two-octet chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      builder.del(id, ins1.tick(1), 1);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toJson()).toEqual(new Uint8Array([1]));
    });

    test('can delete first two octets in three-octet chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([2, 3, 4]));
      builder.del(id, ins1, 2);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toJson()).toEqual(new Uint8Array([4]));
    });

    test('can delete a range in the middle of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([0, 1, 2, 3, 4, 5, 6]));
      builder.del(id, ins1.tick(2), 2);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toJson()).toEqual(new Uint8Array([0, 1, 4, 5, 6]));
    });

    test('can delete two chunks using one delete operation', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([2]));
      const ins3 = builder.insBin(id, ins2, new Uint8Array([3]));
      const ins4 = builder.insBin(id, ins3, new Uint8Array([4]));
      builder.del(id, ins2, 2);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toJson()).toEqual(new Uint8Array([1, 4]));
    });

    test('can delete across chunks', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      const ins2 = builder.insBin(id, ins1.tick(4), new Uint8Array([6]));
      const ins3 = builder.insBin(id, ins2, new Uint8Array([7, 8, 9, 10, 11, 12]));
      const ins4 = builder.insBin(id, ins3.tick(5), new Uint8Array([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]));
      builder.del(id, ins1.tick(3), 11);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toJson()).toEqual(new Uint8Array([1, 2, 3, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]));
    });

    test('can delete across chunk when chunk were split due to insertion', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([11]));
      const ins3 = builder.insBin(id, ins1.tick(4), new Uint8Array([22]));
      builder.del(id, ins1, 3);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      // console.log(doc.node(str)!.toJson());
      expect(doc.toJson()).toEqual(new Uint8Array([11, 4, 5, 22]));
    });

    test('can find ID in one one-octet chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array(4));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      expect(node.findId(0).toString()).toBe(ins1.toString());
    });

    test('can find ID in one chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      expect(node.findId(2).toString()).toBe(ins1.tick(2).toString());
    });

    test('can find ID in second chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      const ins2 = builder.insBin(id, ins1.tick(4), new Uint8Array([6, 7, 8, 9, 10, 11]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      // console.log(doc.toJson());
      expect(node.findId(2).toString()).toBe(ins1.tick(2).toString());
      expect(node.findId(6).toString()).toBe(ins2.tick(1).toString());
      expect(node.findId(10).toString()).toBe(ins2.tick(5).toString());
      expect(() => node.findId(11)).toThrowError(new Error('OUT_OF_BOUNDS'));
    });

    test('can find span within one chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      const span = node.findIdSpan(1, 1);
      expect(span.length).toBe(1);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time + 1);
      expect(span[0].span).toBe(1);
    });

    test('can find span within one chunk - 2', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      const span = node.findIdSpan(2, 2);
      expect(span.length).toBe(1);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
    });

    test('can find span at the beginning of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      const span = node.findIdSpan(0, 3);
      expect(span.length).toBe(1);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time);
      expect(span[0].span).toBe(3);
    });

    test('can find span at the end of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      const span = node.findIdSpan(2, 3);
      expect(span.length).toBe(1);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(3);
    });

    test('can find span across two chunks', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.noop(123);
      const ins2 = builder.insBin(id, ins1.tick(2), new Uint8Array([4, 5, 6]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      const span = node.findIdSpan(2, 2);
      expect(span.length).toBe(2);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(1);
      expect(span[1].getSessionId()).toBe(ins2.getSessionId());
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
    });

    test('can find span across three chunks', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.noop(123);
      const ins2 = builder.insBin(id, ins1.tick(2), new Uint8Array([4, 5, 6]));
      builder.noop(123);
      const ins3 = builder.insBin(id, ins2.tick(2), new Uint8Array([7, 8, 9]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      const span = node.findIdSpan(0, 9);
      expect(span.length).toBe(3);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time);
      expect(span[0].span).toBe(3);
      expect(span[1].getSessionId()).toBe(ins2.getSessionId());
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(3);
      expect(span[2].getSessionId()).toBe(ins3.getSessionId());
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(3);
    });

    test('can find span across three chunks - 2', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.noop(123);
      const ins2 = builder.insBin(id, ins1.tick(2), new Uint8Array([4, 5, 6]));
      builder.noop(123);
      const ins3 = builder.insBin(id, ins2.tick(2), new Uint8Array([7, 8, 9]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      const span = node.findIdSpan(1, 7);
      expect(span.length).toBe(3);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time + 1);
      expect(span[0].span).toBe(2);
      expect(span[1].getSessionId()).toBe(ins2.getSessionId());
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(3);
      expect(span[2].getSessionId()).toBe(ins3.getSessionId());
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(2);
    });

    test('can find span across three chunks - 3', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.noop(123);
      const ins2 = builder.insBin(id, ins1.tick(2), new Uint8Array([4, 5, 6]));
      builder.noop(123);
      const ins3 = builder.insBin(id, ins2.tick(2), new Uint8Array([7, 8, 9]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.node(id)! as BinaryType;
      const span = node.findIdSpan(2, 5);
      expect(span.length).toBe(3);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(1);
      expect(span[1].getSessionId()).toBe(ins2.getSessionId());
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(3);
      expect(span[2].getSessionId()).toBe(ins3.getSessionId());
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(1);
    });
  });
});
