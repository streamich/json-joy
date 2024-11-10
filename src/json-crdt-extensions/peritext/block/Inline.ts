import {printTree} from 'tree-dump/lib/printTree';
import type {OverlayPoint} from '../overlay/OverlayPoint';
import {stringify} from '../../../json-text/stringify';
import {SliceBehavior, CommonSliceType} from '../slice/constants';
import {Range} from '../rga/Range';
import {ChunkSlice} from '../util/ChunkSlice';
import {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {Cursor} from '../editor/Cursor';
import {hashId} from '../../../json-crdt/hash';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {Printable} from 'tree-dump/lib/types';
import type {PathStep} from '@jsonjoy.com/json-pointer';
import type {Peritext} from '../Peritext';
import type {Slice} from '../slice/types';

/**
 * @todo Make sure these inline attributes can handle the cursor which ends
 *     with attaching to the start of the next character.
 */

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
  public static create(txt: Peritext, start: OverlayPoint, end: OverlayPoint) {
    const texts: ChunkSlice[] = [];
    txt.overlay.chunkSlices0(undefined, start, end, (chunk, off, len) => {
      if (txt.overlay.isMarker(chunk.id)) return;
      texts.push(new ChunkSlice(chunk, off, len));
    });
    return new Inline(txt.str, start, end, texts);
  }

  constructor(
    rga: AbstractRga<string>,
    public start: OverlayPoint,
    public end: OverlayPoint,

    /**
     * @todo PERF: for performance reasons, we should consider not passing in
     * this array. Maybe pass in just the initial chunk and the offset. However,
     * maybe even that is not necessary, as the `.start` point should have
     * its chunk cached, or will have it cached after the first access.
     */
    public readonly texts: ChunkSlice[],
  ) {
    super(rga, start, end);
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
    const chunkSlice = this.texts[0];
    if (!chunkSlice) return -1;
    const chunk = chunkSlice.chunk;
    const pos = this.rga.pos(chunk);
    return pos + chunkSlice.off;
  }

  protected createAttr(slice: Slice): InlineAttr {
    return !slice.start.cmp(slice.end)
      ? !slice.start.cmp(this.start)
        ? new InlineAttrStartPoint(slice)
        : new InlineAttrEndPoint(slice)
      : !this.start.cmp(slice.start)
        ? !this.end.cmp(slice.end)
          ? new InlineAttrContained(slice)
          : new InlineAttrStart(slice)
        : !this.end.cmp(slice.end)
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
    const point1 = this.start as OverlayPoint;
    const point2 = this.end as OverlayPoint;
    const slices1 = point1.layers;
    const slices2 = point1.markers;
    const slices3 = point2.isAbsEnd() ? point2.markers : [];
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
            const stack: InlineAttrStack = attr[CommonSliceType.Cursor] ?? (attr[CommonSliceType.Cursor] = []);
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
    return !!this.attr()[CommonSliceType.Cursor];
  }

  /** @todo Make this return a list of cursors. */
  public cursorStart(): Cursor | undefined {
    const attributes = this.attr();
    const stack = attributes[CommonSliceType.Cursor];
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
    const stack = attributes[CommonSliceType.Cursor];
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
    const stack = attributes[CommonSliceType.Cursor];
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

  public text(): string {
    const str = super.text();
    return this.start instanceof MarkerOverlayPoint ? str.slice(1) : str;
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    return 'Inline';
  }

  public toString(tab: string = ''): string {
    const str = this.text();
    const truncate = str.length > 32;
    const text = JSON.stringify(truncate ? str.slice(0, 32) : str) + (truncate ? ' …' : '');
    const startFormatted = this.start.toString(tab, true);
    const range =
      this.start.cmp(this.end) === 0 ? startFormatted : `${startFormatted} ↔ ${this.end.toString(tab, true)}`;
    const header = `Inline ${range} ${text}`;
    const attr = this.attr();
    const attrKeys = Object.keys(attr);
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
                  let keyFormatted: string = key;
                  const numKey = Number(key);
                  if (numKey + '' === key && Math.abs(numKey) <= 64 && CommonSliceType[numKey])
                    keyFormatted = '<' + CommonSliceType[numKey] + '>';
                  return keyFormatted +
                    ' = ' +
                    stringify(
                      attr[key].map((attr) =>
                        attr.slice instanceof Cursor ? [attr.slice.type, attr.slice.data()] : attr.slice.data(),
                      ),
                    );
                }),
              ),
        !this.texts.length
          ? null
          : (tab) =>
              'texts' +
              printTree(
                tab,
                this.texts.map((text) => (tab) => text.toString(tab)),
              ),
      ])
    );
  }
}
