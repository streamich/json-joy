import {html as _html} from 'very-small-parser/lib/html';
import {fromHast as _fromHast} from 'very-small-parser/lib/html/json-ml/fromHast';
import {SliceTypeName} from '../slice';
import {SliceStacking, SliceHeaderShift} from '../slice/constants';
import {Anchor} from '../rga/constants';
import {toPlainText} from 'very-small-parser/lib/toPlainText';
import {walk} from 'very-small-parser/lib/html/json-ml/walk';
import {fromBase64} from '@jsonjoy.com/base64/lib/fromBase64';
import type {JsonMlNode} from 'very-small-parser/lib/html/json-ml/types';
import type {THtmlToken} from 'very-small-parser/lib/html/types';
import type {PeritextMlNode} from '../block/types';
import type {SliceRegistry} from '../registry/SliceRegistry';
import type {ViewStyle, ViewRange, ViewSlice} from '../editor/types';
import type {ClipboardData} from './export-html';

/**
 * @todo Implement HTML normalization function, ensure that:
 *
 * - <blockquote> and <p> nodes are treated correctly, especially when sole node
 *   is nested.
 * - list nodes are treated correctly.
 * - <svg> nodes are converted to Base64 and inlined as data URL images.
 */

/**
 * Flattens a {@link PeritextMlNode} tree structure into a {@link ViewRange}
 * flat string with annotation ranges.
 */
class ViewRangeBuilder {
  private text = '';
  private slices: ViewSlice[] = [];

  private build0(node: PeritextMlNode, path: (string | number)[]): boolean {
    const skipWhitespace = path.length < 1;
    if (typeof node === 'string') {
      if (skipWhitespace && !node.trim()) return false;
      this.text += node;
      return false;
    }
    const [type, attr] = node;
    const start = this.text.length;
    const length = node.length;
    const inline = !!attr?.inline;
    const hasType = type === 0 || !!type;
    const firstChild = node[2] as PeritextMlNode;
    const isFirstChildInline = firstChild && (typeof firstChild === 'string' || firstChild[1]?.inline);
    if (hasType && !inline && isFirstChildInline) {
      this.text += '\n';
      const header =
        (SliceStacking.Marker << SliceHeaderShift.Stacking) +
        (Anchor.Before << SliceHeaderShift.X1Anchor) +
        (Anchor.Before << SliceHeaderShift.X2Anchor);
      const slice: ViewSlice = [header, start, start, path.length ? [...path, type] : type];
      const data = attr?.data;
      if (data) slice.push(data);
      this.slices.push(slice);
    }
    for (let i = 2; i < length; i++) this.build0(node[i] as PeritextMlNode, type === '' ? path : [...path, type]);
    if (hasType && inline) {
      let end: number = 0,
        header: number = 0;
      if (inline) {
        end = this.text.length;
        const stacking: SliceStacking = attr?.stacking ?? SliceStacking.Many;
        header =
          (stacking << SliceHeaderShift.Stacking) +
          (Anchor.Before << SliceHeaderShift.X1Anchor) +
          (Anchor.After << SliceHeaderShift.X2Anchor);
        const slice: ViewSlice = [header, start, end, type];
        const data = attr?.data;
        if (data) slice.push(data);
        this.slices.push(slice);
      }
    }
    return false;
  }

  public build(node: PeritextMlNode): ViewRange {
    this.build0(node, []);
    const view: ViewRange = [this.text, 0, this.slices];
    return view;
  }
}

export const toViewRange = (node: PeritextMlNode): ViewRange => new ViewRangeBuilder().build(node);

// HTML elements to completely ignore.
const IGNORE_TAGS = new Set<string>(['meta', 'style', 'script', 'link', 'head']);

// HTML elements to rewrite as different block elements.
const BLOCK_TAGS_REWRITE = new Map<string, string>([
  ['html', ''],
  ['body', ''],
  ['div', ''],
]);

// HTML elements to rewrite as different inline elements.
const INLINE_TAGS_REWRITE = new Map<string, string>([['span', '']]);

export const fromJsonMl = (jsonml: JsonMlNode, registry: SliceRegistry): PeritextMlNode => {
  if (typeof jsonml === 'string') return jsonml;
  let tag = jsonml[0];
  let inlineHtmlTag = false;
  if (typeof tag === 'string') {
    tag = tag.toLowerCase();
    if (IGNORE_TAGS.has(tag)) return '';
    const mapped = BLOCK_TAGS_REWRITE.get(tag);
    if (mapped !== undefined) tag = mapped;
    else {
      const mapped = INLINE_TAGS_REWRITE.get(tag);
      if (mapped !== undefined) {
        tag = mapped;
        inlineHtmlTag = true;
      }
    }
  }
  const length = jsonml.length;
  const node: PeritextMlNode = [tag, null];
  for (let i = 2; i < length; i++) {
    const peritextNode = fromJsonMl(jsonml[i] as JsonMlNode, registry);
    if (!peritextNode) continue;
    node.push(peritextNode);
  }
  const res = registry.fromHtml(jsonml);
  if (res) {
    node[0] = res[0];
    node[1] = res[1];
  } else {
    if (typeof tag === 'string') node[0] = SliceTypeName[tag as any] ?? tag;
    const attr = jsonml[1] || {};
    let data = null;
    if (attr['data-attr'] !== void 0) {
      try {
        data = JSON.parse(attr['data-attr']);
      } catch {}
    }
    const inline = inlineHtmlTag || attr['data-inline'] === 'true';
    if (data || inline) node[1] = {data, inline};
  }
  if (typeof node[0] === 'number' && node[0] < 0) (node[1] ||= {}).inline = true;
  if (node.length < 3 && (node[1] || {}).inline) return '';
  return node;
};

export const fromHast = (hast: THtmlToken, registry: SliceRegistry): PeritextMlNode => {
  const jsonml = _fromHast(hast);
  return fromJsonMl(jsonml, registry);
};

export const fromHtml = (html: string, registry: SliceRegistry): PeritextMlNode => {
  const hast = _html.parsef(html);
  return fromHast(hast, registry);
};

export const htmlToHast = (html: string): THtmlToken => _html.parsef(html);

export const textFromHtml = (html: string): string => {
  const hast = _html.parsef(html);
  return toPlainText(hast);
};

const getExportData = (html: string): [jsonml: undefined | JsonMlNode, exportData?: ClipboardData] => {
  const attrName = 'data-json-joy-peritext';
  const maybeHasPeritextExport = html.includes(attrName);
  const hast = _html.parsef(html);
  const jsonml = _fromHast(hast);
  if (maybeHasPeritextExport) {
    const iterator = walk(jsonml);
    let node: JsonMlNode | undefined;
    while ((node = iterator())) {
      if (node && typeof node === 'object') {
        const [, attr] = node;
        if (attr?.[attrName]) {
          const jsonBase64 = attr[attrName];
          const buffer = fromBase64(jsonBase64);
          const json = new TextDecoder().decode(buffer);
          const data: ClipboardData = JSON.parse(json);
          return [void 0, data];
        }
      }
    }
  }
  return [jsonml];
};

export const importHtml = (html: string, registry: SliceRegistry): [view?: ViewRange, style?: ViewStyle[]] => {
  const [jsonml, data] = getExportData(html);
  if (data?.style) return [void 0, data.style];
  if (data?.view) return [data.view];
  const node = fromJsonMl(jsonml!, registry);
  return [toViewRange(node)];
};

export const importStyle = (html: string): ViewStyle[] | undefined => {
  const [, data] = getExportData(html);
  return data?.style;
};
