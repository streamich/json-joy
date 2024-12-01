import type {JsonMlNode} from './types';

const escapeText = (str: string): string => str.replace(/[\u00A0-\u9999<>\&]/gim, (i) => '&#' + i.charCodeAt(0) + ';');

const escapeAttr = (str: string): string => str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const toHtml = (node: JsonMlNode, tab: string = '', ident: string = ''): string => {
  if (typeof node === 'string') return ident + escapeText(node);
  const [tag, attrs, ...children] = node;
  const childrenLength = children.length;
  let attrStr = '';
  let childrenStr = '';
  const childrenIdent = ident + tab;
  for (let i = 0; i < childrenLength; i++) childrenStr += toHtml(children[i], tab, childrenIdent) + (tab ? '\n' : '');
  if (!tag) return childrenStr;
  if (attrs) for (const key in attrs) attrStr += ' ' + key + '="' + escapeAttr(attrs[key] + '') + '"';
  const htmlHead = '<' + tag + attrStr;
  return ident +
    (childrenStr ? (htmlHead + '>' + (tab ? '\n' : '') + childrenStr + ident + '</' + tag + '>') : htmlHead + ' />');
};
