import {Editor, Element as SlateElement, Node, Range, Text} from 'slate';
import type {CustomElement, CustomText} from '../types';

export const getEditorPlainText = (editor: Editor): string => Node.string(editor).replace(/\s+$/g, '');

export const getWordCount = (text: string): number => {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
};

export const getSelectedText = (editor: Editor): string => {
  const {selection} = editor;
  if (!selection || Range.isCollapsed(selection)) return '';
  return Editor.string(editor, selection).trim();
};

export const pluralize = (count: number, singular: string, plural = singular + 's'): string =>
  `${Intl.NumberFormat().format(count)} ${count === 1 ? singular : plural}`;

export const isEmptyText = (child: Text | CustomText): boolean => {
  return Text.isText(child) && !child.text && Object.keys(child).length === 1;
};

export const isEmptyBlock = (element: CustomElement): boolean => {
  const children = element.children;
  if (!children || children.length === 0) return true;
  if (children.length > 1) return false;
  const child = children[0];
  if ('children' in child) return false;
  return isEmptyText(child);
};

export const isEmptyDoc = (editor: Editor): boolean => {
  const children = editor.children;
  if (!children) return true;
  const length = children.length;
  if (length === 0) return true;
  // Skip the hidden `.things` system block when judging emptiness.
  let start = 0;
  const first = children[0];
  if (SlateElement.isElement(first) && (first as any).type === '.things') start = 1;
  const userLength = length - start;
  if (userLength === 0) return true;
  if (userLength > 1) return false;
  const firstChild = children[start];
  if (!SlateElement.isElement(firstChild)) return false;
  if ((firstChild as any).type !== 'p') return false;
  if (!firstChild.children) return true;
  return isEmptyBlock(firstChild as CustomElement);
};
