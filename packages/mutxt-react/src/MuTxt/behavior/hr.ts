import {Editor, Element as SlateElement, Path, Transforms} from 'slate';
import {insertVoidBlock} from './voidInsert';
import type {CustomElement, CustomText, HrElement} from '../types';

export const isHrElement = (node: unknown): node is HrElement =>
  SlateElement.isElement(node) && node.type === 'hr';

const createHrElement = (overrides: Partial<HrElement> = {}): HrElement => {
  const children: CustomText[] = [{text: ''}];
  return {
    type: 'hr',
    children,
    ...overrides,
  };
};

const createParagraphElement = (): CustomElement => ({
  type: 'p',
  children: [{text: ''}],
});

export const getActiveHrEntry = (editor: Editor): [HrElement, Path] | null => {
  const {selection} = editor;
  if (!selection) return null;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isHrElement(node),
  });
  return (match as [HrElement, Path] | undefined) ?? null;
};

export const insertParagraphNearActiveHr = (editor: Editor, position: 'above' | 'below' = 'below'): Path | null => {
  const entry = getActiveHrEntry(editor);
  if (!entry) return null;
  const [, path] = entry;
  const targetPath = position === 'above' ? path : Path.next(path);
  Transforms.insertNodes(editor, createParagraphElement(), {at: targetPath});
  Transforms.select(editor, Editor.start(editor, targetPath));
  return targetPath;
};

export const insertHr = (editor: Editor, overrides: Partial<HrElement> = {}): HrElement | null =>
  insertVoidBlock(editor, createHrElement(overrides));

export const withHr = <T extends Editor>(editor: T): T => {
  const {isVoid, insertBreak, insertSoftBreak, insertText} = editor;
  editor.isVoid = (element) => (element.type === 'hr' ? true : isVoid(element));
  editor.insertBreak = () => {
    if (insertParagraphNearActiveHr(editor, 'below')) return;
    insertBreak();
  };
  editor.insertSoftBreak = () => {
    if (insertParagraphNearActiveHr(editor, 'above')) return;
    insertSoftBreak();
  };
  editor.insertText = (text) => {
    if (text && insertParagraphNearActiveHr(editor, 'below')) {
      insertText(text);
      return;
    }
    insertText(text);
  };
  return editor;
};
