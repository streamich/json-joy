import {until} from '../../../__tests__/util';
import {schema} from '../../../json-crdt-patch';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';

describe('clone()', () => {
  test('can clone a simple document', () => {
    const doc1 = Model.create();
    const builder1 = new PatchBuilder(doc1.clock);
    const obj = builder1.json({foo: 'bar', gg: [123]});
    builder1.root(obj);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.clone();
    expect(doc1.view()).toEqual({foo: 'bar', gg: [123]});
    expect(doc2.view()).toEqual({foo: 'bar', gg: [123]});
    expect(doc2.clock.sid).toBe(doc1.clock.sid);
  });

  test('can modify the cloned copy independently', () => {
    const doc1 = Model.create();
    const builder1 = new PatchBuilder(doc1.clock);
    const obj = builder1.json({foo: 'bar', hh: true});
    builder1.root(obj);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.clone();
    const builder2 = new PatchBuilder(doc2.clock);
    builder2.insObj(obj, [['lala', builder2.json({gaga: 'land'})]]);
    doc2.applyPatch(builder2.patch);
    const builder3 = new PatchBuilder(doc1.clock);
    builder3.insObj(obj, [['hmmm', builder3.json('aha')]]);
    doc1.applyPatch(builder3.patch);
    expect(doc1.view()).toEqual({foo: 'bar', hh: true, hmmm: 'aha'});
    expect(doc2.view()).toEqual({foo: 'bar', hh: true, lala: {gaga: 'land'}});
  });

  test('can clone a document with string edits', () => {
    const doc1 = Model.create();
    doc1.api.set({
      foo: 'abc',
    });
    doc1.api.str(['foo']).ins(3, 'd');
    const doc2 = doc1.clone();
    doc1.api.str(['foo']).ins(4, '!');
    doc2.api.str(['foo']).ins(4, 'e');
    expect(doc1.view()).toEqual({foo: 'abcd!'});
    expect(doc2.view()).toEqual({foo: 'abcde'});
    expect(doc1.clock.sid === doc2.clock.sid).toBe(true);
  });

  test('can clone a document with string deletes', () => {
    const doc1 = Model.create();
    doc1.api.set({
      foo: 'abc',
    });
    doc1.api.str(['foo']).ins(3, 'df');
    doc1.api.str(['foo']).del(4, 1);
    const doc2 = doc1.clone();
    expect(doc1.clock.sid === doc2.clock.sid).toBe(true);
    doc1.api.str(['foo']).del(0, 1);
    doc2.api.str(['foo']).del(1, 2);
    expect(doc1.view()).toEqual({foo: 'bcd'});
    expect(doc2.view()).toEqual({foo: 'ad'});
  });

  test('can clone a document with object edits', () => {
    const doc1 = Model.create();
    doc1.api.set({
      foo: {
        a: 1,
      },
      g: 'test',
    });
    doc1.api.obj(['foo']).set({
      b: 2,
    });
    doc1.api.obj([]).del(['g']);
    const doc2 = doc1.clone();
    expect(doc1.clock.sid === doc2.clock.sid).toBe(true);
    expect(doc1.view()).toStrictEqual({foo: {a: 1, b: 2}});
    expect(doc2.view()).toStrictEqual({foo: {a: 1, b: 2}});
    doc2.api.obj([]).set({c: '123'});
    expect(doc1.view()).toStrictEqual({foo: {a: 1, b: 2}});
    expect(doc2.view()).toStrictEqual({foo: {a: 1, b: 2}, c: '123'});
    doc1.api.obj(['foo']).set({c: null});
    expect(doc1.view()).toStrictEqual({foo: {a: 1, b: 2, c: null}});
    expect(doc2.view()).toStrictEqual({foo: {a: 1, b: 2}, c: '123'});
    doc1.api.obj([]).set({c: false});
    expect(doc1.view()).toStrictEqual({foo: {a: 1, b: 2, c: null}, c: false});
    expect(doc2.view()).toStrictEqual({foo: {a: 1, b: 2}, c: '123'});
  });

  test('can clone array with edits', () => {
    const doc1 = Model.create();
    doc1.api.set({
      foo: {
        a: [1],
      },
    });
    doc1.api.arr(['foo', 'a']).ins(1, [2, 3, {'': 4}]);
    doc1.api.val(['foo', 'a', 1]).set(2.5);
    doc1.api.arr(['foo', 'a']).ins(1, ['aha']);
    const doc2 = doc1.clone();
    expect(doc1.clock.sid === doc2.clock.sid).toBe(true);
    expect(doc1.view()).toStrictEqual({foo: {a: [1, 'aha', 2.5, 3, {'': 4}]}});
    expect(doc2.view()).toStrictEqual({foo: {a: [1, 'aha', 2.5, 3, {'': 4}]}});
    doc1.api.arr(['foo', 'a']).del(0, 1);
    doc2.api.arr(['foo', 'a']).ins(0, [null]);
    expect(doc1.view()).toStrictEqual({foo: {a: ['aha', 2.5, 3, {'': 4}]}});
    expect(doc2.view()).toStrictEqual({foo: {a: [null, 1, 'aha', 2.5, 3, {'': 4}]}});
  });

  test('can clone an empty model', () => {
    const doc1 = Model.create();
    const doc2 = doc1.clone();
    expect(doc1.clock.sid === doc2.clock.sid).toBe(true);
    expect(doc1.view()).toBe(undefined);
    expect(doc2.view()).toBe(undefined);
    doc1.api.set(123);
    expect(doc1.view()).toBe(123);
    expect(doc2.view()).toBe(undefined);
    doc2.api.set([]);
    expect(doc1.view()).toBe(123);
    expect(doc2.view()).toStrictEqual([]);
  });
});

describe('fork()', () => {
  test('can fork a simple document', () => {
    const doc1 = Model.create();
    const builder1 = new PatchBuilder(doc1.clock);
    const obj = builder1.json([1, 2, 'lol']);
    builder1.root(obj);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.fork();
    expect(doc1.view()).toEqual([1, 2, 'lol']);
    expect(doc2.view()).toEqual([1, 2, 'lol']);
    expect(doc1.clock.sid !== doc2.clock.sid).toBe(true);
  });

  test('forked document has a different session ID', () => {
    const doc1 = Model.create();
    const builder1 = new PatchBuilder(doc1.clock);
    const obj = builder1.json([1, 2, 'lol']);
    builder1.root(obj);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.fork();
    expect(doc2.clock.sid).not.toBe(doc1.clock.sid);
    expect(doc1.clock.sid !== doc2.clock.sid).toBe(true);
  });

  test('can modify the cloned copy independently', () => {
    const doc1 = Model.create();
    const builder1 = new PatchBuilder(doc1.clock);
    const arr = builder1.json([1, 2, 'lol']);
    builder1.root(arr);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.fork();
    const builder2 = new PatchBuilder(doc2.clock);
    builder2.insArr(arr, arr, [builder2.json(true)]);
    doc2.applyPatch(builder2.patch);
    const builder3 = new PatchBuilder(doc1.clock);
    builder3.insArr(arr, arr, [builder3.json(false)]);
    doc1.applyPatch(builder3.patch);
    expect(doc1.view()).toEqual([false, 1, 2, 'lol']);
    expect(doc2.view()).toEqual([true, 1, 2, 'lol']);
    expect(doc1.clock.sid !== doc2.clock.sid).toBe(true);
  });

  test('does not reuse existing session IDs when forking', () => {
    const rnd = Math.random;
    let i = 0;
    Math.random = () => {
      i++;
      return i < 20 ? 0.5 : i < 24 ? 0.1 : i < 30 ? 0.5 : rnd();
    };
    const model = Model.create();
    model.api.set(123);
    const model2 = model.fork();
    const model3 = model2.fork();
    expect(model.clock.sid).not.toBe(model2.clock.sid);
    expect(model3.clock.sid).not.toBe(model2.clock.sid);
    expect(model3.clock.sid).not.toBe(model.clock.sid);
    Math.random = rnd;
  });
});

describe('reset()', () => {
  test('resets model state', () => {
    const doc1 = Model.create();
    const doc2 = Model.create();
    doc1.api.set({foo: 123});
    doc2.api.set({
      text: 'hello',
    });
    doc2.api.str(['text']).ins(5, ' world');
    expect(doc2.view()).toEqual({text: 'hello world'});
    doc1.reset(doc2);
    expect(doc1.view()).toStrictEqual(doc2.view());
    expect(doc1.view()).toStrictEqual({text: 'hello world'});
    expect(doc1.view()).not.toBe(doc2.view());
    expect(doc1.clock.sid).toBe(doc2.clock.sid);
    expect(doc1.clock.time).toBe(doc2.clock.time);
    expect(doc1.clock).not.toBe(doc2.clock);
    expect(doc1.ext).not.toBe(doc2.ext);
    expect(doc1.index).not.toBe(doc2.index);
    expect(doc1.toString()).toBe(doc2.toString());
  });

  test('models can be edited separately', () => {
    const doc1 = Model.create();
    const doc2 = Model.create();
    doc1.api.set({foo: 123});
    doc2.api.set({
      text: 'hello',
    });
    doc2.api.str(['text']).ins(5, ' world');
    doc2.reset(doc1);
    doc2.api.obj([]).set({foo: 'bar', qux: 42});
    expect(doc1.view()).toStrictEqual({foo: 123});
    expect(doc2.view()).toStrictEqual({foo: 'bar', qux: 42});
    expect(doc1.clock.sid).toBe(doc2.clock.sid);
    expect(doc1.clock.time).not.toBe(doc2.clock.time);
    expect(doc1.clock).not.toBe(doc2.clock);
  });

  test('emits change event on reset', async () => {
    const doc1 = Model.create();
    const doc2 = Model.create();
    doc1.api.set({foo: 123});
    doc2.api.set({
      text: 'hello',
    });
    doc2.api.str(['text']).ins(5, ' world');
    let cnt = 0;
    doc2.api.onChanges.listen(() => cnt++);
    doc2.reset(doc1);
    await until(() => cnt > 0);
    expect(cnt).toBe(1);
  });

  test('preserves API nodes when model is reset', async () => {
    const doc1 = Model.create().setSchema(
      schema.obj({
        text: schema.str('hell'),
      }),
    );
    const doc2 = doc1.fork();
    doc2.s.text.$.ins(4, 'o');
    const str = doc1.s.text.$;
    expect(str === doc2.s.text.$).toBe(false);
    expect(str.view()).toBe('hell');
    doc1.reset(doc2);
    expect(str.view()).toBe('hello');
  });

  test('uses the same clock in Model and NodeBuilder', async () => {
    const doc1 = Model.create().setSchema(
      schema.obj({
        text: schema.str('hell'),
      }),
    );
    const doc2 = doc1.fork();
    doc2.s.text.$.ins(4, 'o');
    expect(doc1.clock).toBe(doc1.api.builder.clock);
    expect(doc2.clock).toBe(doc2.api.builder.clock);
    doc1.reset(doc2);
    expect(doc1.clock).toBe(doc1.api.builder.clock);
    expect(doc2.clock).toBe(doc2.api.builder.clock);
  });
});

describe('deep clone state verification', () => {
  describe('string sharing (memory efficiency)', () => {
    test('StrChunk data strings are shared between original and clone', () => {
      const doc1 = Model.create();
      doc1.api.set({text: 'hello world'});
      doc1.api.flush();
      const doc2 = doc1.clone();
      const str1 = doc1.api.str(['text']).node;
      const str2 = doc2.api.str(['text']).node;
      expect(str1.view()).toBe('hello world');
      expect(str2.view()).toBe('hello world');
      const chunk1 = str1.first()!;
      const chunk2 = str2.first()!;
      expect(chunk1.data).toBe(chunk2.data);
    });

    test('object keys are shared between original and clone', () => {
      const doc1 = Model.create();
      doc1.api.set({myLongKeyName: 123, anotherKey: 'test'});
      doc1.api.flush();
      const doc2 = doc1.clone();
      const obj1 = doc1.api.obj([]).node;
      const obj2 = doc2.api.obj([]).node;
      const keys1 = Array.from(obj1.keys.keys()).sort();
      const keys2 = Array.from(obj2.keys.keys()).sort();
      expect(keys1).toEqual(['anotherKey', 'myLongKeyName']);
      expect(keys2).toEqual(['anotherKey', 'myLongKeyName']);
    });
  });

  describe('binary data sharing', () => {
    test('BinChunk Uint8Array data is shared between original and clone', () => {
      const doc1 = Model.create();
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      doc1.api.set({bin: schema.bin(data)});
      doc1.api.flush();
      const doc2 = doc1.clone();
      const bin1 = doc1.api.bin(['bin']).node;
      const bin2 = doc2.api.bin(['bin']).node;
      expect(bin1.view()).toEqual(data);
      expect(bin2.view()).toEqual(data);

      // Verify the underlying Uint8Array data is shared (same reference)
      const chunk1 = bin1.first()!;
      const chunk2 = bin2.first()!;
      expect(chunk1.data).toBe(chunk2.data);
    });
  });

  describe('clock state', () => {
    test('clone has same clock time', () => {
      const doc1 = Model.create();
      doc1.api.set({a: 1, b: 2});
      doc1.api.flush();
      const doc2 = doc1.clone();
      expect(doc2.clock.time).toBe(doc1.clock.time);
      expect(doc2.clock.sid).toBe(doc1.clock.sid);
    });

    test('fork has same clock time but different session ID', () => {
      const doc1 = Model.create();
      doc1.api.set({a: 1, b: 2});
      doc1.api.flush();
      const doc2 = doc1.fork();
      expect(doc2.clock.time).toBe(doc1.clock.time);
      expect(doc2.clock.sid).not.toBe(doc1.clock.sid);
    });

    test('clone preserves peer information in clock vector', () => {
      const doc1 = Model.create();
      doc1.api.set({a: 1});
      doc1.api.flush();
      // Simulate receiving changes from another peer
      const doc2 = doc1.fork();
      doc2.api.obj([]).set({b: 2});
      const patch = doc2.api.flush();
      doc1.applyPatch(patch);
      // Clone should preserve peer info
      const doc3 = doc1.clone();
      expect(doc3.clock.peers.size).toBe(doc1.clock.peers.size);
      doc1.clock.peers.forEach((peerClock, sid) => {
        const clonedPeerClock = doc3.clock.peers.get(sid);
        expect(clonedPeerClock).toBeDefined();
        expect(clonedPeerClock!.time).toBe(peerClock.time);
      });
    });
  });

  describe('model tick', () => {
    test('clone preserves model tick', () => {
      const doc1 = Model.create();
      doc1.api.set({a: 1});
      doc1.api.flush();
      const doc2 = doc1.fork();
      expect(doc1.tick).toBe(doc2.tick)
      doc2.api.obj([]).set({b: 2});
      doc1.applyPatch(doc2.api.flush());
      expect(doc1.tick).toBeGreaterThan(0);
      const doc3 = doc1.clone();
      expect(doc3.tick).toBe(doc1.tick);
    });
  });

  describe('index completeness', () => {
    test('clone has all nodes in index', () => {
      const doc1 = Model.create();
      doc1.api.set({
        str: 'hello',
        num: 42,
        bool: true,
        nil: null,
        arr: [1, 2, 3],
        obj: {nested: 'value'},
      });
      doc1.api.flush();
      const doc2 = doc1.clone();
      let count1 = 0;
      let count2 = 0;
      doc1.index.forEach(() => count1++);
      doc2.index.forEach(() => count2++);
      expect(count2).toBe(count1);
    });

    test('clone has independent index', () => {
      const doc1 = Model.create();
      doc1.api.set({a: 1});
      doc1.api.flush();
      const doc2 = doc1.clone();
      // Indexes should be different objects
      expect(doc2.index).not.toBe(doc1.index);
      // Adding to doc1 should not affect doc2
      doc1.api.obj([]).set({b: 2});
      doc1.api.flush();
      let count1 = 0;
      let count2 = 0;
      doc1.index.forEach(() => count1++);
      doc2.index.forEach(() => count2++);
      expect(count1).toBeGreaterThan(count2);
    });
  });

  describe('extensions', () => {
    test('clone has cloned extensions', () => {
      const doc1 = Model.create();
      doc1.ext.register({} as any);
      doc1.api.set({a: 1});
      doc1.api.flush();
      const doc2 = doc1.clone();
      expect(doc2.ext).not.toBe(doc1.ext);
      expect(doc2.ext.size()).toBe(doc1.ext.size());
    });
  });

  describe('API independence', () => {
    test('clone does not have API instance until accessed', () => {
      const doc1 = Model.create();
      doc1.api.set({a: 1});
      doc1.api.flush();
      // Access api on doc1
      expect(doc1.api).toBeDefined();
      const doc2 = doc1.clone();
      expect((doc2 as any)._api).toBeUndefined();
      // doc2 should have its own API when accessed
      expect(doc2.api).toBeDefined();
      expect(doc2.api).not.toBe(doc1.api);
    });

    test('node APIs are not shared between clones', () => {
      const doc1 = Model.create();
      doc1.api.set({str: 'hello'});
      doc1.api.flush();
      // Access node API on doc1
      const strApi1 = doc1.api.str(['str']);
      expect(strApi1).toBeDefined();
      const doc2 = doc1.clone();
      // doc2's node API should be different
      const strApi2 = doc2.api.str(['str']);
      expect(strApi2).not.toBe(strApi1);
    });
  });

  describe('RGA structure', () => {
    test('StrNode clone preserves RGA structure with splits', () => {
      const doc1 = Model.create();
      doc1.api.set({text: 'abc'});
      doc1.api.str(['text']).ins(3, 'def');
      doc1.api.str(['text']).del(1, 2); // Creates tombstones
      doc1.api.flush();

      const doc2 = doc1.clone();

      // Verify views match
      expect(doc2.view()).toEqual(doc1.view());

      // Verify chunk counts match
      const str1 = doc1.api.str(['text']).node;
      const str2 = doc2.api.str(['text']).node;
      expect(str2.count).toBe(str1.count);
      expect(str2.length()).toBe(str1.length());
    });

    test('ArrNode clone preserves RGA structure', () => {
      const doc1 = Model.create();
      doc1.api.set({arr: [1, 2, 3]});
      doc1.api.arr(['arr']).ins(3, [4, 5]);
      doc1.api.arr(['arr']).del(1, 2); // Delete some elements
      doc1.api.flush();

      const doc2 = doc1.clone();

      // Verify views match
      expect(doc2.view()).toEqual(doc1.view());

      // Verify chunk counts match
      const arr1 = doc1.api.arr(['arr']).node;
      const arr2 = doc2.api.arr(['arr']).node;
      expect(arr2.count).toBe(arr1.count);
      expect(arr2.length()).toBe(arr1.length());
    });

    test('BinNode clone preserves RGA structure', () => {
      const doc1 = Model.create();
      doc1.api.set({bin: schema.bin(new Uint8Array([1, 2, 3]))});
      doc1.api.bin(['bin']).ins(3, new Uint8Array([4, 5]));
      doc1.api.bin(['bin']).del(1, 2);
      doc1.api.flush();

      const doc2 = doc1.clone();

      // Verify views match
      const view1 = (doc1.view() as any).bin;
      const view2 = (doc2.view() as any).bin;
      expect(view2).toEqual(view1);

      // Verify chunk counts match
      const bin1 = doc1.api.bin(['bin']).node;
      const bin2 = doc2.api.bin(['bin']).node;
      expect(bin2.count).toBe(bin1.count);
      expect(bin2.length()).toBe(bin1.length());
    });
  });

  describe('mutation isolation', () => {
    test('modifying clone does not affect original', () => {
      const doc1 = Model.create();
      doc1.api.set({text: 'hello'});
      doc1.api.flush();

      const doc2 = doc1.clone();
      doc2.api.str(['text']).ins(5, ' world');
      doc2.api.flush();

      expect(doc1.view()).toEqual({text: 'hello'});
      expect(doc2.view()).toEqual({text: 'hello world'});
    });

    test('modifying original does not affect clone', () => {
      const doc1 = Model.create();
      doc1.api.set({text: 'hello'});
      doc1.api.flush();

      const doc2 = doc1.clone();

      doc1.api.str(['text']).ins(5, ' world');
      doc1.api.flush();

      expect(doc1.view()).toEqual({text: 'hello world'});
      expect(doc2.view()).toEqual({text: 'hello'});
    });

    test('mutations to object in clone are isolated', () => {
      const doc1 = Model.create();
      doc1.api.set({
        obj: {a: 1, b: 2},
      });
      doc1.api.flush();

      const doc2 = doc1.clone();
      doc2.api.obj(['obj']).set({c: 3});
      doc2.api.obj(['obj']).del(['a']);
      doc2.api.flush();

      expect(doc1.view()).toEqual({obj: {a: 1, b: 2}});
      expect(doc2.view()).toEqual({obj: {b: 2, c: 3}});
    });

    test('mutations to array in clone are isolated', () => {
      const doc1 = Model.create();
      doc1.api.set({arr: [1, 2, 3]});
      doc1.api.flush();

      const doc2 = doc1.clone();
      doc2.api.arr(['arr']).ins(0, [0]);
      doc2.api.arr(['arr']).del(3, 1); // Delete index 3 (which is value 3)
      doc2.api.flush();

      expect(doc1.view()).toEqual({arr: [1, 2, 3]});
      expect(doc2.view()).toEqual({arr: [0, 1, 2]});
    });
  });

  describe('complex documents', () => {
    test('clone of deeply nested document', () => {
      const doc1 = Model.create();
      doc1.api.set({
        level1: {
          level2: {
            level3: {
              value: 'deep',
              arr: [1, [2, [3]]],
            },
          },
        },
      });
      doc1.api.flush();

      const doc2 = doc1.clone();

      expect(doc2.view()).toEqual(doc1.view());

      // Modify deep value in clone
      doc2.api.obj(['level1', 'level2', 'level3']).set({value: 'modified'});
      doc2.api.flush();

      expect((doc1.view() as any).level1.level2.level3.value).toBe('deep');
      expect((doc2.view() as any).level1.level2.level3.value).toBe('modified');
    });

    test('clone with vectors', () => {
      const doc1 = Model.create();
      doc1.api.set({
        vec: schema.vec(schema.con(1), schema.con(2), schema.con(3)),
      });
      doc1.api.flush();

      const doc2 = doc1.clone();

      const view1 = doc1.view() as any;
      const view2 = doc2.view() as any;

      expect(view2.vec).toEqual(view1.vec);
    });
  });
});
