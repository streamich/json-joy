import {Editor, Path, Transforms} from 'slate';
import {getCurrentBlockEntry} from '../behavior';
import {cloneBinary} from '@jsonjoy.com/util/lib/json-clone/cloneBinary';

export const moveBlockUp = (editor: Editor): boolean => {
  const entry = getCurrentBlockEntry(editor);
  if (!entry) return false;
  const [, path] = entry;
  if (!Path.hasPrevious(path)) return false;
  Transforms.moveNodes(editor, {at: path, to: Path.previous(path)});
  return true;
};

export const moveBlockDown = (editor: Editor): boolean => {
  const entry = getCurrentBlockEntry(editor);
  if (!entry) return false;
  const [, path] = entry;
  const [parent] = Editor.parent(editor, path);
  const lastIndex = path[path.length - 1];
  const siblingCount = (parent as {children?: unknown[]}).children?.length ?? 0;
  if (lastIndex >= siblingCount - 1) return false;
  Transforms.moveNodes(editor, {at: path, to: Path.next(path)});
  return true;
};

export const duplicateBlock = (editor: Editor): boolean => {
  const entry = getCurrentBlockEntry(editor);
  if (!entry) return false;
  const [block, path] = entry;
  Transforms.insertNodes(editor, cloneBinary(block), {at: Path.next(path)});
  return true;
};

export const deleteBlock = (editor: Editor): boolean => {
  const entry = getCurrentBlockEntry(editor);
  if (!entry) return false;
  const [, path] = entry;
  Transforms.removeNodes(editor, {at: path});
  return true;
};
