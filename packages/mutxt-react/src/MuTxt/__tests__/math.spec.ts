import {createEditor} from 'slate';
import {
  getActiveMathBlockEntry,
  getActiveMathInlineEntry,
  insertMathBlock,
  insertMathInline,
  removeMathBlockAtPath,
  removeMathInlineAtPath,
  updateMathBlockCaption,
  withMath,
} from '../behavior/math';
import type {SlateEditorDocument} from '../types';

const createTestEditor = (doc: SlateEditorDocument) => {
  const editor = withMath(createEditor());
  editor.children = doc as any;
  return editor;
};

describe('math behavior', () => {
  test('marks math block nodes as void', () => {
    const editor = withMath(createEditor());
    expect(editor.isVoid({type: 'math', '@thing': 't1', children: [{text: ''}]} as any)).toBe(true);
  });

  test('marks math-inline nodes as void and inline', () => {
    const editor = withMath(createEditor());
    expect(editor.isVoid({type: 'math-inline', '@thing': 't1', children: [{text: ''}]} as any)).toBe(true);
    expect(editor.isInline({type: 'math-inline', '@thing': 't1', children: [{text: ''}]} as any)).toBe(true);
  });

  test('math block nodes are not inline', () => {
    const editor = withMath(createEditor());
    expect(editor.isInline({type: 'math', '@thing': 't1', children: [{text: ''}]} as any)).toBe(false);
  });

  test('inserts a math block into an empty paragraph and appends a trailing paragraph', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: ''}]}] as SlateEditorDocument);
    editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 0}};
    const node = insertMathBlock(editor, 'm_1');
    expect(node).toBeTruthy();
    expect((editor.children[0] as any).type).toBe('math');
    expect((editor.children[0] as any)['@thing']).toBe('m_1');
    expect((editor.children[1] as any).type).toBe('p');
    expect(editor.selection).toEqual({anchor: {path: [1, 0], offset: 0}, focus: {path: [1, 0], offset: 0}});
  });

  test('inserts a math block with a caption and trims whitespace', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: ''}]}] as SlateEditorDocument);
    editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 0}};
    insertMathBlock(editor, 'm_1', '  Pythagorean theorem  ');
    expect((editor.children[0] as any).caption).toBe('Pythagorean theorem');
  });

  test('updateMathBlockCaption sets and clears captions', () => {
    const editor = createTestEditor([
      {type: 'math', '@thing': 'm_1', caption: 'Old', children: [{text: ''}]},
      {type: 'p', children: [{text: ''}]},
    ] as SlateEditorDocument);
    expect(updateMathBlockCaption(editor, [0], 'New')).toBe(true);
    expect((editor.children[0] as any).caption).toBe('New');
    expect(updateMathBlockCaption(editor, [0], '')).toBe(true);
    expect((editor.children[0] as any).caption).toBeUndefined();
  });

  test('removeMathBlockAtPath removes the node', () => {
    const editor = createTestEditor([
      {type: 'math', '@thing': 'm_1', children: [{text: ''}]},
      {type: 'p', children: [{text: ''}]},
    ] as SlateEditorDocument);
    expect(removeMathBlockAtPath(editor, [0])).toBe(true);
    expect(editor.children).toEqual([{type: 'p', children: [{text: ''}]}]);
  });

  test('getActiveMathBlockEntry returns the entry when selection sits on it', () => {
    const editor = createTestEditor([
      {type: 'math', '@thing': 'm_1', children: [{text: ''}]},
      {type: 'p', children: [{text: ''}]},
    ] as SlateEditorDocument);
    editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 0}};
    const entry = getActiveMathBlockEntry(editor);
    expect(entry).toBeTruthy();
    expect(entry![0]['@thing']).toBe('m_1');
    expect(entry![1]).toEqual([0]);
  });

  test('insertBreak on an active math block creates a paragraph below', () => {
    const editor = createTestEditor([
      {type: 'math', '@thing': 'm_1', children: [{text: ''}]},
      {type: 'math', '@thing': 'm_2', children: [{text: ''}]},
    ] as SlateEditorDocument);
    editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 0}};
    editor.insertBreak();
    expect((editor.children[0] as any).type).toBe('math');
    expect((editor.children[1] as any).type).toBe('p');
    expect((editor.children[2] as any).type).toBe('math');
  });

  test('inserts an inline math node into a paragraph', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: 'pi = '}]}] as SlateEditorDocument);
    editor.selection = {anchor: {path: [0, 0], offset: 5}, focus: {path: [0, 0], offset: 5}};
    const node = insertMathInline(editor, 'm_pi');
    expect(node).toBeTruthy();
    // Paragraph still a single block; math-inline is among its children.
    expect((editor.children[0] as any).type).toBe('p');
    const children = (editor.children[0] as any).children;
    const hasInlineMath = children.some((child: any) => child.type === 'math-inline' && child['@thing'] === 'm_pi');
    expect(hasInlineMath).toBe(true);
  });

  test('removeMathInlineAtPath removes the inline node', () => {
    const editor = createTestEditor([
      {
        type: 'p',
        children: [{text: 'a '}, {type: 'math-inline', '@thing': 'm_pi', children: [{text: ''}]}, {text: ' b'}],
      },
    ] as any);
    expect(removeMathInlineAtPath(editor, [0, 1])).toBe(true);
    const children = (editor.children[0] as any).children;
    const remaining = children.filter((c: any) => c.type === 'math-inline');
    expect(remaining.length).toBe(0);
  });

  test('getActiveMathInlineEntry finds inline math under the selection', () => {
    const editor = createTestEditor([
      {
        type: 'p',
        children: [{text: 'a '}, {type: 'math-inline', '@thing': 'm_pi', children: [{text: ''}]}, {text: ' b'}],
      },
    ] as any);
    editor.selection = {anchor: {path: [0, 1], offset: 0}, focus: {path: [0, 1], offset: 0}};
    const entry = getActiveMathInlineEntry(editor);
    expect(entry).toBeTruthy();
    expect(entry![0]['@thing']).toBe('m_pi');
  });
});
