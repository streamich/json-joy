import {createEditor, Transforms} from 'slate';
import {applyPatch} from '../applyPatch';
import {p, txt as textNode, h1, h2, blockquote, em, ul, li} from './tools/builder';
import {SlateFuzzer} from './tools/fuzzer';
import type {SlateDocument} from '../../types';

const editorWith = (doc: SlateDocument) => {
  const editor = createEditor();
  (editor.children as unknown) = doc;
  return editor;
};

const assertApplyPatch = (src: SlateDocument, dst: SlateDocument) => {
  const editor = editorWith(src);
  applyPatch(editor, dst);
  expect(editor.children).toEqual(dst);
};

describe('applyPatch()', () => {
  describe('no-op cases', () => {
    test('does nothing when old and new docs are identical by reference', () => {
      const doc: SlateDocument = [p({}, textNode('hello'))];
      const editor = editorWith(doc);
      applyPatch(editor, doc);
      expect(editor.children[0]).toBe(doc[0]);
    });

    test('does nothing when old and new docs are structurally equal', () => {
      const doc1: SlateDocument = [p({}, textNode('hello'))];
      const doc2: SlateDocument = [p({}, textNode('hello'))];
      assertApplyPatch(doc1, doc2);
    });
  });

  describe('text content changes', () => {
    test('appends text within a paragraph', () => {
      const oldDoc: SlateDocument = [p({}, textNode('hello'))];
      const newDoc: SlateDocument = [p({}, textNode('hello world'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('removes text from a paragraph', () => {
      const oldDoc: SlateDocument = [p({}, textNode('hello world'))];
      const newDoc: SlateDocument = [p({}, textNode('hello'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('replaces text content entirely', () => {
      const oldDoc: SlateDocument = [p({}, textNode('foo'))];
      const newDoc: SlateDocument = [p({}, textNode('bar'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('changes two non-contiguous regions (multi-region diff)', () => {
      const oldDoc: SlateDocument = [p({}, textNode('the quick brown fox'))];
      const newDoc: SlateDocument = [p({}, textNode('the slow brown cat'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('changes text in the second of multiple paragraphs', () => {
      const oldDoc: SlateDocument = [p({}, textNode('first')), p({}, textNode('second'))];
      const newDoc: SlateDocument = [p({}, textNode('first')), p({}, textNode('SECOND'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('changes text in the first of multiple paragraphs', () => {
      const oldDoc: SlateDocument = [p({}, textNode('first')), p({}, textNode('second'))];
      const newDoc: SlateDocument = [p({}, textNode('FIRST')), p({}, textNode('second'))];
      assertApplyPatch(oldDoc, newDoc);
    });
  });

  describe('inline mark changes', () => {
    test('adds a bold mark to a text run', () => {
      const oldDoc: SlateDocument = [p({}, textNode('hello'))];
      const newDoc: SlateDocument = [p({}, {text: 'hello', strong: true})];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('removes a bold mark', () => {
      const oldDoc: SlateDocument = [p({}, {text: 'hello', strong: true})];
      const newDoc: SlateDocument = [p({}, textNode('hello'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('swaps one mark for another (same count, different key)', () => {
      const oldDoc: SlateDocument = [p({}, {text: 'hello', strong: true})];
      const newDoc: SlateDocument = [p({}, {text: 'hello', em: true})];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('changes a mark value (same key, different value)', () => {
      const oldDoc: SlateDocument = [p({}, {text: 'hello', color: 'red'})];
      const newDoc: SlateDocument = [p({}, {text: 'hello', color: 'blue'})];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('changes inline mark split (two text runs)', () => {
      const oldDoc: SlateDocument = [p({}, textNode('normal'))];
      const newDoc: SlateDocument = [p({}, em('italic'), textNode(' text'))];
      assertApplyPatch(oldDoc, newDoc);
    });
  });

  describe('block insertions', () => {
    test('inserts a new block at the end', () => {
      const oldDoc: SlateDocument = [p({}, textNode('first'))];
      const newDoc: SlateDocument = [p({}, textNode('first')), p({}, textNode('second'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('inserts a new block at the beginning', () => {
      const oldDoc: SlateDocument = [p({}, textNode('second'))];
      const newDoc: SlateDocument = [p({}, textNode('first')), p({}, textNode('second'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('inserts a block in the middle', () => {
      const oldDoc: SlateDocument = [p({}, textNode('a')), p({}, textNode('c'))];
      const newDoc: SlateDocument = [p({}, textNode('a')), p({}, textNode('b')), p({}, textNode('c'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('inserts multiple blocks', () => {
      const oldDoc: SlateDocument = [p({}, textNode('a'))];
      const newDoc: SlateDocument = [
        p({}, textNode('a')),
        p({}, textNode('b')),
        p({}, textNode('c')),
        p({}, textNode('d')),
      ];
      assertApplyPatch(oldDoc, newDoc);
    });
  });

  describe('block removals', () => {
    test('removes a block from the end', () => {
      const oldDoc: SlateDocument = [p({}, textNode('first')), p({}, textNode('second'))];
      const newDoc: SlateDocument = [p({}, textNode('first'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('removes a block from the beginning', () => {
      const oldDoc: SlateDocument = [p({}, textNode('first')), p({}, textNode('second'))];
      const newDoc: SlateDocument = [p({}, textNode('second'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('removes a block from the middle', () => {
      const oldDoc: SlateDocument = [p({}, textNode('a')), p({}, textNode('b')), p({}, textNode('c'))];
      const newDoc: SlateDocument = [p({}, textNode('a')), p({}, textNode('c'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('removes multiple blocks', () => {
      const oldDoc: SlateDocument = [
        p({}, textNode('a')),
        p({}, textNode('b')),
        p({}, textNode('c')),
        p({}, textNode('d')),
      ];
      const newDoc: SlateDocument = [p({}, textNode('a'))];
      assertApplyPatch(oldDoc, newDoc);
    });
  });

  describe('block type changes', () => {
    test('changes a paragraph to a heading', () => {
      const oldDoc: SlateDocument = [p({}, textNode('Title'))];
      const newDoc: SlateDocument = [h1(textNode('Title'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('changes a heading to a paragraph', () => {
      const oldDoc: SlateDocument = [h1(textNode('Title'))];
      const newDoc: SlateDocument = [p({}, textNode('Title'))];
      assertApplyPatch(oldDoc, newDoc);
    });
  });

  describe('block attribute changes', () => {
    test('updates heading level attribute', () => {
      const oldDoc: SlateDocument = [h1(textNode('heading'))];
      const newDoc: SlateDocument = [h2(textNode('heading'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('calls setNodes when an attribute value changes (same key count)', () => {
      const setNodesSpy = jest.spyOn(Transforms, 'setNodes');
      const oldDoc: SlateDocument = [h1(textNode('heading'))];
      const newDoc: SlateDocument = [h2(textNode('heading'))];
      const editor = editorWith(oldDoc);
      applyPatch(editor, newDoc);
      expect(setNodesSpy).toHaveBeenCalled();
      setNodesSpy.mockRestore();
    });

    test('does not call setNodes when attributes are unchanged (only text differs)', () => {
      const setNodesSpy = jest.spyOn(Transforms, 'setNodes');
      const oldDoc: SlateDocument = [h1(textNode('old text'))];
      const newDoc: SlateDocument = [h1(textNode('new text'))];
      const editor = editorWith(oldDoc);
      applyPatch(editor, newDoc);
      expect(setNodesSpy).not.toHaveBeenCalled();
      setNodesSpy.mockRestore();
    });
  });

  describe('reference identity preservation', () => {
    test('unchanged blocks keep the same object reference', () => {
      const block0 = p({}, textNode('unchanged'));
      const block1 = p({}, textNode('will change'));
      const oldDoc: SlateDocument = [block0, block1];
      const newBlock0 = block0;
      const newBlock1 = p({}, textNode('changed'));
      const newDoc: SlateDocument = [newBlock0, newBlock1];
      assertApplyPatch(oldDoc, newDoc);
      expect(newDoc[0]).toBe(oldDoc[0]);
    });
  });

  describe('nested blocks', () => {
    test('patches text inside a blockquote > paragraph', () => {
      const oldDoc: SlateDocument = [blockquote({}, p({}, textNode('original')))];
      const newDoc: SlateDocument = [blockquote({}, p({}, textNode('updated')))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('adds a paragraph inside a blockquote', () => {
      const oldDoc: SlateDocument = [blockquote({}, p({}, textNode('first')))];
      const newDoc: SlateDocument = [blockquote({}, p({}, textNode('first')), p({}, textNode('second')))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('patches text inside a list item', () => {
      const oldDoc: SlateDocument = [ul(li(textNode('item')))];
      const newDoc: SlateDocument = [ul(li(textNode('updated item')))];
      assertApplyPatch(oldDoc, newDoc);
    });
  });

  describe('complex transitions', () => {
    test('transition from headings to paragraphs', () => {
      const oldDoc: SlateDocument = [h1(textNode('Title')), h2(textNode('Sub'))];
      const newDoc: SlateDocument = [p({}, textNode('Title')), p({}, textNode('Sub'))];
      assertApplyPatch(oldDoc, newDoc);
    });

    test('mixed insert, remove, and change in a single patch', () => {
      const oldDoc: SlateDocument = [
        p({}, textNode('keep-a')),
        p({}, textNode('remove-b')),
        p({}, textNode('change-c')),
        p({}, textNode('keep-d')),
      ];
      const newDoc: SlateDocument = [
        p({}, textNode('keep-a')),
        p({}, textNode('new-b')),
        p({}, textNode('CHANGE-C')),
        p({}, textNode('keep-d')),
      ];
      assertApplyPatch(oldDoc, newDoc);
    });
  });

  describe('fuzzer', () => {
    const limit = 10;
    for (let j = 0; j < limit; j++) {
      test(`random document edits can be applied correctly (${j + 1})`, () => {
        const fuzzer = new SlateFuzzer();
        let doc1: SlateDocument = [];
        let doc2: SlateDocument;
        for (let i = 0; i < 100; i++) {
          fuzzer.applyRandomHighLevelOperation();
          doc2 = fuzzer.getDocument();
          assertApplyPatch(doc1, doc2);
          doc1 = doc2;
        }
      });
    }
  });
});
