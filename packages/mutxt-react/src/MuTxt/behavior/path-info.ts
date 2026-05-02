import {Editor, Element as SlateElement, Node, Text, type Path, type Range} from 'slate';
import {getActiveEmbed} from './embed';
import {getLinkAttributes} from './link';
import type {CustomElement, CustomText} from '../types';

const CARET_MARK_ORDER: Array<[keyof Pick<CustomText, 'bold' | 'italic' | 'underline' | 'code'>, string]> = [
  ['bold', 'bold'],
  ['italic', 'italic'],
  ['underline', 'underline'],
  ['code', 'code'],
];

export interface CaretPathInfo {
  path: string[];
  linkHref?: string;
  embedUrl?: string;
  codeText?: string;
}

/** Get text of an inline mark inside which `Path` is located. */
const getMarkText = (editor: Editor, path: Path, type: keyof CustomText): string => {
  const node = Node.get(editor, path);
  if (!Text.isText(node) || node[type] !== true) return '';
  const [parentElement, parentPath] = Editor.parent(editor, path);
  if (!parentElement) return '';
  const textIndex = path[path.length - 1];
  const children = parentElement.children;
  let left = textIndex;
  let right = textIndex;
  while (left > 0) {
    const leftNode = children[left - 1];
    if (!Text.isText(leftNode) || leftNode[type] !== true) break;
    left--;
  }
  while (right < children.length - 1) {
    const rightNode = children[right + 1];
    if (!Text.isText(rightNode) || rightNode[type] !== true) break;
    right++;
  }
  const startPath = [...parentPath, left];
  const endPath = [...parentPath, right];
  const range: Range = {
    anchor: Editor.start(editor, startPath),
    focus: Editor.end(editor, endPath),
  };
  return Editor.string(editor, range);
};

export const getCaretPathInfo = (editor: Editor): CaretPathInfo => {
  const {selection} = editor;
  if (!selection) return {path: []};

  const activeEmbed = getActiveEmbed(editor);
  if (activeEmbed) {
    return {
      path: ['embed'],
      embedUrl: activeEmbed.url,
    };
  }

  const point = selection.focus;
  const segments: string[] = [];

  const [blockMatch] = Editor.nodes(editor, {
    at: point,
    match: (node) => SlateElement.isElement(node) && Editor.isBlock(editor, node),
  });

  if (blockMatch) {
    const [element] = blockMatch as [CustomElement, number[]];
    segments.push(element.type);
  }

  let textNode: CustomText | null = null;
  try {
    const node = Node.get(editor, point.path);
    if (Text.isText(node)) textNode = node as CustomText;
  } catch {}

  const marks = (Editor.marks(editor) ?? {}) as Partial<CustomText>;
  const markState: Partial<CustomText> = {...(textNode ?? {text: ''}), ...marks};
  const codeText = markState.code && textNode ? getMarkText(editor, point.path, 'code') : '';

  for (const [key, label] of CARET_MARK_ORDER) {
    if (markState[key]) segments.push(label);
  }

  const link = getLinkAttributes(markState);
  if (link) segments.push('link');

  return {
    path: segments,
    ...(link ? {linkHref: link.href} : {}),
    ...(codeText ? {codeText} : {}),
  };
};
