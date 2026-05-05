import {Editor, Element as SlateElement, Node, Path, Transforms} from 'slate';
import type {CustomElement, CustomText} from '../types';

const createParagraph = (): CustomElement => ({type: 'p', children: [{text: ''}] as CustomText[]});

const isAtEmptyParagraph = (entry: [CustomElement, Path] | null): boolean =>
  !!entry && (entry[0] as any).type === 'p' && Node.string(entry[0]) === '';

/**
 * If the caret/selection is on the very first block and that block is a void,
 * prepend an empty paragraph and move the caret into it.
 */
export const insertPAboveLeadingVoid = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  if (selection.anchor.path[0] !== 0) return false;
  const first = (editor as any).children?.[0];
  if (!SlateElement.isElement(first)) return false;
  if (!Editor.isVoid(editor, first)) return false;
  Transforms.insertNodes(editor, createParagraph(), {at: [0]});
  Transforms.select(editor, Editor.start(editor, [0]));
  return true;
};

/**
 * Insert a void block element at the current selection. Mirrors the pattern
 * shared by `<embed>`, `<hr>`, `<file>`, and any future block voids:
 *
 *   1. If the caret is in an empty paragraph, replace it with the void.
 *   2. Otherwise insert the void at the caret.
 *   3. Ensure there's a paragraph immediately after, and place the caret in it.
 *
 * Returns the inserted node (echoing the input), or `null` if there was no
 * selection and Slate refused to insert.
 */
export const insertVoidBlock = <T extends CustomElement>(editor: Editor, element: T): T | null => {
  const {selection} = editor;
  const currentBlockEntry = (
    selection
      ? Editor.above(editor, {
          at: Editor.unhangRange(editor, selection),
          match: (node) => SlateElement.isElement(node) && Editor.isBlock(editor, node),
          mode: 'lowest',
        })
      : null
  ) as [CustomElement, Path] | null;

  let insertedPath: Path | null = null;

  if (isAtEmptyParagraph(currentBlockEntry)) {
    const [, path] = currentBlockEntry!;
    Transforms.removeNodes(editor, {at: path});
    Transforms.insertNodes(editor, element, {at: path, select: true});
    insertedPath = path;
  } else {
    Transforms.insertNodes(editor, element, {select: true});
    // After insertion, the new node is wherever Slate placed it. Resolve via
    // the editor's current selection.
    const after = editor.selection;
    if (after) insertedPath = [after.anchor.path[0]];
  }

  if (!insertedPath) return null;

  const afterPath = Path.next(insertedPath);
  if (!Node.has(editor, afterPath)) {
    Transforms.insertNodes(editor, createParagraph(), {at: afterPath});
  }
  if (Node.has(editor, afterPath)) {
    Transforms.select(editor, Editor.start(editor, afterPath));
  }
  return element;
};
