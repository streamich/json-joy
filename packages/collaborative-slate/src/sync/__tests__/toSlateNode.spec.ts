import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate} from '../FromSlate';
import {ToSlateNode} from '../toSlateNode';
import {documents} from './fixtures/documents';
import {p, txt as textNode, h1, em, strong, ul, li} from './tools/builder';
import type {SlateDocument} from '../../types';

const setup = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.import(0, viewRange);
  api.txt.refresh();
  const fragment = api.txt.blocks;
  return {api, fragment, model};
};

const assertConversionRoundtrip = (doc: SlateDocument) => {
  const {fragment} = setup(doc);
  const converter = new ToSlateNode();
  const result = converter.convert(fragment);
  expect(result).toEqual(doc);
};

describe('ToSlateNode', () => {
  describe('convert()', () => {
    test('converts a single paragraph to SlateDocument', () => {
      const doc: SlateDocument = [p({}, textNode('hello'))];
      assertConversionRoundtrip(doc);
    });

    test('converts multiple paragraphs', () => {
      const doc: SlateDocument = [p({}, textNode('foo')), p({}, textNode('bar'))];
      assertConversionRoundtrip(doc);
    });

    test('converts a heading with level attribute', () => {
      const doc: SlateDocument = [h1(textNode('Title'))];
      assertConversionRoundtrip(doc);
    });

    test('converts inline marks (bold/em)', () => {
      const doc: SlateDocument = [p({}, em('italic'), textNode(' normal'), strong('bold'))];
      assertConversionRoundtrip(doc);
    });

    test('converts a nested list structure', () => {
      const doc: SlateDocument = [ul(li(textNode('item 1')), li(textNode('item 2')))];
      assertConversionRoundtrip(doc);
    });

    describe('fixtures', () => {
      for (const [name, doc] of Object.entries(documents)) {
        test(`converts fixture: ${name}`, () => {
          assertConversionRoundtrip(doc);
        });
      }
    });
  });

  describe('caching', () => {
    test('returns the same object reference for an unchanged block', () => {
      const doc: SlateDocument = [p({}, textNode('hello')), p({}, textNode('world'))];
      const {api, fragment} = setup(doc);
      const converter = new ToSlateNode();

      // First render.
      const result1 = converter.convert(fragment);
      const block0ref = result1[0];
      const block1ref = result1[1];

      // No changes to the model — convert again.
      api.txt.refresh();
      const result2 = converter.convert(fragment);

      // Same references should come back from cache.
      expect(result2[0]).toBe(block0ref);
      expect(result2[1]).toBe(block1ref);
    });

    test('returns new object reference only for the changed block', () => {
      const doc: SlateDocument = [p({}, textNode('hello')), p({}, textNode('world'))];
      const viewRange = FromSlate.convert(doc);
      const model = Model.create(ext.peritext.new(''));
      const api = model.s.toExt();
      api.txt.editor.import(0, viewRange);
      api.txt.refresh();
      const fragment = api.txt.blocks;
      const converter = new ToSlateNode();

      // First render.
      const result1 = converter.convert(fragment);
      const block0ref = result1[0];
      const block1ref = result1[1];

      // Modify only the second paragraph.
      const txt = api.txt;
      txt.insAt(txt.str.length() - 1, '!');
      txt.refresh();

      // Second render.
      const result2 = converter.convert(fragment);

      expect(result2[0]).toBe(block0ref);
      expect(result2[1]).not.toBe(block1ref);
      expect((result2[0].children[0] as any).text).toBe('hello');
    });

    test('evicts stale cache entries after GC', () => {
      const doc1: SlateDocument = [p({}, textNode('a')), p({}, textNode('b'))];
      const doc2: SlateDocument = [p({}, textNode('c')), p({}, textNode('d'))];
      const {api: api1, fragment: frag1} = setup(doc1);
      const {fragment: frag2} = setup(doc2);

      const converter = new ToSlateNode();

      // Render doc1 first — fills the cache with doc1's block hashes.
      const res1 = converter.convert(frag1);

      // Now render doc2 — completely different blocks; doc1 entries go to prev.
      const res2 = converter.convert(frag2);

      // Render doc2 again — gc() is called, doc1 entries should be dropped.
      const res3 = converter.convert(frag2);

      // Render doc1 again — doc1 entries are no longer in cache, new objects are created.
      api1.txt.refresh();
      const res4 = converter.convert(frag1);

      expect(res1).toEqual(doc1);
      expect(res2).toEqual(doc2);
      expect(res3).toEqual(doc2);
      expect(res4).toEqual(doc1);
      expect(res3[0]).toBe(res2[0]);
      expect(res3[1]).toBe(res2[1]);
      expect(res4[0]).not.toBe(res1[0]);
      expect(res4[1]).not.toBe(res1[1]);
    });
  });
});
