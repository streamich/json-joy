import {Editor, Element as SlateElement, Transforms} from 'slate';
import type {
  CustomElement,
  FontKind,
} from '../types';
import {isFontKind} from '../fonts';
import {isListType} from './lists';

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

export const isBlockFontActive = (editor: Editor, font: FontKind): boolean =>
  getActiveBlockFont(editor) === font;

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

export const isLeafFontActive = (editor: Editor, font: FontKind): boolean =>
  getActiveLeafFont(editor) === font;

export const setLeafFont = (editor: Editor, font: FontKind | undefined): void => {
  const current = getActiveLeafFont(editor);
  if (!font || current === font) {
    Editor.removeMark(editor, 'font');
    return;
  }
  Editor.addMark(editor, 'font', font);
};
