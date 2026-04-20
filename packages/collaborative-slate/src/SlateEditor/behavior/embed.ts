import {Editor, Element as SlateElement, Node, Path, Transforms} from 'slate';
import type {CustomElement, CustomText, EmbedElement} from '../types';

export const isEmbedElement = (node: unknown): node is EmbedElement =>
  SlateElement.isElement(node) && node.type === 'embed';

export const normalizeEmbedUrl = (href: string): string => {
  const value = href.trim();
  if (!value) return '';
  const nextValue = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(nextValue);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
};

const normalizeCaption = (caption?: string): string | undefined => {
  const value = caption?.trim();
  return value ? value : undefined;
};

const createEmbedElement = (url: string, caption?: string): EmbedElement => {
  const children: CustomText[] = [{text: ''}];
  const element: EmbedElement = {
    type: 'embed',
    url,
    children,
  };
  const nextCaption = normalizeCaption(caption);
  if (nextCaption) element.caption = nextCaption;
  return element;
};

const createParagraphElement = (): CustomElement => ({
  type: 'p',
  children: [{text: ''}],
});

export const getActiveEmbedEntry = (editor: Editor): [EmbedElement, Path] | null => {
  const {selection} = editor;
  if (!selection) return null;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isEmbedElement(node),
  });
  return (match as [EmbedElement, Path] | undefined) ?? null;
};

export const getActiveEmbed = (editor: Editor): EmbedElement | null =>
  getActiveEmbedEntry(editor)?.[0] ?? null;

export const insertParagraphNearActiveEmbed = (editor: Editor, position: 'above' | 'below' = 'below'): Path | null => {
  const entry = getActiveEmbedEntry(editor);
  if (!entry) return null;
  const [, path] = entry;
  const targetPath = position === 'above' ? path : Path.next(path);
  Transforms.insertNodes(editor, createParagraphElement(), {at: targetPath});
  Transforms.select(editor, Editor.start(editor, targetPath));
  return targetPath;
};

export const updateEmbedAtPath = (editor: Editor, path: Path, url: string, caption?: string): boolean => {
  const normalizedUrl = normalizeEmbedUrl(url);
  if (!normalizedUrl) return false;
  if (!Node.has(editor, path)) return false;
  const node = Node.get(editor, path);
  if (!isEmbedElement(node)) return false;
  Transforms.setNodes(editor, {url: normalizedUrl} as Partial<EmbedElement>, {at: path});
  const nextCaption = normalizeCaption(caption);
  if (nextCaption) Transforms.setNodes(editor, {caption: nextCaption} as Partial<EmbedElement>, {at: path});
  else Transforms.unsetNodes(editor, 'caption', {at: path});
  return true;
};

export const removeEmbedAtPath = (editor: Editor, path: Path): boolean => {
  if (!Node.has(editor, path)) return false;
  const node = Node.get(editor, path);
  if (!isEmbedElement(node)) return false;
  Transforms.removeNodes(editor, {at: path});
  return true;
};

export const insertEmbed = (editor: Editor, url: string, caption?: string): EmbedElement | null => {
  const normalizedUrl = normalizeEmbedUrl(url);
  if (!normalizedUrl) return null;
  const embed = createEmbedElement(normalizedUrl, caption);
  const {selection} = editor;
  const currentBlockEntry = (selection
    ? Editor.above(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (node) => SlateElement.isElement(node) && Editor.isBlock(editor, node),
        mode: 'lowest',
      })
    : null) as [CustomElement, Path] | null;
  const shouldReplaceEmptyParagraph =
    !!currentBlockEntry &&
    currentBlockEntry[0].type === 'p' &&
    Node.string(currentBlockEntry[0]) === '';
  if (shouldReplaceEmptyParagraph) {
    const [, path] = currentBlockEntry;
    Transforms.removeNodes(editor, {at: path});
    Transforms.insertNodes(editor, embed, {at: path, select: true});
  } else {
    Transforms.insertNodes(editor, embed, {select: true});
  }
  const entry = getActiveEmbedEntry(editor);
  if (entry) {
    const [, path] = entry;
    const afterPath = Path.next(path);
    if (!Node.has(editor, afterPath)) {
      Transforms.insertNodes(editor, {type: 'p', children: [{text: ''}]} as CustomElement, {at: afterPath});
    }
    if (Node.has(editor, afterPath)) Transforms.select(editor, Editor.start(editor, afterPath));
  }
  return embed;
};

export const withEmbeds = <T extends Editor>(editor: T): T => {
  const {isVoid, insertBreak, insertSoftBreak, insertText} = editor;
  editor.isVoid = (element) => (element.type === 'embed' ? true : isVoid(element));
  editor.insertBreak = () => {
    if (insertParagraphNearActiveEmbed(editor, 'below')) return;
    insertBreak();
  };
  editor.insertSoftBreak = () => {
    if (insertParagraphNearActiveEmbed(editor, 'above')) return;
    insertSoftBreak();
  };
  editor.insertText = (text) => {
    if (text && insertParagraphNearActiveEmbed(editor, 'below')) {
      insertText(text);
      return;
    }
    insertText(text);
  };
  return editor;
};