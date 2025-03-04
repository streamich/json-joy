import {html as _html} from 'very-small-parser/lib/html';
import {fromHast as _fromHast} from 'very-small-parser/lib/html/json-ml/fromHast';
import {SliceTypeName} from '../slice';
import {registry as defaultRegistry} from '../registry/registry';
import {SliceBehavior, SliceHeaderShift} from '../slice/constants';
import {Anchor} from '../rga/constants';
import {toPlainText} from 'very-small-parser/lib/toPlainText';
import type {JsonMlNode} from 'very-small-parser/lib/html/json-ml/types';
import type {THtmlToken} from 'very-small-parser/lib/html/types';
import type {PeritextMlNode} from '../block/types';
import type {SliceRegistry} from '../registry/SliceRegistry';
import type {ViewRange, ViewSlice} from '../editor/types';

/**
 * Flattens a {@link PeritextMlNode} tree structure into a {@link ViewRange}
 * flat string with annotation ranges.
 */
class ViewRangeBuilder {
  private text = '';
  private slices: ViewSlice[] = [];

  private build0(node: PeritextMlNode, depth = 0): void {
    const skipWhitespace = depth < 2;
    if (typeof node === 'string') {
      if (skipWhitespace && !node.trim()) return;
      this.text += node;
      return;
    }
    const [type, attr] = node;
    const start = this.text.length;
    const length = node.length;
    const inline = !!attr?.inline;
    if (!!type || type === 0) {
      let end: number = 0,
        header: number = 0;
      if (!inline) {
        this.text += '\n';
        end = start;
        header =
          (SliceBehavior.Marker << SliceHeaderShift.Behavior) +
          (Anchor.Before << SliceHeaderShift.X1Anchor) +
          (Anchor.Before << SliceHeaderShift.X2Anchor);
        const slice: ViewSlice = [header, start, end, type];
        const data = attr?.data;
        if (data) slice.push(data);
        this.slices.push(slice);
      }
    }
    for (let i = 2; i < length; i++) this.build0(node[i] as PeritextMlNode, depth + 1);
    if (!!type || type === 0) {
      let end: number = 0,
        header: number = 0;
      if (inline) {
        end = this.text.length;
        const behavior: SliceBehavior = attr?.behavior ?? SliceBehavior.Many;
        header =
          (behavior << SliceHeaderShift.Behavior) +
          (Anchor.Before << SliceHeaderShift.X1Anchor) +
          (Anchor.After << SliceHeaderShift.X2Anchor);
        const slice: ViewSlice = [header, start, end, type];
        const data = attr?.data;
        if (data) slice.push(data);
        this.slices.push(slice);
      }
    }
  }

  public build(node: PeritextMlNode): ViewRange {
    this.build0(node);
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
const INLINE_TAGS_REWRITE = new Map<string, string>([
  ['span', ''],
]);

export const fromJsonMl = (jsonml: JsonMlNode, registry: SliceRegistry = defaultRegistry): PeritextMlNode => {
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
    node[0] = SliceTypeName[tag as any] ?? tag;
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
  if (typeof node[0] === 'number' && node[0] < 0) {
    const attr = node[1] || {};
    attr.inline = true;
    node[1] = attr;
  }
  if (node.length < 3) {
    const attr = node[1] || {};
    if (attr.inline) return '';
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

export const textFromHtml = (html: string): string => {
  const hast = _html.parsef(html);
  return toPlainText(hast);
};
