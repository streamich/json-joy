import {Editor, Element as SlateElement, Transforms} from 'slate';
import type {CustomElement, FontKind} from '../types';
import {isListType} from './lists';

export const FONT_FAMILIES: Record<FontKind, string> = {
  sans: '"Inter Variable","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif',
  serif: '"Source Serif 4 Variable","Source Serif 4","Source Serif Pro",Georgia,Cambria,"Times New Roman",Times,serif',
  slab: '"Bitter Variable","Bitter","Roboto Slab",Georgia,Cambria,"Times New Roman",Times,serif',
  mono: '"JetBrains Mono Variable","JetBrains Mono",Menlo,Consolas,"Liberation Mono",Courier,monospace',
};

export const isFontKind = (v: unknown): v is FontKind => v === 'sans' || v === 'serif' || v === 'slab' || v === 'mono';

export const fontFamilyOf = (kind: FontKind | undefined): string | undefined =>
  kind ? FONT_FAMILIES[kind] : undefined;

const isElement = (node: unknown): node is CustomElement => SlateElement.isElement(node);
const isFormattableBlock = (node: CustomElement): boolean => !isListType(node.type) && node.type !== 'embed';

const getActiveBlockFont = (editor: Editor): FontKind | undefined => {
  const {selection} = editor;
  if (!selection) return undefined;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
  });
  if (!match) return undefined;
  const [element] = match as [CustomElement, number[]];
  const value = (element as {font?: unknown}).font;
  return isFontKind(value) ? value : undefined;
};

export const isBlockFontActive = (editor: Editor, font: FontKind): boolean => getActiveBlockFont(editor) === font;

export const setBlockFont = (editor: Editor, font: FontKind | undefined): void => {
  const current = getActiveBlockFont(editor);
  if (!font || current === font) {
    Transforms.unsetNodes(editor, 'font', {
      match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
    });
    return;
  }
  Transforms.setNodes(editor, {font} as Partial<CustomElement>, {
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
  });
};

const getActiveLeafFont = (editor: Editor): FontKind | undefined => {
  const marks = Editor.marks(editor) as {font?: unknown} | null;
  const value = marks?.font;
  return isFontKind(value) ? value : undefined;
};

export const isLeafFontActive = (editor: Editor, font: FontKind): boolean => getActiveLeafFont(editor) === font;

export const setLeafFont = (editor: Editor, font: FontKind | undefined): void => {
  const current = getActiveLeafFont(editor);
  if (!font || current === font) {
    Editor.removeMark(editor, 'font');
    return;
  }
  Editor.addMark(editor, 'font', font);
};
