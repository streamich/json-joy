import {printTree} from 'tree-dump/lib/printTree';
import {stringify} from '../../../json-text/stringify';
import {SliceBehavior, SliceTypeName} from '../slice/constants';
import {Range} from '../rga/Range';
import {ChunkSlice} from '../util/ChunkSlice';
import {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {Cursor} from '../editor/Cursor';
import {hashId} from '../../../json-crdt/hash';
import {formatType} from '../slice/util';
import {Point} from '../rga/Point';
import type {OverlayPoint} from '../overlay/OverlayPoint';
import type {Printable} from 'tree-dump/lib/types';
import type {PathStep} from '@jsonjoy.com/json-pointer';
import type {Peritext} from '../Peritext';
import type {Slice} from '../slice/types';
import type {JsonMlNode} from '../../../json-ml';

/** The attribute started before this inline and ends after this inline. */
export class InlineAttrPassing {
  constructor(public slice: Slice) {}
}

/** The attribute starts at the beginning of this inline. */
export class InlineAttrStart {
  constructor(public slice: Slice) {}
}

/** The attribute ends at the end of this inline. */
export class InlineAttrEnd {
  constructor(public slice: Slice) {}
}

/** The attribute starts and ends in this inline, exactly contains it. */
export class InlineAttrContained {
  constructor(public slice: Slice) {}
}

/** The attribute is collapsed at start of this inline. */
export class InlineAttrStartPoint {
  constructor(public slice: Slice) {}
}

/** The attribute is collapsed at end of this inline. */
export class InlineAttrEndPoint {
  constructor(public slice: Slice) {}
}

export type InlineAttr =
  | InlineAttrPassing
  | InlineAttrStart
  | InlineAttrEnd
  | InlineAttrContained
  | InlineAttrStartPoint
  | InlineAttrEndPoint;
export type InlineAttrStack = InlineAttr[];

/** @todo Make this a Map. */
export type InlineAttrs = Record<string | number, InlineAttrStack>;

/**
 * The `Inline` class represents a range of inline text within a block, which
 * has the same annotations and formatting for all of its text contents, i.e.
 * its text contents can be rendered as a single (`<span>`) element. However,
 * the text contents might still be composed of multiple {@link ChunkSlice}s,
 * which are the smallest units of text and need to be concatenated to get the
 * full text content of the inline.
 */
export class Inline extends Range implements Printable {
  constructor(
    public readonly txt: Peritext,
    public readonly p1: OverlayPoint,
    public readonly p2: OverlayPoint,
    start: Point,
    end: Point,
  ) {
    super(txt.str, start, end);
  }

  /**
   * @returns A stable unique identifier of this *inline* within a list of other
   *     inlines of the parent block. Can be used for UI libraries to track the
   *     identity of the inline across renders.
   */
  public key(): number {
    const start = this.start;
    return hashId(start.id) + (start.anchor ? 0 : 1);
  }

  /**
   * @returns The position of the inline within the text.
   */
  public pos(): number {
    const chunkSlice = this.texts(1)[0];
    if (!chunkSlice) return -1;
    const chunk = chunkSlice.chunk;
    const pos = this.rga.pos(chunk);
    return pos + chunkSlice.off;
  }

  protected createAttr(slice: Slice): InlineAttr {
    const p1 = this.p1;
    const p2 = this.p2;
    return !slice.start.cmp(slice.end)
      ? !slice.start.cmp(p1)
        ? new InlineAttrStartPoint(slice)
        : new InlineAttrEndPoint(slice)
      : !p1.cmp(slice.start)
        ? !p2.cmp(slice.end)
          ? new InlineAttrContained(slice)
          : new InlineAttrStart(slice)
        : !p2.cmp(slice.end)
          ? new InlineAttrEnd(slice)
          : new InlineAttrPassing(slice);
  }

  private _attr: InlineAttrs | undefined;

  /**
   * @returns Returns the attributes of the inline, which are the slice
   *     annotations and formatting applied to the inline.
   *
   * @todo Rename to `.stat()`.
   * @todo Create a more efficient way to compute inline stats, separate: (1)
   *     boolean flags, (2) cursor, (3) other attributes.
   */
  public attr(): InlineAttrs {
    if (this._attr) return this._attr;
    const attr: InlineAttrs = (this._attr = {});
    const p1 = this.p1 as OverlayPoint;
    const p2 = this.p2 as OverlayPoint;
    const slices1 = p1.layers;
    const slices2 = p1.markers;
    const slices3 = p2.isAbsEnd() ? p2.markers : [];
    const length1 = slices1.length;
    const length2 = slices2.length;
    const length3 = slices3.length;
    const length12 = length1 + length2;
    const length123 = length12 + length3;
    for (let i = 0; i < length123; i++) {
      const slice = i >= length12 ? slices3[i - length12] : i >= length1 ? slices2[i - length1] : slices1[i];
      if (slice instanceof Range) {
        const type = slice.type as PathStep;
        switch (slice.behavior) {
          case SliceBehavior.Cursor: {
            const stack: InlineAttrStack = attr[SliceTypeName.Cursor] ?? (attr[SliceTypeName.Cursor] = []);
            stack.push(this.createAttr(slice));
            break;
          }
          case SliceBehavior.Many: {
            const stack: InlineAttrStack = attr[type] ?? (attr[type] = []);
            stack.push(this.createAttr(slice));
            break;
          }
          case SliceBehavior.One: {
            attr[type] = [this.createAttr(slice)];
            break;
          }
          case SliceBehavior.Erase: {
            delete attr[type];
            break;
          }
        }
      }
    }
    return attr;
  }

  public hasCursor(): boolean {
    return !!this.attr()[SliceTypeName.Cursor];
  }

  /** @todo Make this return a list of cursors. */
  public cursorStart(): Cursor | undefined {
    const attributes = this.attr();
    const stack = attributes[SliceTypeName.Cursor];
    if (!stack) return;
    const attribute = stack[0];
    if (
      attribute instanceof InlineAttrStart ||
      attribute instanceof InlineAttrContained ||
      attribute instanceof InlineAttrStartPoint
    ) {
      const slice = attribute.slice;
      return slice instanceof Cursor ? slice : void 0;
    }
    return;
  }

  public cursorEnd(): Cursor | undefined {
    const attributes = this.attr();
    const stack = attributes[SliceTypeName.Cursor];
    if (!stack) return;
    const attribute = stack[0];
    if (
      attribute instanceof InlineAttrEnd ||
      attribute instanceof InlineAttrContained ||
      attribute instanceof InlineAttrEndPoint
    ) {
      const slice = attribute.slice;
      return slice instanceof Cursor ? slice : void 0;
    }
    return;
  }

  /**
   * Returns a 2-tuple if this inline is part of a selection. The 2-tuple sides
   * specify how selection ends on each side. Empty string means the selection
   * continues past that edge, `focus` and `anchor` specify that the edge
   * is either a focus caret or an anchor, respectively.
   *
   * @returns Selection state of this inline.
   */
  public selection(): undefined | [left: 'anchor' | 'focus' | '', right: 'anchor' | 'focus' | ''] {
    const attributes = this.attr();
    const stack = attributes[SliceTypeName.Cursor];
    if (!stack) return;
    const attribute = stack[0];
    const cursor = attribute.slice;
    if (!(cursor instanceof Cursor)) return;
    if (attribute instanceof InlineAttrPassing) return ['', ''];
    if (attribute instanceof InlineAttrStart) return [cursor.isStartFocused() ? 'focus' : 'anchor', ''];
    if (attribute instanceof InlineAttrEnd) return ['', cursor.isEndFocused() ? 'focus' : 'anchor'];
    if (attribute instanceof InlineAttrContained)
      return cursor.isStartFocused() ? ['focus', 'anchor'] : ['anchor', 'focus'];
    return;
  }

  public texts(limit: number = 1e6): ChunkSlice[] {
    const texts: ChunkSlice[] = [];
    const txt = this.txt;
    const overlay = txt.overlay;
    let cnt = 0;
    overlay.chunkSlices0(this.start.chunk(), this.start, this.end, (chunk, off, len): boolean | void => {
      if (overlay.isMarker(chunk.id)) return;
      cnt++;
      texts.push(new ChunkSlice(chunk, off, len));
      if (cnt === limit) return true;
    });
    return texts;
  }

  public text(): string {
    const str = super.text();
    return this.p1 instanceof MarkerOverlayPoint ? str.slice(1) : str;
  }

  // ------------------------------------------------------------------- export

  toJsonMl(): JsonMlNode {
    throw new Error('not implemented');
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    return 'Inline';
  }

  public toString(tab: string = ''): string {
    const str = this.text();
    const truncate = str.length > 32;
    const text = JSON.stringify(truncate ? str.slice(0, 32) : str) + (truncate ? ' …' : '');
    const startFormatted = this.p1.toString(tab, true);
    const range =
      this.p1.cmp(this.end) === 0 ? startFormatted : `${startFormatted} ↔ ${this.end.toString(tab, true)}`;
    const header = `Inline ${range} ${text}`;
    const attr = this.attr();
    const attrKeys = Object.keys(attr);
    const texts = this.texts();
    return (
      header +
      printTree(tab, [
        !attrKeys.length
          ? null
          : (tab) =>
              'attributes' +
              printTree(
                tab,
                attrKeys.map((key) => () => {
                  return (
                    formatType(key) +
                    ' = ' +
                    stringify(
                      attr[key].map((attr) =>
                        attr.slice instanceof Cursor ? [attr.slice.type, attr.slice.data()] : attr.slice.data(),
                      ),
                    )
                  );
                }),
              ),
        !texts.length
          ? null
          : (tab) =>
              'texts' +
              printTree(
                tab,
                this.texts().map((text) => (tab) => text.toString(tab)),
              ),
      ])
    );
  }
}
