import {createEditor} from 'slate';
import {
  resetBlockToParagraphAtStart,
  resetEmptyBlockToParagraph,
  tryExitCodeBlockOnTripleEnter,
  withCodeBlockBreaks,
} from '../behavior';
import {deleteBlock, duplicateBlock, moveBlockDown, moveBlockUp} from '../behavior/blockOps';
import type {SlateEditorDocument} from '../types';

const createTestEditor = (doc: SlateEditorDocument) => {
  const editor = createEditor();
  editor.children = doc as any;
  return editor;
};

describe('resetEmptyBlockToParagraph()', () => {
  test('turns an empty heading into a paragraph', () => {
    const editor = createTestEditor([{type: 'h2', children: [{text: ''}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    const handled = resetEmptyBlockToParagraph(editor);
    expect(handled).toBe(true);
    expect(editor.children).toEqual([{type: 'p', children: [{text: ''}]}]);
  });

  test('turns an empty list item into a paragraph', () => {
    const editor = createTestEditor([{type: 'ul', children: [{type: 'li', children: [{text: ''}]}]}]);
    editor.selection = {
      anchor: {path: [0, 0, 0], offset: 0},
      focus: {path: [0, 0, 0], offset: 0},
    };
    const handled = resetEmptyBlockToParagraph(editor);
    expect(handled).toBe(true);
    expect(editor.children).toEqual([{type: 'p', children: [{text: ''}]}]);
  });

  test('turns an empty checklist item into a paragraph', () => {
    const editor = createTestEditor([
      {type: 'checklist', children: [{type: 'li', checked: true, children: [{text: ''}]}]},
    ]);
    editor.selection = {
      anchor: {path: [0, 0, 0], offset: 0},
      focus: {path: [0, 0, 0], offset: 0},
    };
    const handled = resetEmptyBlockToParagraph(editor);
    expect(handled).toBe(true);
    expect(editor.children).toEqual([{type: 'p', children: [{text: ''}]}]);
  });

  test('does not change a non-empty formatted block', () => {
    const editor = createTestEditor([{type: 'blockquote', children: [{text: 'quote'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 5},
      focus: {path: [0, 0], offset: 5},
    };
    const handled = resetEmptyBlockToParagraph(editor);
    expect(handled).toBe(false);
    expect(editor.children).toEqual([{type: 'blockquote', children: [{text: 'quote'}]}]);
  });
});

describe('resetBlockToParagraphAtStart()', () => {
  test('converts a non-empty heading to a paragraph at offset 0', () => {
    const editor = createTestEditor([
      {type: 'p', children: [{text: 'before'}]},
      {type: 'h2', children: [{text: 'Hello'}]},
    ]);
    editor.selection = {
      anchor: {path: [1, 0], offset: 0},
      focus: {path: [1, 0], offset: 0},
    };
    expect(resetBlockToParagraphAtStart(editor)).toBe(true);
    expect(editor.children).toEqual([
      {type: 'p', children: [{text: 'before'}]},
      {type: 'p', children: [{text: 'Hello'}]},
    ]);
  });

  test('converts a non-empty list item to a paragraph at offset 0', () => {
    const editor = createTestEditor([
      {type: 'ul', children: [{type: 'li', children: [{text: 'item'}]}]},
    ]);
    editor.selection = {
      anchor: {path: [0, 0, 0], offset: 0},
      focus: {path: [0, 0, 0], offset: 0},
    };
    expect(resetBlockToParagraphAtStart(editor)).toBe(true);
    expect(editor.children).toEqual([{type: 'p', children: [{text: 'item'}]}]);
  });

  test('does not run when caret is not at offset 0', () => {
    const editor = createTestEditor([{type: 'h2', children: [{text: 'Hello'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 2},
      focus: {path: [0, 0], offset: 2},
    };
    expect(resetBlockToParagraphAtStart(editor)).toBe(false);
    expect(editor.children).toEqual([{type: 'h2', children: [{text: 'Hello'}]}]);
  });

  test('does not run on an empty block (handled by resetEmptyBlockToParagraph)', () => {
    const editor = createTestEditor([{type: 'h2', children: [{text: ''}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    expect(resetBlockToParagraphAtStart(editor)).toBe(false);
  });

  test('does not run on a paragraph', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: 'hi'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    expect(resetBlockToParagraphAtStart(editor)).toBe(false);
  });

  test('does not run on a code-block', () => {
    const editor = createTestEditor([{type: 'code-block', children: [{text: 'x'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    expect(resetBlockToParagraphAtStart(editor)).toBe(false);
  });
});

describe('tryExitCodeBlockOnTripleEnter()', () => {
  test('strips trailing \\n\\n and exits to a new paragraph', () => {
    const editor = createTestEditor([{type: 'code-block', children: [{text: 'foo\n\n'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 5},
      focus: {path: [0, 0], offset: 5},
    };
    expect(tryExitCodeBlockOnTripleEnter(editor)).toBe(true);
    expect(editor.children).toEqual([
      {type: 'code-block', children: [{text: 'foo'}]},
      {type: 'p', children: [{text: ''}]},
    ]);
  });

  test('does nothing when the code-block does not end with \\n\\n', () => {
    const editor = createTestEditor([{type: 'code-block', children: [{text: 'foo\n'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 4},
      focus: {path: [0, 0], offset: 4},
    };
    expect(tryExitCodeBlockOnTripleEnter(editor)).toBe(false);
    expect(editor.children).toEqual([{type: 'code-block', children: [{text: 'foo\n'}]}]);
  });

  test('does nothing when caret is not at the end of the block', () => {
    const editor = createTestEditor([{type: 'code-block', children: [{text: 'foo\n\n'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 3},
      focus: {path: [0, 0], offset: 3},
    };
    expect(tryExitCodeBlockOnTripleEnter(editor)).toBe(false);
  });

  test('does nothing outside a code-block', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: 'foo\n\n'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 5},
      focus: {path: [0, 0], offset: 5},
    };
    expect(tryExitCodeBlockOnTripleEnter(editor)).toBe(false);
  });
});

describe('insertBreak in headings', () => {
  const wrap = (doc: SlateEditorDocument) => withCodeBlockBreaks(createTestEditor(doc));

  test('Enter at start of a non-empty heading inserts a paragraph above', () => {
    const editor = wrap([{type: 'h1', children: [{text: 'Hello'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    editor.insertBreak();
    expect(editor.children).toEqual([
      {type: 'p', children: [{text: ''}]},
      {type: 'h1', children: [{text: 'Hello'}]},
    ]);
    expect(editor.selection).toEqual({
      anchor: {path: [1, 0], offset: 0},
      focus: {path: [1, 0], offset: 0},
    });
  });

  test('Enter at end of a heading creates a paragraph below', () => {
    const editor = wrap([{type: 'h1', children: [{text: 'Hello'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 5},
      focus: {path: [0, 0], offset: 5},
    };
    editor.insertBreak();
    expect(editor.children).toEqual([
      {type: 'h1', children: [{text: 'Hello'}]},
      {type: 'p', children: [{text: ''}]},
    ]);
  });

  test('Enter in the middle of a heading splits, right side becomes paragraph', () => {
    const editor = wrap([{type: 'h2', children: [{text: 'Hello'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 2},
      focus: {path: [0, 0], offset: 2},
    };
    editor.insertBreak();
    expect(editor.children).toEqual([
      {type: 'h2', children: [{text: 'He'}]},
      {type: 'p', children: [{text: 'llo'}]},
    ]);
  });

  test('Enter at end of title creates a subtitle below', () => {
    const editor = wrap([{type: 'title', children: [{text: 'Doc'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 3},
      focus: {path: [0, 0], offset: 3},
    };
    editor.insertBreak();
    expect(editor.children).toEqual([
      {type: 'title', children: [{text: 'Doc'}]},
      {type: 'subtitle', children: [{text: ''}]},
    ]);
  });

  test('Enter at start of blockquote inserts a paragraph above', () => {
    const editor = wrap([{type: 'blockquote', children: [{text: 'wisdom'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    editor.insertBreak();
    expect(editor.children).toEqual([
      {type: 'p', children: [{text: ''}]},
      {type: 'blockquote', children: [{text: 'wisdom'}]},
    ]);
  });
});

describe('block ops', () => {
  test('moveBlockUp swaps with previous sibling', () => {
    const editor = createTestEditor([
      {type: 'p', children: [{text: 'A'}]},
      {type: 'p', children: [{text: 'B'}]},
    ]);
    editor.selection = {
      anchor: {path: [1, 0], offset: 0},
      focus: {path: [1, 0], offset: 0},
    };
    expect(moveBlockUp(editor)).toBe(true);
    expect(editor.children).toEqual([
      {type: 'p', children: [{text: 'B'}]},
      {type: 'p', children: [{text: 'A'}]},
    ]);
  });

  test('moveBlockUp is a no-op at the first block', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: 'A'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    expect(moveBlockUp(editor)).toBe(false);
  });

  test('moveBlockDown swaps with next sibling', () => {
    const editor = createTestEditor([
      {type: 'p', children: [{text: 'A'}]},
      {type: 'p', children: [{text: 'B'}]},
    ]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    expect(moveBlockDown(editor)).toBe(true);
    expect(editor.children).toEqual([
      {type: 'p', children: [{text: 'B'}]},
      {type: 'p', children: [{text: 'A'}]},
    ]);
  });

  test('moveBlockDown is a no-op at the last block', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: 'A'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    expect(moveBlockDown(editor)).toBe(false);
  });

  test('moveBlockDown swaps siblings within a list', () => {
    const editor = createTestEditor([
      {
        type: 'ul',
        children: [
          {type: 'li', children: [{text: 'A'}]},
          {type: 'li', children: [{text: 'B'}]},
        ],
      },
    ]);
    editor.selection = {
      anchor: {path: [0, 0, 0], offset: 0},
      focus: {path: [0, 0, 0], offset: 0},
    };
    expect(moveBlockDown(editor)).toBe(true);
    expect(editor.children).toEqual([
      {
        type: 'ul',
        children: [
          {type: 'li', children: [{text: 'B'}]},
          {type: 'li', children: [{text: 'A'}]},
        ],
      },
    ]);
  });

  test('duplicateBlock inserts a clone after the current block', () => {
    const editor = createTestEditor([{type: 'h2', children: [{text: 'Hi'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 1},
      focus: {path: [0, 0], offset: 1},
    };
    expect(duplicateBlock(editor)).toBe(true);
    expect(editor.children).toEqual([
      {type: 'h2', children: [{text: 'Hi'}]},
      {type: 'h2', children: [{text: 'Hi'}]},
    ]);
  });

  test('deleteBlock removes the current block', () => {
    const editor = createTestEditor([
      {type: 'p', children: [{text: 'A'}]},
      {type: 'p', children: [{text: 'B'}]},
    ]);
    editor.selection = {
      anchor: {path: [1, 0], offset: 0},
      focus: {path: [1, 0], offset: 0},
    };
    expect(deleteBlock(editor)).toBe(true);
    expect(editor.children).toEqual([{type: 'p', children: [{text: 'A'}]}]);
  });
});
