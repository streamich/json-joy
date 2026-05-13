import {Editor, Node, Path, Range, Transforms} from 'slate';
import type {CustomElement} from '../types';

/** Returns `true` when the selection is an expanded range that covers the
 * entire user-visible document. */
export const isFullDocSelected = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection || Range.isCollapsed(selection)) return false;
  const children = editor.children;
  if (!children.length) return false;
  const firstIdx = 0;
  const lastIdx = children.length - 1;
  if (lastIdx < firstIdx) return false;
  let docStart: ReturnType<typeof Editor.start>;
  let docEnd: ReturnType<typeof Editor.end>;
  try {
    docStart = Editor.start(editor, [firstIdx]);
    docEnd = Editor.end(editor, [lastIdx]);
  } catch {
    return false;
  }
  const [selStart, selEnd] = Range.edges(selection);
  return (
    Path.equals(selStart.path, docStart.path) &&
    selStart.offset === docStart.offset &&
    Path.equals(selEnd.path, docEnd.path) &&
    selEnd.offset === docEnd.offset
  );
};

export const resetDocumentContent = (editor: Editor, text = ''): void => {
  Editor.withoutNormalizing(editor, () => {
    const firstIdx = 0;
    for (let i = editor.children.length - 1; i >= firstIdx; i--) {
      Transforms.removeNodes(editor, {at: [i]});
    }
    const paragraph: CustomElement = {type: 'p', children: [{text}]};
    Transforms.insertNodes(editor, paragraph, {at: [firstIdx]});
    const caret = text
      ? Editor.end(editor, [firstIdx])
      : Editor.start(editor, [firstIdx]);
    Transforms.select(editor, caret);
  });
};

export interface SelectAllGuardHooks {
  onDelete?: () => boolean;
  onReplaceWithText?: (text: string) => boolean;
  onReplaceWithFragment?: (fragment: Node[]) => boolean;
}

export const withSelectAllGuard = <T extends Editor>(editor: T, hooks: SelectAllGuardHooks): T => {
  const {deleteFragment, insertText, insertFragment} = editor;
  editor.deleteFragment = (direction) => {
    if (isFullDocSelected(editor)) {
      if (hooks.onDelete?.()) return;
      resetDocumentContent(editor);
      return;
    }
    deleteFragment(direction);
  };
  editor.insertText = (text) => {
    if (text && isFullDocSelected(editor)) {
      if (hooks.onReplaceWithText?.(text)) return;
      resetDocumentContent(editor, text);
      return;
    }
    insertText(text);
  };
  editor.insertFragment = (fragment) => {
    if (isFullDocSelected(editor)) {
      if (hooks.onReplaceWithFragment?.(fragment)) return;
      resetDocumentContent(editor);
    }
    insertFragment(fragment);
  };
  return editor;
};
