import {Editor, Element as SlateElement, Node, Range} from 'slate';
import {ext, ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import type {Model} from 'json-joy/lib/json-crdt';
import {FromSlate} from '../sync/FromSlate';
import type {CustomElement, SlateEditorDocument} from './types';

export const EMPTY_DOCUMENT: SlateEditorDocument = [{type: 'paragraph', children: [{text: ''}]} as CustomElement];

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

export const getCharacterCount = (text: string): number => text.length;

export const getSelectedText = (editor: Editor): string => {
  const {selection} = editor;
  if (!selection || Range.isCollapsed(selection)) return '';
  return Editor.string(editor, selection).trim();
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
    case 'heading-one':
      return 'Heading 1';
    case 'heading-two':
      return 'Heading 2';
    case 'heading-three':
      return 'Heading 3';
    case 'blockquote':
      return 'Quote';
    case 'code-block':
      return 'Code block';
    case 'bulleted-list':
      return 'Bulleted list';
    case 'numbered-list':
      return 'Numbered list';
    case 'list-item':
      return 'List item';
    default:
      return 'Paragraph';
  }
};

export const pluralize = (count: number, singular: string, plural = singular + 's'): string =>
  `${count} ${count === 1 ? singular : plural}`;