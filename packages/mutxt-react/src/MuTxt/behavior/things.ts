import {Editor, Element as SlateElement, Node, Path, Point, Range, Transforms} from 'slate';
import type {CustomElement, CustomText, ThingsContainerElement, ThingElement} from '../types';

export const isThingsContainer = (node: unknown): node is ThingsContainerElement =>
  SlateElement.isElement(node) && (node as any).type === '.things';

export const isThingElement = (node: unknown): node is ThingElement =>
  SlateElement.isElement(node) && (node as any).type === '.thing';

/** True if `path` points at a node inside the `.things` system block(s). */
const isInThingsBlock = (editor: Editor, path: Path): boolean => {
  if (path.length === 0) return false;
  if (path[0] !== 0) return false;
  const first = editor.children[0];
  return isThingsContainer(first);
};

const firstContentBlockIndex = (editor: Editor): number => {
  const first = editor.children[0];
  return isThingsContainer(first) ? 1 : 0;
};

/**
 * Range covering every user-content block (everything except `.things`).
 * Returns null if the document has no user content.
 */
const contentRange = (editor: Editor): Range | null => {
  const start = firstContentBlockIndex(editor);
  if (start >= editor.children.length) return null;
  const startPoint = Editor.start(editor, [start]);
  const endPoint = Editor.end(editor, [editor.children.length - 1]);
  return {anchor: startPoint, focus: endPoint};
};

/** Find or create the `.things` block, return its path (always `[0]`). */
export const ensureThingsBlock = (editor: Editor): Path => {
  const first = editor.children[0];
  if (isThingsContainer(first)) return [0];
  const container: ThingsContainerElement = {type: '.things', children: [] as any};
  Transforms.insertNodes(editor, container as unknown as CustomElement, {at: [0], voids: true});
  return [0];
};

const createEmptyParagraph = (): CustomElement => ({type: 'p', children: [{text: ''}] as CustomText[]});

const clampPathOutOfThings = (editor: Editor, path: Path): Path | null => {
  if (!isInThingsBlock(editor, path)) return null;
  const idx = firstContentBlockIndex(editor);
  if (idx >= editor.children.length) return null;
  return [idx];
};

const clampPointOutOfThings = (editor: Editor, point: Point): Point | null => {
  if (!isInThingsBlock(editor, point.path)) return null;
  const idx = firstContentBlockIndex(editor);
  if (idx >= editor.children.length) return null;
  return Editor.start(editor, [idx]);
};

/**
 * Normalize the document around the `.things` invariants:
 *
 * - `.things`, if present, must live at index 0.
 * - `.things` with zero children is removed.
 * - A stray `.thing` outside `.things` gets unwrapped (becomes a paragraph).
 * - A document containing only `.things` gets a trailing empty paragraph.
 */
const normalizeThings = (editor: Editor, entry: [Node, Path]): boolean => {
  const [node, path] = entry;
  if (path.length === 1 && isThingsContainer(node) && path[0] !== 0) {
    Transforms.moveNodes(editor, {at: path, to: [0], voids: true});
    return true;
  }
  if (path.length === 1 && isThingsContainer(node)) {
    if (!node.children || node.children.length === 0) {
      Transforms.removeNodes(editor, {at: path, voids: true});
      return true;
    }
  }
  if (path.length === 1 && isThingElement(node)) {
    // Stray `.thing` outside of a `.things` parent — convert to a paragraph
    // so the user doesn't lose the document slot.
    Transforms.setNodes(
      editor,
      {type: 'p'} as Partial<CustomElement>,
      {at: path, voids: true},
    );
    return true;
  }
  if (path.length === 0) {
    // Top-level: ensure at least one user-content block exists.
    if (editor.children.length === 0) {
      Transforms.insertNodes(editor, createEmptyParagraph(), {at: [0]});
      return true;
    }
    const onlyThings =
      editor.children.length === 1 && isThingsContainer(editor.children[0]);
    if (onlyThings) {
      Transforms.insertNodes(editor, createEmptyParagraph(), {at: [1]});
      return true;
    }
  }
  return false;
};

/**
 * Editor enhancer that protects the hidden `.things` block from accidental
 * navigation, deletion, or selection.
 * 
 * Layers:
 * 
 * - `editor.isVoid` returns true for `.things` and `.thing`.
 * - `editor.apply` clamps any `set_selection` op that targets `.things`.
 * - `editor.deleteBackward` is a no-op at the start of the first content
 *   block (so `.things` cannot be merged into).
 * - `editor.normalizeNode` enforces the layout invariants in `normalizeThings`.
 */
export const withProtectedThings = <T extends Editor>(editor: T): T => {
  const {isVoid, apply, deleteBackward, deleteFragment, normalizeNode} = editor;
  editor.isVoid = (element) => {
    const type = (element as any).type;
    if (type === '.things' || type === '.thing') return true;
    return isVoid(element);
  };
  editor.apply = (op) => {
    if (op.type === 'set_selection') {
      const {newProperties} = op as any;
      if (newProperties && (newProperties as any).anchor && (newProperties as any).focus) {
        const range = newProperties as Range;
        const next: any = {...range};
        const clampedAnchor = clampPointOutOfThings(editor, range.anchor);
        const clampedFocus = clampPointOutOfThings(editor, range.focus);
        if (clampedAnchor) next.anchor = clampedAnchor;
        if (clampedFocus) next.focus = clampedFocus;
        if (clampedAnchor || clampedFocus) {
          apply({...op, newProperties: next} as typeof op);
          return;
        }
      }
    }
    apply(op);
  };
  editor.deleteBackward = (unit) => {
    const {selection} = editor;
    if (selection && Range.isCollapsed(selection)) {
      const idx = firstContentBlockIndex(editor);
      if (idx > 0 && idx < editor.children.length) {
        const startOfContent = Editor.start(editor, [idx]);
        if (Point.equals(selection.anchor, startOfContent)) {
          // At the very start of the first content block - refuse to delete
          // backward (which would otherwise merge content into `.things`).
          return;
        }
      }
    }
    deleteBackward(unit);
  };
  editor.deleteFragment = (direction) => {
    const {selection} = editor;
    if (selection && !Range.isCollapsed(selection)) {
      const range = contentRange(editor);
      if (range) {
        const [start, end] = Range.edges(selection);
        const [contentStart, contentEnd] = Range.edges(range);
        let nextStart = start;
        let nextEnd = end;
        if (Point.isBefore(start, contentStart)) nextStart = contentStart;
        if (Point.isAfter(end, contentEnd)) nextEnd = contentEnd;
        if (nextStart !== start || nextEnd !== end) {
          Transforms.select(editor, {anchor: nextStart, focus: nextEnd});
        }
      }
    }
    deleteFragment(direction);
  };
  editor.normalizeNode = (entry) => {
    if (normalizeThings(editor, entry as [Node, Path])) return;
    normalizeNode(entry);
  };
  return editor;
};
