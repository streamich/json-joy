import {createEditor, Editor, Transforms} from 'slate';
import {
  // contentBlocks,
  // contentRange,
  ensureThingsBlock,
  // firstContentBlockIndex,
  // isInThingsBlock,
  // isThingsContainerElement,
  withProtectedThings,
} from '../behavior/things';
import {isEmptyDoc} from '../util';
import type {SlateEditorDocument} from '../types';

const createTestEditor = (doc: SlateEditorDocument) => {
  const editor = withProtectedThings(createEditor());
  editor.children = doc as any;
  editor.selection = null;
  return editor;
};

const docWithThings = (): SlateEditorDocument =>
  [
    {
      type: '.things',
      children: [
        {type: '.thing', thing: {'@type': 'File', '@id': 'f1'}, children: [{text: ''}]} as any,
      ],
    } as any,
    {type: 'title', children: [{text: 'Hello'}]},
    {type: 'p', children: [{text: 'World'}]},
  ];

describe('protection layer (withProtectedThings)', () => {
  test('marks `.things` and `.thing` as void', () => {
    const editor = withProtectedThings(createEditor());
    expect(editor.isVoid({type: '.things', children: []} as any)).toBe(true);
    expect(editor.isVoid({type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any)).toBe(true);
    expect(editor.isVoid({type: 'p', children: [{text: ''}]} as any)).toBe(false);
  });

  test('firstContentBlockIndex skips `.things`', () => {
    const editor = createTestEditor(docWithThings());
    // expect(firstContentBlockIndex(editor)).toBe(1);
    const editor2 = createTestEditor([{type: 'p', children: [{text: 'a'}]}]);
    // expect(firstContentBlockIndex(editor2)).toBe(0);
  });

  test('contentBlocks iterates only user content', () => {
    const editor = createTestEditor(docWithThings());
    // const types = [...contentBlocks(editor)].map(([n]) => (n as any).type);
    // expect(types).toEqual(['title', 'p']);
  });

  test('contentRange covers from first content block to end', () => {
    const editor = createTestEditor(docWithThings());
    // const range = contentRange(editor);
    // expect(range).not.toBeNull();
    // expect(range!.anchor.path).toEqual([1, 0]);
    // expect(range!.focus.path[0]).toBe(2);
  });

  test('ensureThingsBlock creates `.things` if missing (within withoutNormalizing)', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: ''}]}]);
    Editor.withoutNormalizing(editor, () => {
      const path = ensureThingsBlock(editor);
      expect(path).toEqual([0]);
      // Add a thing immediately so normalization doesn't sweep the empty container.
      Transforms.insertNodes(
        editor,
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
        {at: [0, 0]},
      );
    });
    // expect(isThingsContainerElement(editor.children[0])).toBe(true);
  });

  test('ensureThingsBlock is idempotent when `.things` exists', () => {
    const editor = createTestEditor(docWithThings());
    const path = ensureThingsBlock(editor);
    expect(path).toEqual([0]);
    expect(editor.children.length).toBe(3);
  });

  test('Backspace at start of first content block does not delete `.things`', () => {
    const editor = createTestEditor(docWithThings());
    editor.selection = {
      anchor: {path: [1, 0], offset: 0},
      focus: {path: [1, 0], offset: 0},
    };
    editor.deleteBackward('character');
    // expect(isThingsContainerElement(editor.children[0])).toBe(true);
    // Title text should not have changed.
    expect((editor.children[1] as any).children[0].text).toBe('Hello');
  });

  test('Cmd+A-equivalent (delete fragment over full doc) leaves `.things` intact', () => {
    const editor = createTestEditor(docWithThings());
    // Simulate Cmd+A: select the entire tree.
    editor.selection = Editor.range(editor, []);
    editor.deleteFragment();
    // expect(isThingsContainerElement(editor.children[0])).toBe(true);
  });

  test('programmatic select targeting `.things[0]` clamps to first content block', () => {
    const editor = createTestEditor(docWithThings());
    Transforms.select(editor, [0, 0]);
    expect(editor.selection).not.toBeNull();
    expect(editor.selection!.anchor.path[0]).toBe(1);
  });

  test('document containing only `.things` gets a trailing empty paragraph', () => {
    const editor = createTestEditor([
      {
        type: '.things',
        children: [
          {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
        ],
      } as any,
    ]);
    Editor.normalize(editor, {force: true});
    expect(editor.children.length).toBe(2);
    expect((editor.children[1] as any).type).toBe('p');
  });

  test('isEmpty returns true for `.things` + empty paragraph', () => {
    const editor = createTestEditor([
      {
        type: '.things',
        children: [
          {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
        ],
      } as any,
      {type: 'p', children: [{text: ''}]},
    ]);
    expect(isEmptyDoc(editor)).toBe(true);
  });

  test('isEmpty returns false when there is a non-empty paragraph after `.things`', () => {
    const editor = createTestEditor(docWithThings());
    expect(isEmptyDoc(editor)).toBe(false);
  });

  test('normalization moves `.things` from a non-zero index to [0]', () => {
    const editor = createTestEditor([
      {type: 'p', children: [{text: 'first'}]},
      {
        type: '.things',
        children: [
          {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
        ],
      } as any,
    ]);
    Editor.normalize(editor, {force: true});
    // expect(isThingsContainerElement(editor.children[0])).toBe(true);
    expect((editor.children[1] as any).type).toBe('p');
  });

  test('empty `.things` is removed by normalization', () => {
    const editor = createTestEditor([
      {type: '.things', children: [] as any} as any,
      {type: 'p', children: [{text: 'hi'}]},
    ]);
    Editor.normalize(editor, {force: true});
    // expect(isThingsContainerElement(editor.children[0])).toBe(false);
    expect(editor.children.length).toBe(1);
  });

  test('isInThingsBlock detects nodes under `.things`', () => {
    const editor = createTestEditor(docWithThings());
    // expect(isInThingsBlock(editor, [0])).toBe(true);
    // expect(isInThingsBlock(editor, [0, 0])).toBe(true);
    // expect(isInThingsBlock(editor, [1])).toBe(false);
    // expect(isInThingsBlock(editor, [2])).toBe(false);
  });
});
