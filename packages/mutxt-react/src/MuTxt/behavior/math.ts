import {Editor, Element as SlateElement, Node, Path, Transforms} from 'slate';
import {insertVoidBlock} from './voidInsert';
import type {CustomElement, CustomText, MathElement, MathInlineElement} from '../types';

export const isMathBlock = (node: unknown): node is MathElement =>
  SlateElement.isElement(node) && (node as MathElement).type === 'math';

export const isMathInline = (node: unknown): node is MathInlineElement =>
  SlateElement.isElement(node) && (node as MathInlineElement).type === 'math-inline';

const createParagraphElement = (): CustomElement => ({
  type: 'p',
  children: [{text: ''}] as CustomText[],
});

const createMathBlockElement = (thingId: string, caption?: string): MathElement => {
  const element: MathElement = {
    type: 'math',
    '@thing': thingId,
    children: [{text: ''}],
  };
  const trimmed = caption?.trim();
  if (trimmed) element.caption = trimmed;
  return element;
};

const createMathInlineElement = (thingId: string): MathInlineElement => ({
  type: 'math-inline',
  '@thing': thingId,
  children: [{text: ''}],
});

export const getActiveMathBlockEntry = (editor: Editor): [MathElement, Path] | null => {
  const {selection} = editor;
  if (!selection) return null;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isMathBlock(node),
  });
  return (match as [MathElement, Path] | undefined) ?? null;
};

export const getActiveMathInlineEntry = (editor: Editor): [MathInlineElement, Path] | null => {
  const {selection} = editor;
  if (!selection) return null;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isMathInline(node),
  });
  return (match as [MathInlineElement, Path] | undefined) ?? null;
};

export const insertParagraphNearActiveMathBlock = (
  editor: Editor,
  position: 'above' | 'below' = 'below',
): Path | null => {
  const entry = getActiveMathBlockEntry(editor);
  if (!entry) return null;
  const [, path] = entry;
  const targetPath = position === 'above' ? path : Path.next(path);
  Transforms.insertNodes(editor, createParagraphElement(), {at: targetPath});
  Transforms.select(editor, Editor.start(editor, targetPath));
  return targetPath;
};

export const updateMathBlockCaption = (editor: Editor, path: Path, caption?: string): boolean => {
  if (!Node.has(editor, path)) return false;
  const node = Node.get(editor, path);
  if (!isMathBlock(node)) return false;
  const trimmed = caption?.trim();
  if (trimmed) Transforms.setNodes(editor, {caption: trimmed} as Partial<MathElement>, {at: path});
  else Transforms.unsetNodes(editor, 'caption', {at: path});
  return true;
};

export const removeMathBlockAtPath = (editor: Editor, path: Path): boolean => {
  if (!Node.has(editor, path)) return false;
  const node = Node.get(editor, path);
  if (!isMathBlock(node)) return false;
  Transforms.removeNodes(editor, {at: path});
  return true;
};

export const removeMathInlineAtPath = (editor: Editor, path: Path): boolean => {
  if (!Node.has(editor, path)) return false;
  const node = Node.get(editor, path);
  if (!isMathInline(node)) return false;
  Transforms.removeNodes(editor, {at: path});
  return true;
};

export const insertMathBlock = (editor: Editor, thingId: string, caption?: string): MathElement | null =>
  insertVoidBlock(editor, createMathBlockElement(thingId, caption));

export const insertEmptyMathBlock = (mutxt: {editor: Editor; things: {add: (t: any) => string}}): string | null => {
  const id = mutxt.things.add({'@type': 'math', val: '', lang: 'latex'});
  const inserted = insertMathBlock(mutxt.editor, id);
  return inserted ? id : null;
};

export const insertMathInline = (editor: Editor, thingId: string): MathInlineElement | null => {
  const node = createMathInlineElement(thingId);
  Transforms.insertNodes(editor, node);
  Transforms.move(editor, {distance: 1, unit: 'offset'});
  return node;
};

export type OpenInlineMathEdit = (element: MathInlineElement, path: Path) => void;

const tryOpenInlineMathEdit = (editor: Editor): boolean => {
  const hook = (editor as any).onOpenInlineMathEdit as OpenInlineMathEdit | undefined;
  if (!hook) return false;
  const entry = getActiveMathInlineEntry(editor);
  if (!entry) return false;
  hook(entry[0], entry[1]);
  return true;
};

export const withMath = <T extends Editor>(editor: T): T => {
  const {isVoid, isInline, insertBreak, insertSoftBreak, insertText} = editor;
  editor.isVoid = (element) => {
    const type = (element as any).type;
    if (type === 'math' || type === 'math-inline') return true;
    return isVoid(element);
  };
  editor.isInline = (element) => {
    if ((element as any).type === 'math-inline') return true;
    return isInline(element);
  };
  editor.insertBreak = () => {
    if (tryOpenInlineMathEdit(editor)) return;
    if (insertParagraphNearActiveMathBlock(editor, 'below')) return;
    insertBreak();
  };
  editor.insertSoftBreak = () => {
    if (tryOpenInlineMathEdit(editor)) return;
    if (insertParagraphNearActiveMathBlock(editor, 'above')) return;
    insertSoftBreak();
  };
  editor.insertText = (text) => {
    if (text === ' ' && tryOpenInlineMathEdit(editor)) return;
    if (text && insertParagraphNearActiveMathBlock(editor, 'below')) {
      insertText(text);
      return;
    }
    insertText(text);
  };
  return editor;
};
