import {createEditor, Transforms, Node as SlateNode} from 'slate';
import {HistoryEditor} from 'slate-history';
import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate} from '../sync/FromSlate';
import {SlateFacade} from '../SlateFacade';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import {p, txt as textNode} from '../sync/__tests__/tools/builder';
import type {SlateDocument} from '../types';

const setup = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.merge(viewRange);
  api.txt.refresh();

  const editor = createEditor();
  const peritextRef = () => api;
  const facade = new SlateFacade(editor, peritextRef);
  const unbind = PeritextBinding.bind(peritextRef, facade);

  return {
    editor: editor as typeof editor & HistoryEditor,
    facade,
    api,
    txt: api.txt,
    unbind,
    [Symbol.dispose]() {
      unbind();
    },
  };
};

const getDocText = (editor: ReturnType<typeof setup>['editor']): string => {
  let result = '';
  for (const [node] of SlateNode.texts(editor)) result += node.text;
  return result;
};

/** Text content of a single top-level block (paragraph) by index. */
const getParaText = (editor: ReturnType<typeof setup>['editor'], idx: number): string => {
  const block = editor.children[idx] as any;
  if (!block) return '';
  let text = '';
  for (const child of block.children ?? []) {
    if (typeof child.text === 'string') text += child.text;
  }
  return text;
};

const undoDepth = (editor: ReturnType<typeof setup>['editor']): number =>
  editor.history.undos.length;

const redoDepth = (editor: ReturnType<typeof setup>['editor']): number =>
  editor.history.redos.length;

/**
 * Insert `text` at the given Slate path + offset via a Slate Transform.
 * This is a *local* operation and will be recorded in the undo history.
 */
const typeAt = (
  editor: ReturnType<typeof setup>['editor'],
  path: number[],
  offset: number,
  text: string,
): void => {
  Transforms.insertText(editor, text, {at: {path, offset}});
};

/**
 * Delete `length` characters at the given Slate path + offset via a Slate
 * Transform. This is a *local* operation and will be recorded in undo history.
 */
const deleteAt = (
  editor: ReturnType<typeof setup>['editor'],
  path: number[],
  offset: number,
  length: number,
): void => {
  Transforms.delete(editor, {at: {path, offset}, distance: length, unit: 'character'});
};

/**
 * Simulate a remote insert by directly updating the Peritext CRDT and then
 * pushing the new fragment into the Slate editor via `facade.set()`.
 */
const remoteInsertAt = (
  testbed: ReturnType<typeof setup>,
  pos: number,
  text: string,
): void => {
  testbed.txt.insAt(pos, text);
  testbed.txt.refresh();
  testbed.facade.set(testbed.txt.blocks);
};

describe('SlateFacade — undo/redo history', () => {
  describe('local edits are part of undo/redo history', () => {
    test('typing a character creates an undo entry', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor} = testbed;
      expect(undoDepth(editor)).toBe(0);
      typeAt(editor, [0, 0], 5, '!');
      expect(getDocText(editor)).toBe('hello!');
      expect(undoDepth(editor)).toBeGreaterThan(0);
    });

    test('undo reverts a typed character', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor} = testbed;
      typeAt(editor, [0, 0], 5, '!');
      expect(getDocText(editor)).toBe('hello!');
      editor.undo();
      expect(getDocText(editor)).toBe('hello');
    });

    test('redo restores an undone character', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor} = testbed;
      typeAt(editor, [0, 0], 5, '!');
      editor.undo();
      expect(getDocText(editor)).toBe('hello');
      editor.redo();
      expect(getDocText(editor)).toBe('hello!');
    });

    test('undo reverts a deletion', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor} = testbed;
      deleteAt(editor, [0, 0], 0, 1); // delete 'h'
      expect(getDocText(editor)).toBe('ello');
      editor.undo();
      expect(getDocText(editor)).toBe('hello');
    });

    test('multiple undos revert multiple edits in order', () => {
      using testbed = setup([p({}, textNode('ab'))]);
      const {editor} = testbed;
      typeAt(editor, [0, 0], 1, 'X');
      expect(getDocText(editor)).toBe('aXb');
      HistoryEditor.withoutMerging(editor, () => {
        typeAt(editor, [0, 0], 3, 'Y');
      });
      expect(getDocText(editor)).toBe('aXbY');
      editor.undo(); // reverts 'Y'
      expect(getDocText(editor)).toBe('aXb');
      editor.undo(); // reverts 'X'
      expect(getDocText(editor)).toBe('ab');
    });

    test('undo is a no-op when there is nothing to undo', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor} = testbed;
      expect(undoDepth(editor)).toBe(0);
      editor.undo();
      expect(getDocText(editor)).toBe('hello');
    });

    test('redo is a no-op when there is nothing to redo', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor} = testbed;
      expect(redoDepth(editor)).toBe(0);
      editor.redo();
      expect(getDocText(editor)).toBe('hello');
    });
  });

  describe('remote changes via facade.set() are NOT in undo/redo history', () => {
    test('remote insert does not increase undo depth', () => {
      using testbed = setup([p({}, textNode('hello'))]);
      const {editor, txt} = testbed;
      expect(undoDepth(editor)).toBe(0);
      const pos = (txt.str.view() as string).indexOf('hello') + 'hello'.length;
      expect(getDocText(editor)).toBe('hello');
      remoteInsertAt(testbed, pos, '!');
      expect(getDocText(editor)).toBe('hello!');
      expect(undoDepth(editor)).toBe(0);
    });

    test('multiple remote inserts do not accumulate undo depth', () => {
      using testbed = setup([p({}, textNode('abc'))]);
      const {editor, txt} = testbed;
      expect(undoDepth(editor)).toBe(0);
      const pos1 = (txt.str.view() as string).indexOf('abc');
      remoteInsertAt(testbed, pos1, 'R');
      expect(getDocText(editor)).toBe('Rabc');
      expect(undoDepth(editor)).toBe(0);
      const pos2 = (txt.str.view() as string).indexOf('abc') + 'abc'.length;
      remoteInsertAt(testbed, pos2, 'S');
      expect(getDocText(editor)).toBe('RabcS');
      expect(undoDepth(editor)).toBe(0);
      editor.undo();
      expect(getDocText(editor)).toBe('RabcS');
    });
  });
});
