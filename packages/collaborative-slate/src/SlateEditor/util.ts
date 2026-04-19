import {Editor, Element as SlateElement, Node, Range, Text, type Descendant} from 'slate';
import {ext, ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import type {Model} from 'json-joy/lib/json-crdt';
import {FromSlate} from '../sync/FromSlate';
import {getLinkAttributes} from './behavior/link';
import type {CustomElement, CustomText, HeadingElementType, SlateEditorDocument} from './types';

const CARET_MARK_ORDER: Array<[keyof Pick<CustomText, 'bold' | 'italic' | 'underline' | 'code'>, string]> = [
  ['bold', 'bold'],
  ['italic', 'italic'],
  ['underline', 'underline'],
  ['code', 'code'],
];

export interface CaretPathInfo {
  path: string[];
  linkHref?: string;
}

export interface DocumentOutlineItem {
  key: string;
  path: number[];
  type: HeadingElementType;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
}

const HEADING_LEVELS: Record<HeadingElementType, 1 | 2 | 3 | 4 | 5 | 6> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

export const EMPTY_DOCUMENT: SlateEditorDocument = [{type: 'p', children: [{text: ''}]} as CustomElement];

export const normalizeDocument = (value?: SlateEditorDocument): SlateEditorDocument => (value && value.length ? value : EMPTY_DOCUMENT);

export const createSlateEditorModel = (value?: SlateEditorDocument): Model<any> => {
  const model = ModelWithExt.create(ext.peritext.new('')) as unknown as Model<any>;
  const viewRange = FromSlate.convert(normalizeDocument(value) as any);
  const txt = (model as any).s.toExt().txt;
  txt.editor.merge(viewRange);
  txt.refresh();
  return model;
};

export const getEditorPlainText = (editor: Editor): string => Node.string(editor).replace(/\s+$/g, '');

export const getWordCount = (text: string): number => {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
};

const isHeadingType = (type: CustomElement['type']): type is HeadingElementType =>
  type === 'h1' || type === 'h2' || type === 'h3' || type === 'h4' || type === 'h5' || type === 'h6';

const collectDocumentOutline = (nodes: Descendant[], path: number[], outline: DocumentOutlineItem[]): void => {
  nodes.forEach((node, index) => {
    if (Text.isText(node)) return;
    const nodePath = [...path, index];
    if (SlateElement.isElement(node) && isHeadingType(node.type)) {
      const title = Node.string(node).trim();
      if (title) {
        outline.push({
          key: nodePath.join('.'),
          path: nodePath,
          type: node.type,
          level: HEADING_LEVELS[node.type],
          title,
        });
      }
    }
    collectDocumentOutline(node.children as Descendant[], nodePath, outline);
  });
};

export const getDocumentOutline = (value: SlateEditorDocument): DocumentOutlineItem[] => {
  const outline: DocumentOutlineItem[] = [];
  collectDocumentOutline(value, [], outline);
  return outline;
};

export const getSelectedText = (editor: Editor): string => {
  const {selection} = editor;
  if (!selection || Range.isCollapsed(selection)) return '';
  return Editor.string(editor, selection).trim();
};

export const getCaretPathInfo = (editor: Editor): CaretPathInfo => {
  const {selection} = editor;
  if (!selection) return {path: []};

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

  for (const [key, label] of CARET_MARK_ORDER) {
    if (markState[key]) segments.push(label);
  }

  const link = getLinkAttributes(markState);
  if (link) segments.push('link');

  return {
    path: segments,
    linkHref: link?.href,
  };
};

export const getCurrentBlockLabel = (editor: Editor): string => {
  const {selection} = editor;
  if (!selection) return 'Paragraph';
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => SlateElement.isElement(node) && Editor.isBlock(editor, node),
  });
  if (!match) return 'Paragraph';
  const [element] = match as [CustomElement, number[]];
  switch (element.type) {
    case 'h1':
      return 'Heading 1';
    case 'h2':
      return 'Heading 2';
    case 'h3':
      return 'Heading 3';
    case 'blockquote':
      return 'Quote';
    case 'code-block':
      return 'Code block';
    case 'ul':
      return 'Bulleted list';
    case 'ol':
      return 'Numbered list';
    case 'li':
      return 'List item';
    default:
      return 'Paragraph';
  }
};

export const pluralize = (count: number, singular: string, plural = singular + 's'): string =>
  `${Intl.NumberFormat().format(count)} ${count === 1 ? singular : plural}`;