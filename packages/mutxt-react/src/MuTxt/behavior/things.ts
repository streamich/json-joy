import {Editor, Element as SlateElement, Node, Path, Point, Range, Transforms} from 'slate';
import type {CustomElement, CustomText, ThingsContainerElement, ThingElement} from '../types';

export const isThingsContainer = (node: unknown): node is ThingsContainerElement =>
  SlateElement.isElement(node) && (node as any).type === '.things';

export const isThingElement = (node: unknown): node is ThingElement =>
  SlateElement.isElement(node) && (node as any).type === '.thing';

const isInThingsBlock = (editor: Editor, path: Path): boolean => {
  if (path.length === 0) return false;
  const top = editor.children[path[0]];
  return isThingsContainer(top);
};

const firstContentBlockIndex = (editor: Editor): number => {
  let i = 0;
  while (i < editor.children.length && isThingsContainer(editor.children[i])) i++;
  return i;
};

const contentRange = (editor: Editor): Range | null => {
  const start = firstContentBlockIndex(editor);
  if (start >= editor.children.length) return null;
  const startPoint = Editor.start(editor, [start]);
  const endPoint = Editor.end(editor, [editor.children.length - 1]);
  return {anchor: startPoint, focus: endPoint};
};

export const ensureThingsBlock = (editor: Editor): Path => {
  for (let i = 0; i < editor.children.length; i++) {
    if (isThingsContainer(editor.children[i])) {
      if (i !== 0) Transforms.moveNodes(editor, {at: [i], to: [0], voids: true});
      return [0];
    }
  }
  const container: ThingsContainerElement = {type: '.things', children: [] as any};
  Transforms.insertNodes(editor, container as unknown as CustomElement, {at: [0], voids: true});
  return [0];
};

const createEmptyParagraph = (): CustomElement => ({type: 'p', children: [{text: ''}] as CustomText[]});

const clampPointOutOfThings = (editor: Editor, point: Point): Point | null => {
  if (!isInThingsBlock(editor, point.path)) return null;
  const idx = firstContentBlockIndex(editor);
  if (idx >= editor.children.length) return null;
  return Editor.start(editor, [idx]);
};

const normalizeThings = (editor: Editor, entry: [Node, Path]): boolean => {
  const [node, path] = entry;
  if (path.length === 1 && isThingsContainer(node)) {
    const idx = path[0];
    let first = -1;
    for (let i = 0; i < editor.children.length; i++) {
      if (isThingsContainer(editor.children[i])) {
        first = i;
        break;
      }
    }
    if (first === -1) return false;
    if (idx !== first) {
      const childCount = (node as ThingsContainerElement).children.length;
      const targetBaseIndex = (editor.children[first] as ThingsContainerElement).children.length;
      Editor.withoutNormalizing(editor, () => {
        for (let k = 0; k < childCount; k++) {
          Transforms.moveNodes(editor, {
            at: [idx, 0],
            to: [first, targetBaseIndex + k],
            voids: true,
          });
        }
        Transforms.removeNodes(editor, {at: [idx], voids: true});
      });
      return true;
    }
    if (first !== 0) {
      Transforms.moveNodes(editor, {at: [first], to: [0], voids: true});
      return true;
    }
    if (!node.children || node.children.length === 0) {
      Transforms.removeNodes(editor, {at: [first], voids: true});
      return true;
    }
  }

  if (path.length === 1 && isThingElement(node)) {
    let containerIdx = -1;
    for (let i = 0; i < editor.children.length; i++) {
      if (i === path[0]) continue;
      if (isThingsContainer(editor.children[i])) {
        containerIdx = i;
        break;
      }
    }
    if (containerIdx === -1) {
      Transforms.wrapNodes(
        editor,
        {type: '.things', children: [] as any} as ThingsContainerElement as unknown as CustomElement,
        {at: path, voids: true},
      );
    } else {
      const target = editor.children[containerIdx] as ThingsContainerElement;
      const insertAt: Path = [containerIdx, target.children.length];
      Transforms.moveNodes(editor, {at: path, to: insertAt, voids: true});
    }
    return true;
  }
  if (path.length === 0) {
    if (editor.children.length === 0) {
      Transforms.insertNodes(editor, createEmptyParagraph(), {at: [0]});
      return true;
    }
    let allThings = true;
    for (const child of editor.children) {
      if (!isThingsContainer(child)) {
        allThings = false;
        break;
      }
    }
    if (allThings) {
      Transforms.insertNodes(editor, createEmptyParagraph(), {at: [editor.children.length]});
      return true;
    }
  }

  return false;
};

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
