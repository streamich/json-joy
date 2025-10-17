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
