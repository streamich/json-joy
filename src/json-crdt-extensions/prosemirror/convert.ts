import {Anchor} from "../peritext/rga/constants";
import {SliceHeaderShift, SliceStacking} from "../peritext/slice/constants";
import type {ViewRange, ViewSlice} from "../peritext/editor/types";
import type {ProseMirrorNode, ProseMirrorTextNode} from "./types";

export class NodeToViewRange {
  static readonly convert = (node: ProseMirrorNode): ViewRange => {
    const builder = new NodeToViewRange();
    return builder.convert(node);
  };

  private text = '';
  private slices: ViewSlice[] = [];

  private conv(node: ProseMirrorNode, path: string[]): void {
    const text = this.text;
    const start = text.length;
    let inlineText: string = '';
    if (('text' in node) && (inlineText = (node as ProseMirrorTextNode).text || '')) {
      this.text += inlineText;
    } else {
      const type = node.type.name;
      const content = node.content?.content;
      let length = 0;
      if (content && ((length = content.length) > 0)) {
        const isFirstChildInline = content[0].type.name === 'text';
        const insertPendingBlockSplit = isFirstChildInline && path.length > 0;
        if (insertPendingBlockSplit) {
          this.text += '\n';
          const header =
            (SliceStacking.Marker << SliceHeaderShift.Stacking) +
            (Anchor.Before << SliceHeaderShift.X1Anchor) +
            (Anchor.Before << SliceHeaderShift.X2Anchor);
          const slice: ViewSlice = [header, start, start, [...path, type]];
          const data = node.attrs?.data;
          if (data) slice.push(data);
          this.slices.push(slice);
        }
        for (let i = 0; i < length; i++) {
          const child = content[i];
          this.conv(child, [...path, type]);
        }
      }
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

  public convert(node: ProseMirrorNode): ViewRange {
    this.conv(node, []);
    const view: ViewRange = [this.text, 0, this.slices];
    return view;
  }
}
