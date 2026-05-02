import {type Descendant, Text, Element as SlateElement, Node} from 'slate';
import type {CustomElement, SlateEditorDocument} from '../types';

export type OutlineHeadingType = 'title' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface DocumentOutlineItem {
  key: string;
  path: number[];
  type: OutlineHeadingType;
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
}

const HEADING_LEVELS: Record<OutlineHeadingType, DocumentOutlineItem['level']> = {
  title: 0,
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

const isOutlineHeadingType = (type: CustomElement['type']): type is OutlineHeadingType =>
  type === 'h1' ||
  type === 'h2' ||
  type === 'h3' ||
  type === 'h4' ||
  type === 'h5' ||
  type === 'h6' ||
  type === 'title';

const collectDocumentOutline = (nodes: Descendant[], path: number[], outline: DocumentOutlineItem[]): void => {
  nodes.forEach((node, index) => {
    if (Text.isText(node)) return;
    const nodePath = [...path, index];
    if (SlateElement.isElement(node) && isOutlineHeadingType(node.type)) {
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
