import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {createEditor} from 'slate';
import {FromSlate} from '../FromSlate';
import {toSlate} from '../toSlate';
import {ToSlateNode} from '../toSlateNode';
import {applyPatch} from '../applyPatch';
import {p, txt as textNode, h1, voidNode} from './tools/builder';
import type {SlateDocument} from '../../types';

const assertRoundtrip = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.import(0, viewRange);
  api.txt.refresh();
  const view = toSlate(api.txt);
  expect(view).toEqual(doc);
};

const assertCachedRoundtrip = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.import(0, viewRange);
  api.txt.refresh();
  const converter = new ToSlateNode();
  const result = converter.convert(api.txt.blocks);
  expect(result).toEqual(doc);
};

const assertApplyPatch = (src: SlateDocument, dst: SlateDocument) => {
  const editor = createEditor();
  (editor.children as unknown) = src;
  applyPatch(editor, dst);
  expect(editor.children).toEqual(dst);
};

describe('void nodes', () => {
  describe('round-trip: Slate > Peritext > Slate', () => {
    test('single void node (image)', () => {
      const doc: SlateDocument = [voidNode('image', {src: 'https://example.com/photo.jpg', alt: 'A photo'})];
      assertRoundtrip(doc);
    });

    test('single void node (horizontal rule)', () => {
      const doc: SlateDocument = [voidNode('hr')];
      assertRoundtrip(doc);
    });

    test('void node between paragraphs', () => {
      const doc: SlateDocument = [
        p({}, textNode('Before the image.')),
        voidNode('image', {src: 'photo.jpg'}),
        p({}, textNode('After the image.')),
      ];
      assertRoundtrip(doc);
    });

    test('multiple void nodes in sequence', () => {
      const doc: SlateDocument = [voidNode('hr'), voidNode('image', {src: 'a.png'}), voidNode('hr')];
      assertRoundtrip(doc);
    });

    test('void node after heading', () => {
      const doc: SlateDocument = [
        h1(textNode('Title')),
        voidNode('embed', {url: 'https://example.com/video'}),
        p({}, textNode('Description below embed.')),
      ];
      assertRoundtrip(doc);
    });

    test('void node with no extra attributes', () => {
      const doc: SlateDocument = [p({}, textNode('before')), voidNode('divider'), p({}, textNode('after'))];
      assertRoundtrip(doc);
    });

    test('document with only void nodes', () => {
      const doc: SlateDocument = [voidNode('image', {src: 'first.jpg'}), voidNode('image', {src: 'second.jpg'})];
      assertRoundtrip(doc);
    });
  });

  describe('cached converter (ToSlateNode)', () => {
    test('void node round-trips through cached converter', () => {
      const doc: SlateDocument = [
        p({}, textNode('hello')),
        voidNode('image', {src: 'photo.jpg'}),
        p({}, textNode('world')),
      ];
      assertCachedRoundtrip(doc);
    });

    test('cached converter returns same reference for unchanged void node', () => {
      const doc: SlateDocument = [p({}, textNode('text')), voidNode('hr')];
      const viewRange = FromSlate.convert(doc);
      const model = Model.create(ext.peritext.new(''));
      const api = model.s.toExt();
      api.txt.editor.import(0, viewRange);
      api.txt.refresh();
      const converter = new ToSlateNode();
      const result1 = converter.convert(api.txt.blocks);
      const voidRef = result1[1];
      // Re-render without changes
      api.txt.refresh();
      const result2 = converter.convert(api.txt.blocks);
      expect(result2[1]).toBe(voidRef);
    });
  });

  describe('applyPatch with void nodes', () => {
    test('insert a void node into a document', () => {
      const src: SlateDocument = [p({}, textNode('hello'))];
      const dst: SlateDocument = [p({}, textNode('hello')), voidNode('hr')];
      assertApplyPatch(src, dst);
    });

    test('remove a void node from a document', () => {
      const src: SlateDocument = [p({}, textNode('hello')), voidNode('hr'), p({}, textNode('world'))];
      const dst: SlateDocument = [p({}, textNode('hello')), p({}, textNode('world'))];
      assertApplyPatch(src, dst);
    });

    test('replace a paragraph with a void node', () => {
      const src: SlateDocument = [p({}, textNode('first')), p({}, textNode('second'))];
      const dst: SlateDocument = [p({}, textNode('first')), voidNode('image', {src: 'photo.jpg'})];
      assertApplyPatch(src, dst);
    });

    test('replace a void node with a paragraph', () => {
      const src: SlateDocument = [voidNode('hr'), p({}, textNode('after'))];
      const dst: SlateDocument = [p({}, textNode('replaced')), p({}, textNode('after'))];
      assertApplyPatch(src, dst);
    });

    test('change void node attributes', () => {
      const src: SlateDocument = [voidNode('image', {src: 'old.jpg'})];
      const dst: SlateDocument = [voidNode('image', {src: 'new.jpg'})];
      assertApplyPatch(src, dst);
    });

    test('swap one void type for another', () => {
      const src: SlateDocument = [voidNode('hr')];
      const dst: SlateDocument = [voidNode('image', {src: 'photo.jpg'})];
      assertApplyPatch(src, dst);
    });
  });

  describe('merge with void nodes', () => {
    test('merge void node document into paragraph document', () => {
      const doc1: SlateDocument = [p({}, textNode('hello'))];
      const doc2: SlateDocument = [p({}, textNode('hello')), voidNode('hr'), p({}, textNode('world'))];
      const model = Model.create(ext.peritext.new(''));
      const api = model.s.toExt();
      api.txt.editor.merge(FromSlate.convert(doc1));
      api.txt.refresh();
      expect(toSlate(api.txt)).toEqual(doc1);
      api.txt.editor.merge(FromSlate.convert(doc2));
      expect(toSlate(api.txt)).toEqual(doc2);
    });

    test('merge from void-only document', () => {
      const doc1: SlateDocument = [voidNode('hr')];
      const doc2: SlateDocument = [p({}, textNode('replaced'))];
      const model = Model.create(ext.peritext.new(''));
      const api = model.s.toExt();
      api.txt.editor.merge(FromSlate.convert(doc1));
      api.txt.refresh();
      expect(toSlate(api.txt)).toEqual(doc1);
      api.txt.editor.merge(FromSlate.convert(doc2));
      expect(toSlate(api.txt)).toEqual(doc2);
    });
  });
});
