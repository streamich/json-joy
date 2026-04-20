import {createEditor} from 'slate';
import {setChecklistItemChecked, toggleBlock} from '../behavior';
import type {SlateEditorDocument} from '../types';

const createTestEditor = (doc: SlateEditorDocument) => {
  const editor = createEditor();
  editor.children = doc as any;
  return editor;
};

describe('SlateEditor behavior', () => {
  test('converts paragraphs to checklist items with unchecked state', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: 'Ship checklist support'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 22},
    };
    toggleBlock(editor, 'checklist');
    expect(editor.children).toEqual([
      {type: 'checklist', children: [{type: 'li', checked: false, children: [{text: 'Ship checklist support'}]}]},
    ]);
  });

  test('stores checked state on the checklist item node', () => {
    const editor = createTestEditor([{type: 'checklist', children: [{type: 'li', checked: false, children: [{text: 'Done'}]}]}]);

    setChecklistItemChecked(editor, [0, 0], true);

    expect(editor.children).toEqual([
      {type: 'checklist', children: [{type: 'li', checked: true, children: [{text: 'Done'}]}]},
    ]);
  });

  test('removes checked state when checklist items become paragraphs', () => {
    const editor = createTestEditor([{type: 'checklist', children: [{type: 'li', checked: true, children: [{text: 'Done'}]}]}]);
    editor.selection = {
      anchor: {path: [0, 0, 0], offset: 2},
      focus: {path: [0, 0, 0], offset: 2},
    };

    toggleBlock(editor, 'p');

    expect(editor.children).toEqual([{type: 'p', children: [{text: 'Done'}]}]);
  });
});