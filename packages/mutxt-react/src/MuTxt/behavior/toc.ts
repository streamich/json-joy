import {type Editor, Element as SlateElement} from 'slate';
import {insertVoidBlock} from './voidInsert';
import type {CustomText, TocElement} from '../types';

export const isTocElement = (node: unknown): node is TocElement => SlateElement.isElement(node) && node.type === 'toc';

const createTocElement = (overrides: Partial<TocElement> = {}): TocElement => {
  const children: CustomText[] = [{text: ''}];
  return {
    type: 'toc',
    children,
    ...overrides,
  };
};

export const insertToc = (editor: Editor, overrides: Partial<TocElement> = {}): TocElement | null =>
  insertVoidBlock(editor, createTocElement(overrides));

export const withToc = <T extends Editor>(editor: T): T => {
  const {isVoid} = editor;
  editor.isVoid = (element) => (element.type === 'toc' ? true : isVoid(element));
  return editor;
};
