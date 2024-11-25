import type {JsonMlNode} from './types';

const escapeText = (str: string): string => str.replace(/[\u00A0-\u9999<>\&]/gim, (i) => '&#' + i.charCodeAt(0) + ';');

const escapeAttr = (str: string): string => str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const toHtml = (node: JsonMlNode): string => {
  if (typeof node === 'string') return escapeText(node);
  const [tag, attrs, ...children] = node;
  const childrenLength = children.length;
  let attrStr = '';
  let childrenStr = '';
  for (let i = 0; i < childrenLength; i++) childrenStr += toHtml(children[i]);
  if (!tag) return childrenStr;
  if (attrs) for (const key in attrs) attrStr += ' ' + key + '="' + escapeAttr(attrs[key]) + '"';
  return '<' + tag + attrStr + '>' + childrenStr + '</' + tag + '>';
};
