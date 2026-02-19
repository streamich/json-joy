import type {SlateElementNode, SlateTextNode} from '../../../types';

export const txt = (text: string, marks?: Record<string, any>): SlateTextNode => ({
  text,
  ...marks,
});

export const p = (attr: Record<string, any>, ...children: (SlateTextNode | SlateElementNode)[]): SlateElementNode => ({
  ...attr,
  type: 'paragraph',
  children: children.length ? children : [{text: ''}],
});

export const blockquote = (attr: Record<string, any>, ...children: SlateElementNode[]): SlateElementNode => ({
  ...attr,
  type: 'blockquote',
  children: children.length ? children : [{text: ''}],
});

export const ul = (...children: SlateElementNode[]): SlateElementNode => ({
  type: 'bulleted_list',
  children: children.length ? children : [{type: 'list_item', children: [{text: ''}]}],
});

export const ol = (order: number = 1, ...children: SlateElementNode[]): SlateElementNode => ({
  type: 'ordered_list',
  order,
  children: children.length ? children : [{type: 'list_item', children: [{text: ''}]}],
});

export const li = (...children: (SlateTextNode | SlateElementNode)[]): SlateElementNode => ({
  type: 'list_item',
  children: children.length ? children : [{text: ''}],
});

export const h1 = (...children: SlateTextNode[]): SlateElementNode => ({
  type: 'heading',
  level: 1,
  children: children.length ? children : [{text: ''}],
});

export const h2 = (...children: SlateTextNode[]): SlateElementNode => ({
  type: 'heading',
  level: 2,
  children: children.length ? children : [{text: ''}],
});

export const h3 = (...children: SlateTextNode[]): SlateElementNode => ({
  type: 'heading',
  level: 3,
  children: children.length ? children : [{text: ''}],
});

export const em = (text: string): SlateTextNode => ({
  text,
  em: true,
});

export const strong = (text: string): SlateTextNode => ({
  text,
  strong: true,
});

export const a = (href: string, text: string): SlateTextNode => ({
  text,
  href,
});
