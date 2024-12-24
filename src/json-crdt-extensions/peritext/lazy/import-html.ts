import {html as _html} from 'very-small-parser/lib/html';
import {fromHast as _fromHast} from 'very-small-parser/lib/html/json-ml/fromHast';
import {SliceTypeName} from '../slice';
import type {JsonMlNode} from 'very-small-parser/lib/html/json-ml/types';
import type {THtmlToken} from 'very-small-parser/lib/html/types';
import type {PeritextMlNode} from '../block/types';

export const fromJsonMl = (jsonml: JsonMlNode): PeritextMlNode => {
  if (typeof jsonml === 'string') return jsonml;
  const [tag, attr = {}, ...children] = jsonml;
  const type = SliceTypeName[tag as any] ?? tag;
  const data = attr['data-attr'] !== void 0 ? JSON.parse(attr['data-attr']) : null;
  // console.log('tag', tag);
  // const namedTag = tag === '' ? tag : tag;
  // const peritextTag = namedTag ?? (attr?.inline ? 'span' : 'div');
  // const peritextAttr = attr && attr['data-attr'] !== void 0 ? {data: JSON.parse(attr['data-attr'])} : null;
  const peritextNode: PeritextMlNode = [type, {}];
  const length = children.length;
  for (let i = 0; i < length; i++) peritextNode.push(fromJsonMl(children[i]));
  return peritextNode;
};

export const fromHast = (hast: THtmlToken): PeritextMlNode => {
  const jsonml = _fromHast(hast);
  return fromJsonMl(jsonml);
};

export const fromHtml = (html: string): PeritextMlNode => {
  const hast = _html.parsef(html);
  return fromHast(hast);
};
