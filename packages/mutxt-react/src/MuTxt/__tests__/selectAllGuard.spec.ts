import {createEditor, Editor, Range, Transforms} from 'slate';
import {
  docPlainTextLength,
  isFullDocSelected,
  resetDocumentContent,
  withSelectAllGuard,
} from '../behavior/selectAllGuard';
import type {SlateEditorDocument} from '../types';

const makeEditor = (doc: SlateEditorDocument) => {
  const editor = createEditor();
  editor.children = doc as any;
  return editor;
};

const selectAll = (editor: Editor): void => {
  editor.selection = {
    anchor: Editor.start(editor, []),
    focus: Editor.end(editor, []),
  };
};

describe('selectAllGuard', () => {
  describe('isFullDocSelected', () => {
    test('returns false when selection is collapsed', () => {
      const editor = makeEditor([{type: 'p', children: [{text: 'hello'}]}]);
      editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 0}};
      expect(isFullDocSelected(editor)).toBe(false);
    });

    test('returns false for partial range', () => {
      const editor = makeEditor([{type: 'p', children: [{text: 'hello world'}]}]);
      editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 5}};
      expect(isFullDocSelected(editor)).toBe(false);
    });

    test('returns true when selection spans the whole document', () => {
      const editor = makeEditor([
        {type: 'h1', children: [{text: 'Title'}]},
        {type: 'p', children: [{text: 'body'}]},
      ]);
      selectAll(editor);
      expect(isFullDocSelected(editor)).toBe(true);
    });
  });

  describe('docPlainTextLength', () => {
    test('counts plain text characters', () => {
      const editor = makeEditor([
        {type: 'h1', children: [{text: 'Title'}]},
        {type: 'p', children: [{text: 'hello'}]},
      ]);
      expect(docPlainTextLength(editor)).toBeGreaterThanOrEqual(10);
    });
  });

  describe('resetDocumentContent', () => {
    test('wipes heterogeneous blocks down to one empty paragraph', () => {
      const editor = makeEditor([
        {type: 'h1', children: [{text: 'Title'}]},
        {type: 'ul', children: [{type: 'li', children: [{text: 'one'}]}]},
        {type: 'blockquote', children: [{text: 'quote'}]},
      ]);
      resetDocumentContent(editor);
      expect(editor.children).toEqual([{type: 'p', children: [{text: ''}]}]);
    });

    test('seeds the paragraph with the supplied text', () => {
      const editor = makeEditor([
        {type: 'h1', children: [{text: 'Title'}]},
        {type: 'p', children: [{text: 'body'}]},
      ]);
      resetDocumentContent(editor, 'c');
      expect(editor.children).toEqual([{type: 'p', children: [{text: 'c'}]}]);
    });
  });

  describe('withSelectAllGuard plugin', () => {
    test('intercepts deleteFragment over full document', () => {
      const editor = withSelectAllGuard(
        makeEditor([
          {type: 'h1', children: [{text: 'Title'}]},
          {type: 'p', children: [{text: 'body text'}]},
        ]),
        {
          onDelete: () => true,
        },
      );
      selectAll(editor);
      editor.deleteFragment();
      // Hook intercepted; document untouched.
      expect(editor.children).toEqual([
        {type: 'h1', children: [{text: 'Title'}]},
        {type: 'p', children: [{text: 'body text'}]},
      ]);
    });

    test('replaces full doc with empty paragraph when hook does not intercept', () => {
      const editor = withSelectAllGuard(
        makeEditor([
          {type: 'h1', children: [{text: 'Title'}]},
          {type: 'p', children: [{text: 'body text'}]},
        ]),
        {},
      );
      selectAll(editor);
      editor.deleteFragment();
      expect(editor.children).toEqual([{type: 'p', children: [{text: ''}]}]);
    });

    test('intercepts insertText over full document', () => {
      let captured: string | undefined;
      const editor = withSelectAllGuard(
        makeEditor([
          {type: 'h1', children: [{text: 'Title'}]},
          {type: 'p', children: [{text: 'body'}]},
        ]),
        {
          onReplaceWithText: (text) => {
            captured = text;
            return true;
          },
        },
      );
      selectAll(editor);
      editor.insertText('c');
      expect(captured).toBe('c');
      expect(editor.children).toEqual([
        {type: 'h1', children: [{text: 'Title'}]},
        {type: 'p', children: [{text: 'body'}]},
      ]);
    });

    test('replaces full doc with the typed character when no hook', () => {
      const editor = withSelectAllGuard(
        makeEditor([
          {type: 'h1', children: [{text: 'Title'}]},
          {type: 'p', children: [{text: 'body'}]},
        ]),
        {},
      );
      selectAll(editor);
      editor.insertText('c');
      expect(editor.children).toEqual([{type: 'p', children: [{text: 'c'}]}]);
    });

    test('does not intercept partial-range deleteFragment', () => {
      const editor = withSelectAllGuard(
        makeEditor([{type: 'p', children: [{text: 'hello world'}]}]),
        {
          onDelete: () => {
            throw new Error('should not be called');
          },
        },
      );
      editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 5}};
      Transforms.delete(editor, {at: editor.selection});
      const sel = editor.selection!;
      expect(Range.isCollapsed(sel)).toBe(true);
      expect(editor.children).toEqual([{type: 'p', children: [{text: ' world'}]}]);
    });
  });
});
