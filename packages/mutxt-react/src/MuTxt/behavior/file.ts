import {Editor, Element as SlateElement, Node, Path, Transforms} from 'slate';
import {insertVoidBlock} from './voidInsert';
import type {CustomElement, CustomText, FileElement} from '../types';

export const isFileElement = (node: unknown): node is FileElement =>
  SlateElement.isElement(node) && (node as any).type === 'file';

const createParagraphElement = (): CustomElement => ({
  type: 'p',
  children: [{text: ''}] as CustomText[],
});

const createFileElement = (thingId: string, caption?: string): FileElement => {
  const el: FileElement = {
    type: 'file',
    '@thing': thingId,
    children: [{text: ''}] as CustomText[],
  };
  if (caption && caption.trim()) el.caption = caption.trim();
  return el;
};

const getActiveFileEntry = (editor: Editor): [FileElement, Path] | undefined => {
  const {selection} = editor;
  if (!selection) return;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isFileElement(node),
  });
  return (match as [FileElement, Path] | undefined) ?? void 0;
};

const insertParagraphNearActiveFile = (editor: Editor, position: 'above' | 'below' = 'below'): Path | null => {
  const entry = getActiveFileEntry(editor);
  if (!entry) return null;
  const [, path] = entry;
  const targetPath = position === 'above' ? path : Path.next(path);
  Transforms.insertNodes(editor, createParagraphElement(), {at: targetPath});
  Transforms.select(editor, Editor.start(editor, targetPath));
  return targetPath;
};

export const removeFileAtPath = (editor: Editor, path: Path): boolean => {
  if (!Node.has(editor, path)) return false;
  const node = Node.get(editor, path);
  if (!isFileElement(node)) return false;
  Transforms.removeNodes(editor, {at: path});
  return true;
};

export const insertFile = (editor: Editor, thingId: string, caption?: string): FileElement | null => {
  if (!thingId) return null;
  return insertVoidBlock(editor, createFileElement(thingId, caption));
};

export const withFile = <T extends Editor>(editor: T): T => {
  const {isVoid, insertBreak, insertSoftBreak, insertText} = editor;
  editor.isVoid = (element) => ((element as any).type === 'file' ? true : isVoid(element));
  editor.insertBreak = () => {
    if (insertParagraphNearActiveFile(editor, 'below')) return;
    insertBreak();
  };
  editor.insertSoftBreak = () => {
    if (insertParagraphNearActiveFile(editor, 'above')) return;
    insertSoftBreak();
  };
  editor.insertText = (text) => {
    if (text && insertParagraphNearActiveFile(editor, 'below')) {
      insertText(text);
      return;
    }
    insertText(text);
  };
  return editor;
};
