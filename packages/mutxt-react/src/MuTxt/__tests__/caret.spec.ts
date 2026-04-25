import {createEditor} from 'slate';
import {getCaretPathInfo} from '../util';
import type {SlateEditorDocument} from '../types';

const createTestEditor = (doc: SlateEditorDocument) => {
  const editor = createEditor();
  editor.children = doc as any;
  return editor;
};

describe('caret metadata', () => {
  test('reports the full inline code text at the caret across adjacent code leaves', () => {
    const editor = createTestEditor([
      {
        type: 'p',
        children: [
          {text: 'before '},
          {text: 'npm ', code: true},
          {text: 'install', code: true},
          {text: ' after'},
        ],
      },
    ]);
    editor.selection = {
      anchor: {path: [0, 2], offset: 3},
      focus: {path: [0, 2], offset: 3},
    };
    expect(getCaretPathInfo(editor)).toEqual({
      path: ['p', 'code'],
      codeText: 'npm install',
    });
  });
});