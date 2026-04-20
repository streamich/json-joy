import {createEditor} from 'slate';
import {
  getActiveEmbed,
  insertEmbed,
  insertParagraphNearActiveEmbed,
  normalizeEmbedUrl,
  removeEmbedAtPath,
  updateEmbedAtPath,
  withEmbeds,
} from '../behavior/embed';
import {getCaretPathInfo} from '../util';
import type {SlateEditorDocument} from '../types';

const createTestEditor = (doc: SlateEditorDocument) => {
  const editor = withEmbeds(createEditor());
  editor.children = doc as any;
  return editor;
};

describe('embed behavior', () => {
  test('normalizes embed URLs to https', () => {
    expect(normalizeEmbedUrl('youtube.com/watch?v=test')).toBe('https://youtube.com/watch?v=test');
    expect(normalizeEmbedUrl('ftp://example.com/file')).toBe('');
  });

  test('marks embed nodes as void', () => {
    const editor = withEmbeds(createEditor());
    expect(editor.isVoid({type: 'embed', url: 'https://example.com', children: [{text: ''}]} as any)).toBe(true);
  });

  test('updates and removes the active embed node', () => {
    const editor = createTestEditor([
      {type: 'embed', url: 'https://youtube.com/watch?v=one', children: [{text: ''}]},
      {type: 'p', children: [{text: ''}]},
    ] as SlateEditorDocument);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    expect(getActiveEmbed(editor)?.url).toBe('https://youtube.com/watch?v=one');
    expect(updateEmbedAtPath(editor, [0], 'vimeo.com/1', 'Clip')).toBe(true);
    expect((editor.children[0] as any).url).toBe('https://vimeo.com/1');
    expect((editor.children[0] as any).caption).toBe('Clip');
    expect(removeEmbedAtPath(editor, [0])).toBe(true);
    expect(editor.children).toEqual([{type: 'p', children: [{text: ''}]}]);
  });

  test('reports embed caret info when an embed is selected', () => {
    const editor = createTestEditor([
      {type: 'embed', url: 'https://www.youtube.com/watch?v=soICQ3B2kEk', children: [{text: ''}]},
      {type: 'p', children: [{text: ''}]},
    ] as SlateEditorDocument);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    expect(getCaretPathInfo(editor)).toEqual({
      path: ['embed'],
      embedUrl: 'https://www.youtube.com/watch?v=soICQ3B2kEk',
    });
  });

  test('insertBreak on an active embed creates a paragraph below it', () => {
    const editor = createTestEditor([
      {type: 'embed', url: 'https://www.youtube.com/watch?v=one', children: [{text: ''}]},
      {type: 'embed', url: 'https://vimeo.com/1', children: [{text: ''}]},
    ] as SlateEditorDocument);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    editor.insertBreak();
    expect((editor.children[0] as any).type).toBe('embed');
    expect((editor.children[1] as any).type).toBe('p');
    expect((editor.children[2] as any).type).toBe('embed');
    expect(editor.selection).toEqual({
      anchor: {path: [1, 0], offset: 0},
      focus: {path: [1, 0], offset: 0},
    });
  });

  test('insertSoftBreak on an active embed creates a paragraph above it', () => {
    const editor = createTestEditor([
      {type: 'embed', url: 'https://www.youtube.com/watch?v=one', children: [{text: ''}]},
    ] as SlateEditorDocument);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    editor.insertSoftBreak();
    expect((editor.children[0] as any).type).toBe('p');
    expect((editor.children[1] as any).type).toBe('embed');
    expect(editor.selection).toEqual({
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    });
  });

  test('typing on an active embed creates a paragraph below and inserts text', () => {
    const editor = createTestEditor([
      {type: 'embed', url: 'https://www.youtube.com/watch?v=one', children: [{text: ''}]},
      {type: 'embed', url: 'https://vimeo.com/1', children: [{text: ''}]},
    ] as SlateEditorDocument);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    editor.insertText('A');
    expect((editor.children[1] as any)).toEqual({type: 'p', children: [{text: 'A'}]});
    expect((editor.children[2] as any).type).toBe('embed');
  });

  test('can insert a paragraph near the active embed directly', () => {
    const editor = createTestEditor([
      {type: 'embed', url: 'https://www.youtube.com/watch?v=one', children: [{text: ''}]},
    ] as SlateEditorDocument);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    const path = insertParagraphNearActiveEmbed(editor, 'below');
    expect(path).toEqual([1]);
    expect((editor.children[1] as any).type).toBe('p');
  });

  test('inserts an embed block and leaves a paragraph after it', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: ''}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 0},
      focus: {path: [0, 0], offset: 0},
    };
    insertEmbed(editor, 'https://www.youtube.com/watch?v=soICQ3B2kEk');
    expect((editor.children[0] as any).type).toBe('embed');
    expect((editor.children[1] as any).type).toBe('p');
  });
});
