import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';
import {StringType} from '../../types/rga-string/StringType';

describe('Document', () => {
  describe('string', () => {
    test('can create an string', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      doc.applyPatch(builder.patch);
      const obj = doc.node(str);
      expect(obj).toBeInstanceOf(StringType);
    });

    test('can set string as document root', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('');
    });

    test('can add one char to a string', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      builder.insStr(str, str, 'a');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('a');
    });

    test('can add long string in one operation', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      builder.insStr(str, str, 'asdf');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('asdf');
    });

    test('can insert three characters sequentially using three operations', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '1');
      const ins2 = builder.insStr(str, ins1, '2');
      const ins3 = builder.insStr(str, ins2, '3');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('123');
    });

    test('can insert three characters with two operations', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '1');
      const ins2 = builder.insStr(str, ins1, '23');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('123');
    });

    test('can insert at the end of two-char string', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const ins2 = builder.insStr(str, ins1.tick(1), '34');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('1234');
    });

    test('can insert at the end of two-char string twice', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const ins2 = builder.insStr(str, ins1.tick(1), '34');
      const ins3 = builder.insStr(str, ins2.tick(1), '5');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('12345');
    });

    test('can insert at the end of the same two-char string twice', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const ins2 = builder.insStr(str, ins1.tick(1), '34');
      const ins3 = builder.insStr(str, ins1.tick(1), '5');
      builder.root(str);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('12534');
    });

    test('can apply the same patch trice', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const ins2 = builder.insStr(str, ins1.tick(1), '34');
      const ins3 = builder.insStr(str, ins1.tick(1), '5');
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('12534');
    });

    test('can insert at the beginning of two-char string', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, '12');
      const ins2 = builder.insStr(str, ins1, '34');
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toView()).toEqual('1342');
    });

    test('can delete a single char from one-char chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'x');
      const ins2 = builder.insStr(str, ins1, 'y');
      builder.del(str, ins1, 1);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toView()).toEqual('y');
    });

    test('can delete a single char from one-char chunk in the middle of string', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'x');
      const ins2 = builder.insStr(str, ins1, 'y');
      const ins3 = builder.insStr(str, ins2, 'z');
      builder.del(str, ins2, 1);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toView()).toEqual('xz');
    });

    test('can delete last char in two-char chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'xy');
      builder.del(str, ins1.tick(1), 1);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toView()).toEqual('x');
    });

    test('can delete first two chars in three-char chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.del(str, ins1, 2);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toView()).toEqual('c');
    });

    test('can delete a substring in the middle of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abcdefg');
      builder.del(str, ins1.tick(2), 2);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toView()).toEqual('abefg');
    });

    test('can delete two chunks using one delete operation', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'm');
      const ins2 = builder.insStr(str, ins1, 'n');
      const ins3 = builder.insStr(str, ins2, 'o');
      const ins4 = builder.insStr(str, ins3, 'p');
      builder.del(str, ins2, 2);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      expect(doc.toView()).toEqual('mp');
    });

    test('can delete across chunks', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'Hello');
      const ins2 = builder.insStr(str, ins1.tick(4), ' ');
      const ins3 = builder.insStr(str, ins2, 'world!');
      const ins4 = builder.insStr(str, ins3.tick(5), ' How are you?');
      builder.del(str, ins1.tick(3), 11);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      expect(doc.toView()).toEqual('Helow are you?');
    });

    test('can delete across chunk when chunk were split due to insertion', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'Hello');
      const ins2 = builder.insStr(str, ins1, 'a');
      const ins3 = builder.insStr(str, ins1.tick(4), '!');
      builder.del(str, ins1, 3);
      builder.root(str);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      doc.applyPatch(builder.patch);
      // console.log(doc.node(str)!.toString());
      // console.log(doc.node(str)!.toJson());
      expect(doc.toView()).toEqual('alo!');
    });

    test('can find ID in one one-char chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'H');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
      expect(node.findId(0).toString()).toBe(ins1.toString());
    });

    test('can find ID in one chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'Hello');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
      expect(node.findId(2).toString()).toBe(ins1.tick(2).toString());
    });

    test('can find ID in second chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'Hello');
      const ins2 = builder.insStr(str, ins1.tick(4), ' world');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
      // console.log(doc.toJson());
      expect(node.findId(2).toString()).toBe(ins1.tick(2).toString());
      expect(node.findId(6).toString()).toBe(ins2.tick(1).toString());
      expect(node.findId(10).toString()).toBe(ins2.tick(5).toString());
      expect(() => node.findId(11)).toThrowError(new Error('OUT_OF_BOUNDS'));
    });

    test('can find span within one chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
      const span = node.findIdSpan(1, 1);
      expect(span.length).toBe(1);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time + 1);
      expect(span[0].span).toBe(1);
    });

    test('can find span within one chunk - 2', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abcde');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
      const span = node.findIdSpan(2, 2);
      expect(span.length).toBe(1);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(2);
    });

    test('can find span at the beginning of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abcde');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
      const span = node.findIdSpan(0, 3);
      expect(span.length).toBe(1);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time);
      expect(span[0].span).toBe(3);
    });

    test('can find span at the end of a chunk', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abcde');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
      const span = node.findIdSpan(2, 3);
      expect(span.length).toBe(1);
      expect(span[0].getSessionId()).toBe(ins1.getSessionId());
      expect(span[0].time).toBe(ins1.time + 2);
      expect(span[0].span).toBe(3);
    });

    test('can find span across two chunks', () => {
      const doc = Model.withLogicalClock();
      const builder = new PatchBuilder(doc.clock);
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.noop(123);
      const ins2 = builder.insStr(str, ins1.tick(2), 'def');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
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
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.noop(123);
      const ins2 = builder.insStr(str, ins1.tick(2), 'def');
      builder.noop(123);
      const ins3 = builder.insStr(str, ins2.tick(2), 'ghi');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
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
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.noop(123);
      const ins2 = builder.insStr(str, ins1.tick(2), 'def');
      builder.noop(123);
      const ins3 = builder.insStr(str, ins2.tick(2), 'ghi');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
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
      const str = builder.str();
      const ins1 = builder.insStr(str, str, 'abc');
      builder.noop(123);
      const ins2 = builder.insStr(str, ins1.tick(2), 'def');
      builder.noop(123);
      const ins3 = builder.insStr(str, ins2.tick(2), 'ghi');
      builder.root(str);
      doc.applyPatch(builder.patch);
      const node = doc.node(str)! as StringType;
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
