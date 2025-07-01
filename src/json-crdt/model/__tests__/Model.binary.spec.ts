import {BinNode} from '../../nodes';
import {Model} from '../Model';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {interval, tick} from '../../../json-crdt-patch/clock';

describe('Document', () => {
  describe('binary', () => {
    test('can create a binary', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      doc.applyPatch(builder.patch);
      const obj = doc.index.get(id);
      expect(obj).toBeInstanceOf(BinNode);
    });

    test('can set binary as document root', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([]));
    });

    test('can add one octet to a binary', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      builder.insBin(id, id, new Uint8Array([1]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([1]));
    });

    test('can add many octets in one operation', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      builder.insBin(id, id, new Uint8Array([1, 2, 3, 4]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    test('can insert three octets sequentially using three operations', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([2]));
      const ins3 = builder.insBin(id, ins2, new Uint8Array([3]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([1, 2, 3]));
    });

    test('can insert three octets with two operations', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([2, 3]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([1, 2, 3]));
    });

    test('can insert at the end of two-octet binary', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, tick(ins1, 1), new Uint8Array([3, 4]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    test('can insert at the end of two-octet binary twice', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, tick(ins1, 1), new Uint8Array([3, 4]));
      const ins3 = builder.insBin(id, tick(ins2, 1), new Uint8Array([5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    test('can insert at the end of the same two-octet binary twice', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, tick(ins1, 1), new Uint8Array([3, 4]));
      const ins3 = builder.insBin(id, tick(ins1, 1), new Uint8Array([5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([1, 2, 5, 3, 4]));
    });

    test('can apply the same patch trice', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, tick(ins1, 1), new Uint8Array([3, 4]));
      const ins3 = builder.insBin(id, tick(ins1, 1), new Uint8Array([5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([1, 2, 5, 3, 4]));
    });

    test('can insert at the beginning of two-octet binary', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([3, 4]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual(new Uint8Array([1, 3, 4, 2]));
    });

    test('can delete a single octet from one-octet chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([5]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([13]));
      builder.del(id, [interval(ins1, 0, 1)]);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([13]));
    });

    test('can delete a single octet from one-octet chunk in the middle of binary', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([5]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([6]));
      const ins3 = builder.insBin(id, ins2, new Uint8Array([7]));
      builder.del(id, [interval(ins2, 0, 1)]);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([5, 7]));
    });

    test('can delete last octet in two-octet chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2]));
      builder.del(id, [interval(ins1, 1, 1)]);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual(new Uint8Array([1]));
    });

    test('can delete first two octets in three-octet chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([2, 3, 4]));
      builder.del(id, [interval(ins1, 0, 2)]);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual(new Uint8Array([4]));
    });

    test('can delete a range in the middle of a chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([0, 1, 2, 3, 4, 5, 6]));
      builder.del(id, [interval(ins1, 2, 2)]);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual(new Uint8Array([0, 1, 4, 5, 6]));
    });

    test('can delete two chunks using one delete operation', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([2]));
      const ins3 = builder.insBin(id, ins2, new Uint8Array([3]));
      const ins4 = builder.insBin(id, ins3, new Uint8Array([4]));
      builder.del(id, [interval(ins2, 0, 2)]);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual(new Uint8Array([1, 4]));
    });

    test('can delete across chunks', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      const ins2 = builder.insBin(id, tick(ins1, 4), new Uint8Array([6]));
      const ins3 = builder.insBin(id, ins2, new Uint8Array([7, 8, 9, 10, 11, 12]));
      const ins4 = builder.insBin(
        id,
        tick(ins3, 5),
        new Uint8Array([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]),
      );
      builder.del(id, [interval(ins1, 3, 11)]);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual(new Uint8Array([1, 2, 3, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]));
    });

    test('can delete across chunk when chunk were split due to insertion', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      const ins2 = builder.insBin(id, ins1, new Uint8Array([11]));
      const ins3 = builder.insBin(id, tick(ins1, 4), new Uint8Array([22]));
      builder.del(id, [interval(ins1, 0, 3)]);
      builder.root(id);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      // console.log(doc.index.get(str)!.toJson());
      expect(doc.view()).toEqual(new Uint8Array([11, 4, 5, 22]));
    });

    test('can find ID in one one-octet chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array(4));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      expect(node.find(0)!).toStrictEqual(ins1);
    });

    test('can find ID in one chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      expect(node.find(2)!).toStrictEqual(tick(ins1, 2));
    });

    test('can find ID in second chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      const ins2 = builder.insBin(id, tick(ins1, 4), new Uint8Array([6, 7, 8, 9, 10, 11]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      // console.log(doc.toJson());
      expect(node.find(2)!).toStrictEqual(tick(ins1, 2));
      expect(node.find(6)!).toStrictEqual(tick(ins2, 1));
      expect(node.find(10)!).toStrictEqual(tick(ins2, 5));
      expect(node.find(11)!).toBeUndefined();
    });

    test('can find span within one chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      const span = node.findInterval(1, 1)!;
      expect(span.length).toBe(1);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 1);
      expect(span[0].span).toBe(1);
    });

    test('can find span within one chunk - 2', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      const span = node.findInterval(2, 2)!;
      expect(span.length).toBe(1);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
    });

    test('can find span at the beginning of a chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      const span = node.findInterval(0, 3)!;
      expect(span.length).toBe(1);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time);
      expect(span[0].span).toBe(3);
    });

    test('can find span at the end of a chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3, 4, 5]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      const span = node.findInterval(2, 3)!;
      expect(span.length).toBe(1);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(3);
    });

    test('can find span across two chunks', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.nop(123);
      const ins2 = builder.insBin(id, tick(ins1, 2), new Uint8Array([4, 5, 6]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      const span = node.findInterval(2, 2)!;
      expect(span.length).toBe(2);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(1);
      expect(span[1].sid).toBe(ins2.sid);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(1);
    });

    test('can find span across three chunks', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.nop(123);
      const ins2 = builder.insBin(id, tick(ins1, 2), new Uint8Array([4, 5, 6]));
      builder.nop(123);
      const ins3 = builder.insBin(id, tick(ins2, 2), new Uint8Array([7, 8, 9]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      const span = node.findInterval(0, 9)!;
      expect(span.length).toBe(3);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time);
      expect(span[0].span).toBe(3);
      expect(span[1].sid).toBe(ins2.sid);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(3);
      expect(span[2].sid).toBe(ins3.sid);
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(3);
    });

    test('can find span across three chunks - 2', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.nop(123);
      const ins2 = builder.insBin(id, tick(ins1, 2), new Uint8Array([4, 5, 6]));
      builder.nop(123);
      const ins3 = builder.insBin(id, tick(ins2, 2), new Uint8Array([7, 8, 9]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      const span = node.findInterval(1, 7)!;
      expect(span.length).toBe(3);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 1);
      expect(span[0].span).toBe(2);
      expect(span[1].sid).toBe(ins2.sid);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(3);
      expect(span[2].sid).toBe(ins3.sid);
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(2);
    });

    test('can find span across three chunks - 3', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const id = builder.bin();
      const ins1 = builder.insBin(id, id, new Uint8Array([1, 2, 3]));
      builder.nop(123);
      const ins2 = builder.insBin(id, tick(ins1, 2), new Uint8Array([4, 5, 6]));
      builder.nop(123);
      const ins3 = builder.insBin(id, tick(ins2, 2), new Uint8Array([7, 8, 9]));
      builder.root(id);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(id)! as BinNode;
      const span = node.findInterval(2, 5)!;
      expect(span.length).toBe(3);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(1);
      expect(span[1].sid).toBe(ins2.sid);
      expect(span[1].time).toBe(ins2.time);
      expect(span[1].span).toBe(3);
      expect(span[2].sid).toBe(ins3.sid);
      expect(span[2].time).toBe(ins3.time);
      expect(span[2].span).toBe(1);
    });
  });
});
