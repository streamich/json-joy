import {Anchor} from "../peritext/rga/constants";
import {SliceHeaderShift, SliceStacking} from "../peritext/slice/constants";
import type {ViewRange, ViewSlice} from "../peritext/editor/types";
import type {ProseMirrorFragment, ProseMirrorNode, ProseMirrorTextNode} from "./types";
import type {SliceTypeStep, SliceTypeSteps} from "../peritext";

/**
 * Converts ProseMirror raw nodes to a {@link ViewRange} flat string with
 * annotation ranges, which is the natural view format for a Peritext model.
 * 
 * Usage:
 * 
 * ```typescript
 * NodeToViewRange.convert(node);
 * ```
 */
export class NodeToViewRange {
  static readonly convert = (node: ProseMirrorNode): ViewRange =>
    new NodeToViewRange().convert(node);

  private text = '';
  private slices: ViewSlice[] = [];

  private conv(node: ProseMirrorNode, path: SliceTypeSteps, nodeDiscriminator: number): void {
    const text = this.text;
    const start = text.length;
    let inlineText: string = '';
    if (('text' in node) && (inlineText = (node as ProseMirrorTextNode).text || '')) {
      this.text += inlineText;
    } else {
      const type = node.type.name;
      const content = node.content?.content;
      const step: SliceTypeStep = nodeDiscriminator ? [type, nodeDiscriminator] : type;
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
        const data = node.attrs?.data;
        if (data) slice.push(data);
        this.slices.push(slice);
      }
      if (length > 0) this.cont([...path, step], content!);
    }
    const marks = node.marks;
    let length = 0;
    if (marks && ((length = marks.length) > 0)) {
      const end = start + inlineText.length;
      for (let i = 0; i < length; i++) {
        const mark = marks[i];
        const type = mark.type.name;
        const data = mark.attrs;
        let dataEmpty = true;
        for (const _ in data) { dataEmpty = false; break; }
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

  private cont(path: SliceTypeSteps, content: ProseMirrorFragment['content']): void {
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

  public convert(node: ProseMirrorNode): ViewRange {
    const content = node.content?.content;
    let length = 0;
    if (content && ((length = content.length) > 0)) this.cont([], content);
    const view: ViewRange = [this.text, 0, this.slices];
    return view;
  }
}
