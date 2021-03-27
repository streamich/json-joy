import {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';
import {Document} from '../document';

describe('clone()', () => {
  test('can clone a simple document', () => {
    const doc1 = new Document();
    const builder1 = new PatchBuilder(doc1.clock);
    const obj = builder1.json({foo: 'bar', gg: [123]});
    builder1.root(obj);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.clone();
    expect(doc1.toJson()).toEqual({foo: 'bar', gg: [123]});
    expect(doc2.toJson()).toEqual({foo: 'bar', gg: [123]});
    expect(doc2).toEqual(doc1);
    expect(doc2.clock.sessionId).toBe(doc1.clock.sessionId);
  });

  test('can modify the cloned copy independently', () => {
    const doc1 = new Document();
    const builder1 = new PatchBuilder(doc1.clock);
    const obj = builder1.json({foo: 'bar', hh: true});
    builder1.root(obj);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.clone();
    const builder2 = new PatchBuilder(doc2.clock);
    builder2.setKeys(obj, [['lala', builder2.json({gaga: 'land'})]]);
    doc2.applyPatch(builder2.patch);
    const builder3 = new PatchBuilder(doc1.clock);
    builder3.setKeys(obj, [['hmmm', builder3.json('aha')]]);
    doc1.applyPatch(builder3.patch);
    expect(doc1.toJson()).toEqual({ foo: 'bar', hh: true, hmmm: 'aha' });
    expect(doc2.toJson()).toEqual({ foo: 'bar', hh: true, lala: { gaga: 'land' } });
  });
});

describe('fork()', () => {
  test('can fork a simple document', () => {
    const doc1 = new Document();
    const builder1 = new PatchBuilder(doc1.clock);
    const obj = builder1.json([1, 2, 'lol']);
    builder1.root(obj);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.fork();
    expect(doc1.toJson()).toEqual([1, 2, 'lol']);
    expect(doc2.toJson()).toEqual([1, 2, 'lol']);
  });

  test('forked document has a different session ID', () => {
    const doc1 = new Document();
    const builder1 = new PatchBuilder(doc1.clock);
    const obj = builder1.json([1, 2, 'lol']);
    builder1.root(obj);
    doc1.applyPatch(builder1.patch);
    const doc2 = doc1.fork();
    expect(doc2.clock.sessionId).not.toBe(doc1.clock.sessionId);
  });

  test('can modify the cloned copy independently', () => {
    const doc1 = new Document();
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

    expect(doc1.toJson()).toEqual([ false, 1, 2, 'lol' ]);
    expect(doc2.toJson()).toEqual([ true, 1, 2, 'lol' ]);
  });
});
