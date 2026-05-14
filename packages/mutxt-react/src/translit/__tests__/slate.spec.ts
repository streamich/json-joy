import {createEditor, type Editor} from 'slate';
import {withTranslit} from '../bindings/slate';
import {TranslitService} from '../TranslitService';
import {ruTranslit} from '../schemes/ru-translit';
import type {SlateEditorDocument} from '../../MuTxt/types';

const mkEditor = (doc: SlateEditorDocument = [{type: 'p', children: [{text: ''}]} as any]) => {
  const service = new TranslitService([ruTranslit]);
  service.on('ru-translit');
  const editor = withTranslit(createEditor(), service);
  editor.children = doc as any;
  editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 0}};
  return {editor, service};
};

const text = (editor: Editor): string => {
  const node = editor.children[0] as any;
  return node?.children?.[0]?.text ?? '';
};

describe('withTranslit (Slate)', () => {
  test('typing each char goes through the matcher', () => {
    const {editor} = mkEditor();
    for (const ch of 'privet') editor.insertText(ch);
    expect(text(editor)).toBe('привет');
  });

  test('digraph rewrite happens in place', () => {
    const {editor} = mkEditor();
    editor.insertText('s');
    expect(text(editor)).toBe('с');
    editor.insertText('h');
    expect(text(editor)).toBe('ш');
    editor.insertText('h');
    expect(text(editor)).toBe('щ');
  });

  test('non-letter flushes the buffer with a final pass-through', () => {
    const {editor} = mkEditor();
    for (const ch of 'sh ya') editor.insertText(ch);
    expect(text(editor)).toBe('ш я');
  });

  test('disabling the service stops matching mid-stream', () => {
    const {editor, service} = mkEditor();
    editor.insertText('p');
    expect(text(editor)).toBe('п');
    service.off();
    editor.insertText('a');
    expect(text(editor)).toBe('пa');
  });

  test('range selection bypasses the matcher', () => {
    const {editor} = mkEditor([{type: 'p', children: [{text: 'abc'}]} as any]);
    editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 3}};
    editor.insertText('x');
    expect(text(editor)).toBe('x');
  });
});
