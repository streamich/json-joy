import {createEditor} from 'slate';
import {resetEmptyBlockToParagraph} from '../behavior';
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
    const editor = createTestEditor([{type: 'checklist', children: [{type: 'li', checked: true, children: [{text: ''}]}]}]);
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
