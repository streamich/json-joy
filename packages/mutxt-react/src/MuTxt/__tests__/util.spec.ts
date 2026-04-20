import {createEditor} from 'slate';
import {getCurrentBlockLabel, shouldShowPlaceholder} from '../util';
import type {SlateEditorDocument} from '../types';
import {getDocumentOutline} from '../behavior/outline';

const createTestEditor = (doc: SlateEditorDocument, marks?: Record<string, unknown>) => {
  const editor = createEditor();
  editor.children = doc as any;
  editor.selection = {
    anchor: {path: [0, 0], offset: 0},
    focus: {path: [0, 0], offset: 0},
  };
  editor.marks = marks as any;
  return editor;
};

describe('SlateEditor util', () => {
  test('builds document outline entries from heading nodes in document order', () => {
    const doc: SlateEditorDocument = [
      {type: 'h1', children: [{text: 'Overview'}]},
      {type: 'p', children: [{text: 'Intro paragraph'}]},
      {type: 'h2', children: [{text: ' Getting started '}]},
      {
        type: 'blockquote',
        children: [{text: 'Context that should not show up in the outline'}],
      },
      {type: 'h3', children: [{text: 'API notes'}]},
      {type: 'h2', children: [{text: '   '}]},
    ];
    expect(getDocumentOutline(doc)).toEqual([
      {key: '0', path: [0], type: 'h1', level: 1, title: 'Overview'},
      {key: '2', path: [2], type: 'h2', level: 2, title: 'Getting started'},
      {key: '4', path: [4], type: 'h3', level: 3, title: 'API notes'},
    ]);
  });

  test('returns a columns label for the new layout block', () => {
    const editor = createTestEditor([{type: 'columns', children: [{text: 'Column content'}]}]);
    editor.selection = {
      anchor: {path: [0, 0], offset: 3},
      focus: {path: [0, 0], offset: 3},
    };
    expect(getCurrentBlockLabel(editor)).toBe('Two columns');
  });

  test('returns a checklist label for checklist blocks', () => {
    const editor = createTestEditor([{type: 'checklist', children: [{type: 'li', checked: false, children: [{text: 'Task'}]}]}]);
    editor.selection = {
      anchor: {path: [0, 0, 0], offset: 2},
      focus: {path: [0, 0, 0], offset: 2},
    };
    expect(getCurrentBlockLabel(editor)).toBe('Checklist');
  });

  test('shows placeholder when the current block is a plain paragraph', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: ''}]}]);
    expect(shouldShowPlaceholder(editor)).toBe(true);
  });

  test('hides placeholder when the current block has non-paragraph formatting', () => {
    const editor = createTestEditor([{type: 'h1', children: [{text: ''}]}]);
    expect(shouldShowPlaceholder(editor)).toBe(false);
  });

  test.each([
    ['bold', {bold: true}],
    ['italic', {italic: true}],
    ['underline', {underline: true}],
    ['code', {code: true}],
    ['link', {a: {href: 'https://jsonjoy.com'}}],
  ])('hides placeholder when %s formatting is pending', (_label, marks) => {
    const editor = createTestEditor([{type: 'p', children: [{text: ''}]}], marks);
    expect(shouldShowPlaceholder(editor)).toBe(false);
  });
});