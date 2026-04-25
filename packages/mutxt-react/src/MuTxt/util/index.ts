import {Editor, Element as SlateElement, Node, Path, Range, Text} from 'slate';
import {getActiveEmbed} from './../behavior/embed';
import {getLinkAttributes} from './../behavior/link';
import type {CustomElement, CustomText} from '../types';

const CARET_MARK_ORDER: Array<[keyof Pick<CustomText, 'bold' | 'italic' | 'underline' | 'code'>, string]> = [
  ['bold', 'bold'],
  ['italic', 'italic'],
  ['underline', 'underline'],
  ['code', 'code'],
];

const INLINE_FORMAT_KEYS: Array<keyof Pick<CustomText, 'bold' | 'italic' | 'underline' | 'code'>> = [
  'bold',
  'italic',
  'underline',
  'code',
];

export interface CaretPathInfo {
  path: string[];
  linkHref?: string;
  embedUrl?: string;
  codeText?: string;
}

const getTextEntries = (editor: Editor): [CustomText, Path][] =>
  Array.from(
    Editor.nodes(editor, {
      at: [],
      match: (node) => Text.isText(node),
    }),
  ) as [CustomText, Path][];

const getEntryIndex = (entries: [CustomText, Path][], path: Path): number =>
  entries.findIndex(([, entryPath]) => Path.equals(entryPath, path));

const getExpandedMarkRange = (
  editor: Editor,
  entries: [CustomText, Path][],
  index: number,
  key: keyof Pick<CustomText, 'code'>,
): Range => {
  let left = index;
  let right = index;
  while (left > 0 && entries[left - 1][0][key] === true) left--;
  while (right < entries.length - 1 && entries[right + 1][0][key] === true) right++;
  return {
    anchor: Editor.start(editor, entries[left][1]),
    focus: Editor.end(editor, entries[right][1]),
  };
};

const getActiveCodeText = (editor: Editor, path: Path): string => {
  const entries = getTextEntries(editor);
  const index = getEntryIndex(entries, path);
  if (index < 0 || entries[index][0].code !== true) return '';
  return Editor.string(editor, getExpandedMarkRange(editor, entries, index, 'code'));
};

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
  const codeText = markState.code && textNode ? getActiveCodeText(editor, point.path) : '';

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

export const pluralize = (count: number, singular: string, plural = singular + 's'): string =>
  `${Intl.NumberFormat().format(count)} ${count === 1 ? singular : plural}`;