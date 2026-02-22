import {Anchor} from 'json-joy/lib/json-crdt-extensions/peritext/rga/constants';
import {SliceHeaderShift, SliceStacking} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import type {ViewRange, ViewSlice} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {SliceTypeStep, SliceTypeSteps} from 'json-joy/lib/json-crdt-extensions/peritext';
import type {PmFragment, PmNode, PmTextNode} from '../types';

/**
 * Converts ProseMirror raw nodes to a {@link ViewRange} flat string with
 * annotation ranges, which is the natural view format for a Peritext model.
 *
 * Usage:
 *
 * ```typescript
 * FromPm.convert(node);
 * ```
 */
export class FromPm {
  static readonly convert = (node: PmNode): ViewRange => new FromPm().convert(node);

  private text = '';
  private slices: ViewSlice[] = [];

  private conv(node: PmNode, path: SliceTypeSteps, nodeDiscriminator: number): void {
    const text = this.text;
    const start = text.length;
    let inlineText: string = '';
    const type = node.type.name;
    if (type === 'text' && (inlineText = (node as PmTextNode).text || '')) {
      this.text += inlineText;
    } else {
      const content = node.content?.content;
      const data = node.attrs;
      const step: SliceTypeStep = nodeDiscriminator || data ? [type, nodeDiscriminator, data] : type;
      const length = content?.length ?? 0;
      const hasNoChildren = length === 0;
      const isFirstChildInline = content?.[0]?.type.name === 'text';
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
      if (length > 0) this.cont([...path, step], content!);
    }
    const marks = node.marks;
    let length = 0;
    if (marks && (length = marks.length) > 0) {
      const end = start + inlineText.length;
      for (let i = 0; i < length; i++) {
        const mark = marks[i];
        const type = mark.type.name;
        const data = mark.attrs;
        let dataEmpty = true;
        for (const _ in data) {
          dataEmpty = false;
          break;
        }
        const stacking: SliceStacking = dataEmpty ? SliceStacking.One : SliceStacking.Many;
        const header =
          (stacking << SliceHeaderShift.Stacking) +
          (Anchor.Before << SliceHeaderShift.X1Anchor) +
          (Anchor.After << SliceHeaderShift.X2Anchor);
        const slice: ViewSlice = [header, start, end, type];
        if (!dataEmpty) slice.push(data);
        this.slices.push(slice);
      }
    }
  }

  private cont(path: SliceTypeSteps, content: PmFragment['content']): void {
    let prevTag: string = '';
    let discriminator: number = 0;
    const length = content.length;
    for (let i = 0; i < length; i++) {
      const child = content[i];
      const tag = child.type.name;
      discriminator = tag === prevTag ? discriminator + 1 : 0;
      this.conv(child, path, discriminator);
      prevTag = tag;
    }
  }

  public convert(node: PmNode): ViewRange {
    const content = node.content?.content;
    let length = 0;
    if (content && (length = content.length) > 0) this.cont([], content);
    const view: ViewRange = [this.text, 0, this.slices];
    return view;
  }
}
