import {createEditor} from 'slate';
import {insertFile, removeFileAtPath, withFile} from '../behavior/file';
import type {SlateEditorDocument} from '../types';

const createTestEditor = (doc: SlateEditorDocument) => {
  const editor = withFile(createEditor());
  editor.children = doc as any;
  return editor;
};

describe('file behavior', () => {
  test('marks `file` as void', () => {
    const editor = withFile(createEditor());
    expect(editor.isVoid({type: 'file', '@thing': 'x', children: [{text: ''}]} as any)).toBe(true);
  });

  test('insertFile inserts a file block and ensures a paragraph after', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: ''}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    insertFile(editor, 'f1');
    expect((editor.children[0] as any).type).toBe('file');
    expect((editor.children[0] as any)['@thing']).toBe('f1');
    expect((editor.children[1] as any).type).toBe('p');
  });

  test('insertFile applies an optional caption', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: ''}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    insertFile(editor, 'f1', 'Q3 P&L');
    expect((editor.children[0] as any).caption).toBe('Q3 P&L');
  });

  test('removeFileAtPath removes the file block', () => {
    const editor = createTestEditor([
      {type: 'file', '@thing': 'a', children: [{text: ''}]} as any,
      {type: 'p', children: [{text: ''}]},
    ]);
    expect(removeFileAtPath(editor, [0])).toBe(true);
    expect(editor.children.length).toBe(1);
    expect((editor.children[0] as any).type).toBe('p');
  });

  test('insertBreak on an active file creates a paragraph below it', () => {
    const editor = createTestEditor([
      {type: 'file', '@thing': 'a', children: [{text: ''}]} as any,
      {type: 'file', '@thing': 'b', children: [{text: ''}]} as any,
    ]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    editor.insertBreak();
    expect((editor.children[0] as any).type).toBe('file');
    expect((editor.children[1] as any).type).toBe('p');
    expect((editor.children[2] as any).type).toBe('file');
  });

  test('typing on an active file creates a paragraph below and inserts text', () => {
    const editor = createTestEditor([{type: 'file', '@thing': 'a', children: [{text: ''}]} as any]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    editor.insertText('Hi');
    expect((editor.children[0] as any).type).toBe('file');
    expect((editor.children[1] as any).children[0].text).toBe('Hi');
  });
});
