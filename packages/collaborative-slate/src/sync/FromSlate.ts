import {Anchor} from 'json-joy/lib/json-crdt-extensions/peritext/rga/constants';
import {SliceHeaderShift, SliceStacking} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import type {ViewRange, ViewSlice} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {SlateDocument, SlateDescendantNode, SlateTextNode, SlateElementNode} from '../types';
import type {SliceTypeStep, SliceTypeSteps} from 'json-joy/lib/json-crdt-extensions/peritext';

const isInline = (node: unknown): node is SlateTextNode =>
  typeof node === 'object' && !!node && typeof (node as SlateTextNode).text === 'string';

/**
 * Converts Slate.js state to a {@link ViewRange} flat string with
 * annotation ranges, which is the natural view format for a Peritext model.
 *
 * Usage:
 *
 * ```typescript
 * FromSlate.convert(node);
 * ```
 */
export class FromSlate {
  static readonly convert = (doc: SlateDocument): ViewRange => new FromSlate().convert(doc);

  private text = '';
  private slices: ViewSlice[] = [];

  private conv(node: SlateDescendantNode, path: SliceTypeSteps, nodeDiscriminator: number): void {
    if (!node || typeof node !== 'object') return;
    const start = this.text.length;
    if ('text' in node) {
      const {text, ...tagMap} = node as SlateTextNode;
      this.text += text;
      const tags = Object.keys(tagMap);
      if (tags.length) {
        const end = start + text.length;
        for (const tag of tags) {
          const data = tagMap[tag];
          const dataEmpty = !data || data === true;
          const stacking: SliceStacking = dataEmpty ? SliceStacking.One : SliceStacking.Many;
          const header =
            (stacking << SliceHeaderShift.Stacking) +
            (Anchor.Before << SliceHeaderShift.X1Anchor) +
            (Anchor.After << SliceHeaderShift.X2Anchor);
          const slice: ViewSlice = [header, start, end, tag];
          if (!dataEmpty) slice.push(data);
          this.slices.push(slice);
        }
      }
    } else {
      const element = node as SlateElementNode;
      const {type, children, ...data} = element;
      const step: SliceTypeStep = nodeDiscriminator || data ? [type, nodeDiscriminator, data] : type;
      const length = children?.length ?? 0;
      const hasNoChildren = length === 0;
      const isFirstChildInline = isInline((children as SlateElementNode['children'])?.[0]);
      const doEmitSplitMarker = hasNoChildren || isFirstChildInline;
      if (doEmitSplitMarker) {
        this.text += '\n';
        const header =
          (SliceStacking.Marker << SliceHeaderShift.Stacking) +
          (Anchor.Before << SliceHeaderShift.X1Anchor) +
          (Anchor.Before << SliceHeaderShift.X2Anchor);
        const slice: ViewSlice = [header, start, start, [...path, step]];
        this.slices.push(slice);
      }
      if (length > 0) this.cont([...path, step], children!);
    }
  }

  private cont(path: SliceTypeSteps, content: SlateDescendantNode[]): void {
    let prevTag: string = '';
    let discriminator: number = 0;
    const length = content.length;
    for (let i = 0; i < length; i++) {
      const child = content[i];
      const tag = child.type as string;
      discriminator = tag === prevTag ? discriminator + 1 : 0;
      this.conv(child, path, discriminator);
      prevTag = tag;
    }
  }

  public convert(node: SlateDocument): ViewRange {
    let length = 0;
    if (node && (length = node.length) > 0) this.cont([], node);
    return [this.text, 0, this.slices] as ViewRange;
  }
}
