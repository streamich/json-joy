import {Editor, Element as SlateElement, Transforms} from 'slate';
import {isListType} from '../behavior';
import type {CustomElement} from '../types';

const isElement = (node: unknown): node is CustomElement => SlateElement.isElement(node);
const isFormattableBlock = (node: CustomElement): boolean => !isListType(node.type) && node.type !== 'embed';

/** Maximum number of indent steps a block can have. */
export const MAX_INDENT = 8;
/** Width of one indent step, in CSS pixels. */
export const INDENT_STEP_PX = 24;

export const getActiveIndent = (editor: Editor): number => {
  const {selection} = editor;
  if (!selection) return 0;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
  });
  if (!match) return 0;
  const [element] = match as [CustomElement, number[]];
  const indent = (element as CustomElement & {indent?: number}).indent;
  return typeof indent === 'number' && indent > 0 ? indent : 0;
};

export const setIndent = (editor: Editor, indent: number): void => {
  const clamped = Math.max(0, Math.min(MAX_INDENT, Math.floor(indent)));
  if (!clamped) {
    Transforms.unsetNodes(editor, 'indent', {
      match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
    });
    return;
  }
  Transforms.setNodes(editor, {indent: clamped} as Partial<CustomElement>, {
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
  });
};

export const indentBlock = (editor: Editor): void => {
  setIndent(editor, getActiveIndent(editor) + 1);
};

export const dedentBlock = (editor: Editor): void => {
  const current = getActiveIndent(editor);
  if (!current) return;
  setIndent(editor, current - 1);
};

export const indentPadding = (indent: number | undefined): number | undefined => {
  if (!indent || indent < 1) return undefined;
  const steps = Math.min(MAX_INDENT, Math.floor(indent));
  return steps * INDENT_STEP_PX;
};
