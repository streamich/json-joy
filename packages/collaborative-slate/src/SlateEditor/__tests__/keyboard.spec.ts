import {createEditor} from 'slate';
import {handleKeyboardShortcuts} from '../keyboard';
import type {SlateEditorDocument} from '../types';

const createTestEditor = (doc: SlateEditorDocument) => {
  const editor = createEditor();
  editor.children = doc as any;
  return editor;
};

const createEvent = (key: string) =>
  ({
    key,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: jest.fn(),
  }) as any;

describe('handleKeyboardShortcuts()', () => {
  test('turns an empty heading into a paragraph on Backspace', () => {
    const editor = createTestEditor([{type: 'h2', children: [{text: ''}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    const event = createEvent('Backspace');
    const handled = handleKeyboardShortcuts(editor, event);
    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(editor.children).toEqual([{type: 'p', children: [{text: ''}]}]);
  });

  test('turns an empty list item into a paragraph on Delete', () => {
    const editor = createTestEditor([{type: 'ul', children: [{type: 'li', children: [{text: ''}]}]}]);
    editor.selection = {
      anchor: {path: [0, 0, 0], offset: 0},
      focus: {path: [0, 0, 0], offset: 0},
    };
    const event = createEvent('Delete');
    const handled = handleKeyboardShortcuts(editor, event);
    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(editor.children).toEqual([{type: 'p', children: [{text: ''}]}]);
  });

  test('does not change a non-empty formatted block', () => {
    const editor = createTestEditor([{type: 'blockquote', children: [{text: 'quote'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 5},
      focus: {path: [0, 0], offset: 5},
    };
    const event = createEvent('Backspace');
    const handled = handleKeyboardShortcuts(editor, event);
    expect(handled).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(editor.children).toEqual([{type: 'blockquote', children: [{text: 'quote'}]}]);
  });
});