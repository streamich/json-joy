import {html as _html} from 'very-small-parser/lib/html';
import {fromHast as _fromHast} from 'very-small-parser/lib/html/json-ml/fromHast';
import {SliceTypeName} from '../slice';
import {registry as defaultRegistry} from '../registry/registry';
import type {JsonMlNode} from 'very-small-parser/lib/html/json-ml/types';
import type {THtmlToken} from 'very-small-parser/lib/html/types';
import type {PeritextMlNode} from '../block/types';
import type {SliceRegistry} from '../registry/SliceRegistry';

export const fromJsonMl = (jsonml: JsonMlNode, registry: SliceRegistry = defaultRegistry): PeritextMlNode => {
  if (typeof jsonml === 'string') return jsonml;
  const tag = jsonml[0];
  const length = jsonml.length;
  const node: PeritextMlNode = [tag, null];
  for (let i = 2; i < length; i++) node.push(fromJsonMl(jsonml[i] as JsonMlNode, registry));
  const res = registry.fromHtml(jsonml);
  if (res) {
    node[0] = res[0];
    node[1] = res[1];
  } else {
    node[0] = SliceTypeName[tag as any] ?? tag;
    const attr = jsonml[1] || {};
    const data = attr['data-attr'] !== void 0 ? JSON.parse(attr['data-attr']) : null;
    const inline = attr['data-inline'] === 'true';
    if (data || inline) node[1] = {data, inline};
  }
  return node;
};

export const fromHast = (hast: THtmlToken, registry?: SliceRegistry): PeritextMlNode => {
  const jsonml = _fromHast(hast);
  return fromJsonMl(jsonml, registry);
};

export const fromHtml = (html: string, registry?: SliceRegistry): PeritextMlNode => {
  const hast = _html.parsef(html);
  return fromHast(hast, registry);
};
