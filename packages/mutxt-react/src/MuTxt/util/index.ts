import {Editor, Element as SlateElement, Node, Range, Text} from 'slate';
import {ext, ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate} from '@jsonjoy.com/collaborative-slate';
import {getActiveEmbed} from './../behavior/embed';
import {getLinkAttributes} from './../behavior/link';
import type {CustomElement, CustomText, SlateEditorDocument} from '../types';
import type {Model} from 'json-joy/lib/json-crdt';

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
}

export const createEmptyDocument = (): SlateEditorDocument => [{type: 'p', children: [{text: ''}]} as CustomElement];

export const EMPTY_DOCUMENT: SlateEditorDocument = createEmptyDocument();

export const normalizeDocument = (value?: SlateEditorDocument): SlateEditorDocument => (value && value.length ? value : createEmptyDocument());

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

  for (const [key, label] of CARET_MARK_ORDER) {
    if (markState[key]) segments.push(label);
  }

  const link = getLinkAttributes(markState);
  if (link) segments.push('link');

  return {
    path: segments,
    linkHref: link?.href,
    embedUrl: undefined,
  };
};

export const pluralize = (count: number, singular: string, plural = singular + 's'): string =>
  `${Intl.NumberFormat().format(count)} ${count === 1 ? singular : plural}`;