import type {JsonMlNode} from './types';

const escapeText = (str: string): string => str.replace(/[\u00A0-\u9999<>&]/gim, (i) => '&#' + i.charCodeAt(0) + ';');

const escapeAttr = (str: string): string => str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const toHtml = (node: JsonMlNode, tab: string = '', ident: string = ''): string => {
  if (typeof node === 'string') return ident + escapeText(node);
  const [tag, attrs, ...children] = node;
  const childrenLength = children.length;
  const isFragment = !tag;
  const childrenIdent = ident + (isFragment ? '' : tab);
  const doIdent = !!tab;
  let childrenStr = '';
  let textOnlyChildren = true;
  for (let i = 0; i < childrenLength; i++)
    if (typeof children[i] !== 'string') {
      textOnlyChildren = false;
      break;
    }
  if (textOnlyChildren) for (let i = 0; i < childrenLength; i++) childrenStr += escapeText(children[i] as string);
  else
    for (let i = 0; i < childrenLength; i++)
      childrenStr += (doIdent ? (!isFragment || i ? '\n' : '') : '') + toHtml(children[i], tab, childrenIdent);
  if (isFragment) return childrenStr;
  let attrStr = '';
  if (attrs) for (const key in attrs) attrStr += ' ' + key + '="' + escapeAttr(attrs[key] + '') + '"';
  const htmlHead = '<' + tag + attrStr;
  return (
    ident +
    (childrenStr
      ? htmlHead + '>' + childrenStr + (doIdent && !textOnlyChildren ? '\n' + ident : '') + '</' + tag + '>'
      : htmlHead + ' />')
  );
};
