import {Editor, Element as SlateElement, Node, Path, Range, Transforms} from 'slate';
import type {
  BulletedListElement,
  CustomElement,
  UlType,
} from '../types';

const isElement = (node: unknown): node is CustomElement => SlateElement.isElement(node);

export const getActiveUlType = (editor: Editor): UlType | null => {
  const {selection} = editor;
  if (!selection) return null;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && node.type === 'ul',
    mode: 'lowest',
  });
  if (!match) return null;
  const [element] = match as [BulletedListElement, Path];
  return element.ulType ?? 'disc';
};

export const isUlTypeActive = (editor: Editor, ulType: UlType): boolean => getActiveUlType(editor) === ulType;

export const setUlType = (editor: Editor, ulType: UlType): void => {
  Transforms.setNodes(editor, {ulType} as Partial<CustomElement>, {
    match: (node) => isElement(node) && node.type === 'ul',
  });
};
