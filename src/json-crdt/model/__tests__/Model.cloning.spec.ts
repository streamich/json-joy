import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';

describe('clone()', () => {
  test('can clone a simple document', () => {
    const doc1 = Model.withLogicalClock();
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
    const doc1 = Model.withLogicalClock();
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
    const doc1 = Model.withLogicalClock();
    doc1.api.root({
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
    const doc1 = Model.withLogicalClock();
    doc1.api.root({
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
    const doc1 = Model.withLogicalClock();
    doc1.api.root({
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
    const doc1 = Model.withLogicalClock();
    doc1.api.root({
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
    const doc1 = Model.withLogicalClock();
    const doc2 = doc1.clone();
    expect(doc1.clock.sid === doc2.clock.sid).toBe(true);
    expect(doc1.view()).toBe(undefined);
    expect(doc2.view()).toBe(undefined);
    doc1.api.root(123);
    expect(doc1.view()).toBe(123);
    expect(doc2.view()).toBe(undefined);
    doc2.api.root([]);
    expect(doc1.view()).toBe(123);
    expect(doc2.view()).toStrictEqual([]);
  });
});

describe('fork()', () => {
  test('can fork a simple document', () => {
    const doc1 = Model.withLogicalClock();
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
    const doc1 = Model.withLogicalClock();
    const builder1 = new PatchBuilder(doc1.clock);
    const obj = builder1.json([1, 2, 'lol']);
    builder1.root(obj);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.fork();
    expect(doc2.clock.sid).not.toBe(doc1.clock.sid);
    expect(doc1.clock.sid !== doc2.clock.sid).toBe(true);
  });

  test('can modify the cloned copy independently', () => {
    const doc1 = Model.withLogicalClock();
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
});
