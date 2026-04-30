import {createEditor, Editor, Transforms} from 'slate';
import {
  ensureThingsBlock,
  isThingElement,
  isThingsContainer,
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

  test('ensureThingsBlock creates `.things` if missing (within withoutNormalizing)', () => {
    const editor = createTestEditor([{type: 'p', children: [{text: ''}]}]);
    Editor.withoutNormalizing(editor, () => {
      const path = ensureThingsBlock(editor);
      expect(path).toEqual([0]);
      Transforms.insertNodes(
        editor,
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
        {at: [0, 0], voids: true},
      );
    });
    expect(isThingsContainer(editor.children[0])).toBe(true);
  });

  test('ensureThingsBlock is idempotent when `.things` exists', () => {
    const editor = createTestEditor(docWithThings());
    const path = ensureThingsBlock(editor);
    expect(path).toEqual([0]);
    expect(editor.children.length).toBe(3);
  });

  test('ensureThingsBlock relocates a misplaced `.things` to index 0', () => {
    const editor = createTestEditor([
      {type: 'p', children: [{text: 'before'}]},
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
      ]} as any,
    ]);
    const path = ensureThingsBlock(editor);
    expect(path).toEqual([0]);
    expect(isThingsContainer(editor.children[0])).toBe(true);
    expect((editor.children[1] as any).type).toBe('p');
  });

  test('Backspace at start of first content block does not delete `.things`', () => {
    const editor = createTestEditor(docWithThings());
    editor.selection = {
      anchor: {path: [1, 0], offset: 0},
      focus: {path: [1, 0], offset: 0},
    };
    editor.deleteBackward('character');
    expect(isThingsContainer(editor.children[0])).toBe(true);
    expect((editor.children[1] as any).children[0].text).toBe('Hello');
  });

  test('Cmd+A-equivalent (delete fragment over full doc) leaves `.things` intact', () => {
    const editor = createTestEditor(docWithThings());
    editor.selection = Editor.range(editor, []);
    editor.deleteFragment();
    expect(isThingsContainer(editor.children[0])).toBe(true);
  });

  test('programmatic select targeting `.things[0]` clamps to first content block', () => {
    const editor = createTestEditor(docWithThings());
    Transforms.select(editor, [0, 0]);
    expect(editor.selection).not.toBeNull();
    expect(editor.selection!.anchor.path[0]).toBe(1);
    expect(editor.selection!.focus.path[0]).toBe(1);
  });

  test('document containing only `.things` gets a trailing empty paragraph', () => {
    const editor = createTestEditor([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
      ]} as any,
    ]);
    Editor.normalize(editor, {force: true});
    expect(editor.children.length).toBe(2);
    expect((editor.children[1] as any).type).toBe('p');
  });

  test('isEmpty returns true for `.things` + empty paragraph', () => {
    const editor = createTestEditor([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: ''}]},
    ]);
    expect(isEmptyDoc(editor)).toBe(true);
  });

  test('isEmpty returns false when there is non-empty content after `.things`', () => {
    const editor = createTestEditor(docWithThings());
    expect(isEmptyDoc(editor)).toBe(false);
  });
});

describe('protection layer — resilience to misplaced/duplicate `.things`', () => {
  test('normalization moves `.things` from index N to [0]', () => {
    const editor = createTestEditor([
      {type: 'p', children: [{text: 'first'}]},
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
      ]} as any,
    ]);
    Editor.normalize(editor, {force: true});
    expect(isThingsContainer(editor.children[0])).toBe(true);
    expect((editor.children[1] as any).type).toBe('p');
    expect((editor.children[1] as any).children[0].text).toBe('first');
  });

  test('empty `.things` is removed by normalization', () => {
    const editor = createTestEditor([
      {type: '.things', children: [] as any} as any,
      {type: 'p', children: [{text: 'hi'}]},
    ]);
    Editor.normalize(editor, {force: true});
    expect(isThingsContainer(editor.children[0])).toBe(false);
    expect(editor.children.length).toBe(1);
  });

  test('multiple `.things` blocks merge into one', () => {
    const editor = createTestEditor([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: 'between'}]},
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'b'}, children: [{text: ''}]} as any,
        {type: '.thing', thing: {'@type': 'X', '@id': 'c'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: 'after'}]},
    ]);
    Editor.normalize(editor, {force: true});
    // After normalization there's exactly one `.things` block at index 0.
    let count = 0;
    for (const child of editor.children) {
      if (isThingsContainer(child)) count++;
    }
    expect(count).toBe(1);
    expect(isThingsContainer(editor.children[0])).toBe(true);
    const merged = (editor.children[0] as any).children;
    const ids = merged.map((c: any) => c.thing['@id']).sort();
    expect(ids).toEqual(['a', 'b', 'c']);
  });

  test('multiple misplaced `.things` blocks (none at index 0) consolidate to [0]', () => {
    const editor = createTestEditor([
      {type: 'p', children: [{text: 'lead'}]},
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: 'mid'}]},
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'b'}, children: [{text: ''}]} as any,
      ]} as any,
    ]);
    Editor.normalize(editor, {force: true});
    expect(isThingsContainer(editor.children[0])).toBe(true);
    let count = 0;
    for (const child of editor.children) if (isThingsContainer(child)) count++;
    expect(count).toBe(1);
    const ids = (editor.children[0] as any).children.map((c: any) => c.thing['@id']).sort();
    expect(ids).toEqual(['a', 'b']);
  });

  test('stray `.thing` outside `.things` is moved into `.things`', () => {
    const editor = createTestEditor([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: 'before'}]},
      {type: '.thing', thing: {'@type': 'X', '@id': 'stray'}, children: [{text: ''}]} as any,
      {type: 'p', children: [{text: 'after'}]},
    ]);
    Editor.normalize(editor, {force: true});
    // `.thing` rows preserved in `.things` (no payload lost).
    const ids = (editor.children[0] as any).children
      .filter((c: any) => isThingElement(c))
      .map((c: any) => c.thing['@id'])
      .sort();
    expect(ids).toEqual(['a', 'stray']);
    // No remaining stray `.thing` at top level.
    for (let i = 1; i < editor.children.length; i++) {
      expect(isThingElement(editor.children[i])).toBe(false);
    }
  });

  test('stray `.thing` with no `.things` block: a `.things` is created around it', () => {
    const editor = createTestEditor([
      {type: 'p', children: [{text: 'before'}]},
      {type: '.thing', thing: {'@type': 'X', '@id': 'stray'}, children: [{text: ''}]} as any,
      {type: 'p', children: [{text: 'after'}]},
    ]);
    Editor.normalize(editor, {force: true});
    expect(isThingsContainer(editor.children[0])).toBe(true);
    const innerIds = (editor.children[0] as any).children
      .filter((c: any) => isThingElement(c))
      .map((c: any) => c.thing['@id']);
    expect(innerIds).toEqual(['stray']);
  });
});
