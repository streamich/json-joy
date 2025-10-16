import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';
import {StrNode} from '../../nodes';
import {interval, tick} from '../../../json-crdt-patch/clock';

describe('Document', () => {
  describe('string', () => {
    test('can create an string', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      doc.applyPatch(builder.patch);
      const obj = doc.index.get(str);
      expect(obj).toBeInstanceOf(StrNode);
    });

    test('can set string as document root', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('');
    });

    test('can add one char to a string', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      builder.insStr(str, str, 'a');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('a');
    });

    test('can add long string in one operation', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      builder.insStr(str, str, 'asdf');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('asdf');
    });

    test('can insert three characters sequentially using three operations', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '1');
      const ins2 = builder.insStr(str, ins1, '2');
      const ins3 = builder.insStr(str, ins2, '3');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('123');
    });

    test('can insert three characters with two operations', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '1');
      const ins2 = builder.insStr(str, ins1, '23');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('123');
    });

    test('can insert at the end of two-char string', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const ins2 = builder.insStr(str, tick(ins1, 1), '34');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('1234');
    });

    test('can insert at the end of two-char string twice', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const ins2 = builder.insStr(str, tick(ins1, 1), '34');
      const ins3 = builder.insStr(str, tick(ins2, 1), '5');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('12345');
    });

    test('can insert at the end of the same two-char string twice', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const after = tick(ins1, 1);
      const ins2 = builder.insStr(str, after, '34');
      const ins3 = builder.insStr(str, after, '5');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('12534');
    });

    test('can apply the same patch trice', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const ins2 = builder.insStr(str, tick(ins1, 1), '34');
      const ins3 = builder.insStr(str, tick(ins1, 1), '5');
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('12534');
    });

    test('can insert at the beginning of two-char string', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const ins2 = builder.insStr(str, ins1, '34');
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual('1342');
    });

    test('can delete a single char from one-char chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'x');
      const ins2 = builder.insStr(str, ins1, 'y');
      builder.del(str, [interval(ins1, 0, 1)]);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual('y');
    });

    test('can delete a single char from one-char chunk in the middle of string', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'x');
      const ins2 = builder.insStr(str, ins1, 'y');
      const ins3 = builder.insStr(str, ins2, 'z');
      builder.del(str, [interval(ins2, 0, 1)]);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual('xz');
    });

    test('can delete last char in two-char chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'xy');
      builder.del(str, [interval(ins1, 1, 1)]);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual('x');
    });

    test('can delete first two chars in three-char chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.del(str, [interval(ins1, 0, 2)]);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual('c');
    });

    test('can delete a substring in the middle of a chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abcdefg');
      builder.del(str, [interval(ins1, 2, 2)]);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual('abefg');
    });

    test('can delete two chunks using one delete operation', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'm');
      const ins2 = builder.insStr(str, ins1, 'n');
      const ins3 = builder.insStr(str, ins2, 'o');
      const ins4 = builder.insStr(str, ins3, 'p');
      builder.del(str, [interval(ins2, 0, 2)]);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      expect(doc.view()).toEqual('mp');
    });

    test('can delete across chunks', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'Hello');
      const ins2 = builder.insStr(str, tick(ins1, 4), ' ');
      const ins3 = builder.insStr(str, ins2, 'world!');
      const ins4 = builder.insStr(str, tick(ins3, 5), ' How are you?');
      builder.del(str, [interval(ins1, 3, 11)]);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.view()).toEqual('Helow are you?');
    });

    test('can delete across chunk when chunk were split due to insertion', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'Hello');
      const ins2 = builder.insStr(str, ins1, 'a');
      const ins3 = builder.insStr(str, tick(ins1, 4), '!');
      builder.del(str, [interval(ins1, 0, 3)]);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.index.get(str)!.toString());
      // console.log(doc.index.get(str)!.toJson());
      // console.log(doc.toView());
      expect(doc.view()).toEqual('alo!');
    });

    test('can find ID in one one-char chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'H');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
      expect(node.find(0)!.sid).toBe(ins1.sid);
      expect(node.find(0)!.time).toBe(ins1.time);
    });

    test('can find ID in one chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'Hello');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
      expect(node.find(2)!.sid).toBe(tick(ins1, 2).sid);
      expect(node.find(2)!.time).toBe(tick(ins1, 2).time);
    });

    test('can find ID in second chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'Hello');
      const ins2 = builder.insStr(str, tick(ins1, 4), ' world');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
      // console.log(doc.toJson());
      expect(node.find(2)!.sid).toBe(tick(ins1, 2).sid);
      expect(node.find(2)!.time).toBe(tick(ins1, 2).time);
      expect(node.find(6)!.sid).toBe(tick(ins2, 1).sid);
      expect(node.find(6)!.time).toBe(tick(ins2, 1).time);
      expect(node.find(10)!.sid).toBe(tick(ins2, 5).sid);
      expect(node.find(10)!.time).toBe(tick(ins2, 5).time);
      expect(node.find(11)!).toBeUndefined();
    });

    test('can find span within one chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
      const span = node.findInterval(1, 1)!;
      expect(span.length).toBe(1);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 1);
      expect(span[0].span).toBe(1);
    });

    test('can find span within one chunk - 2', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abcde');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
      const span = node.findInterval(2, 2)!;
      expect(span.length).toBe(1);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
    });

    test('can find span at the beginning of a chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abcde');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
      const span = node.findInterval(0, 3)!;
      expect(span.length).toBe(1);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time);
      expect(span[0].span).toBe(3);
    });

    test('can find span at the end of a chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abcde');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
      const span = node.findInterval(2, 3)!;
      expect(span.length).toBe(1);
      expect(span[0].sid).toBe(ins1.sid);
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(3);
    });

    test('can find span across two chunks', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.nop(123);
      const ins2 = builder.insStr(str, tick(ins1, 2), 'def');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
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
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.nop(123);
      const ins2 = builder.insStr(str, tick(ins1, 2), 'def');
      builder.nop(123);
      const ins3 = builder.insStr(str, tick(ins2, 2), 'ghi');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
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
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.nop(123);
      const ins2 = builder.insStr(str, tick(ins1, 2), 'def');
      builder.nop(123);
      const ins3 = builder.insStr(str, tick(ins2, 2), 'ghi');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
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
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.nop(123);
      const ins2 = builder.insStr(str, tick(ins1, 2), 'def');
      builder.nop(123);
      const ins3 = builder.insStr(str, tick(ins2, 2), 'ghi');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
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

    test('merges sequential inserts into one chunk', () => {
      const doc = Model.create();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      builder.root(str);
      const ins1 = builder.insStr(str, str, 'a');
      doc.applyPatch(builder.patch);
      const ins2 = builder.insStr(str, ins1, 'b');
      doc.applyPatch(builder.patch);
      builder.insStr(str, ins2, 'c');
      doc.applyPatch(builder.patch);
      const node = doc.index.get(str)! as StrNode;
      expect(node.size()).toBe(1);
    });
  });
});
