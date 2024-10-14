import {printTree} from 'tree-dump/lib/printTree';
import {OverlayPoint} from '../overlay/OverlayPoint';
import {stringify} from '../../../json-text/stringify';
import {SliceBehavior, SliceTypes} from '../slice/constants';
import {Range} from '../rga/Range';
import {ChunkSlice} from '../util/ChunkSlice';
import {updateNum} from '../../../json-hash';
import {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {Cursor} from '../editor/Cursor';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {Printable} from 'tree-dump/lib/types';
import type {PathStep} from '@jsonjoy.com/json-pointer';
import type {Peritext} from '../Peritext';
import type {Slice} from '../slice/types';

/** The attribute started before this inline and ends after this inline. */
export class InlineAttrPassing {
  constructor (public slice: Slice) {}
}

/** The attribute starts at the beginning of this inline. */
export class InlineAttrStart {
  constructor (public slice: Slice) {}
}

/** The attribute ends at the end of this inline. */
export class InlineAttrEnd {
  constructor (public slice: Slice) {}
}

/** The attribute starts and ends in this inline, exactly contains it. */
export class InlineAttrContained {
  constructor (public slice: Slice) {}
}

/** The attribute is collapsed at start of this inline. */
export class InlineAttrCollapsed {
  constructor (public slice: Slice) {}
}

export type InlineAttr = InlineAttrPassing | InlineAttrStart | InlineAttrEnd | InlineAttrContained | InlineAttrCollapsed;
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
     * maybe even the just is not necessary, as the `.start` point should have
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
    return updateNum(this.start.refresh(), this.end.refresh());
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
      ? new InlineAttrCollapsed(slice)
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
   */
  public attr(): InlineAttrs {
    if (this._attr) return this._attr;
    const attr: InlineAttrs = this._attr = {};
    const point = this.start as OverlayPoint;
    const slices1 = point.layers;
    const slices2 = point.markers;
    const length1 = slices1.length;
    const length2 = slices2.length;
    const length3 = length1 + length2;
    for (let i = 0; i < length3; i++) {
      const slice = i >= length1 ? slices2[i - length1] : slices1[i];
      if (slice instanceof Range) {
        const type = slice.type as PathStep;
        switch (slice.behavior) {
          case SliceBehavior.Cursor: {
            const stack: InlineAttrStack = attr[SliceTypes.Cursor] ?? (attr[SliceTypes.Cursor] = []);
            stack.push(this.createAttr(slice));
            break;
          }
          case SliceBehavior.Stack: {
            const stack: InlineAttrStack = attr[type] ?? (attr[type] = []);
            stack.push(this.createAttr(slice));
            break;
          }
          case SliceBehavior.Overwrite: {
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

  public cursorStart(): boolean {
    const attributes = this.attr();
    const stack = attributes[SliceTypes.Cursor];
    if (!stack) return false;
    const attribute = stack[0];
    if (attribute instanceof InlineAttrStart || attribute instanceof InlineAttrContained || attribute instanceof InlineAttrCollapsed) {
      return true;
    }
    return false;
  }

  public cursorEnd(): boolean {
    const attributes = this.attr();
    const stack = attributes[SliceTypes.Cursor];
    if (!stack) return false;
    const attribute = stack[0];
    if (attribute instanceof InlineAttrEnd || attribute instanceof InlineAttrContained) {
      return true;
    }
    return false;
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
                attrKeys.map((key) => () => key + ' = ' + stringify(attr[key].map((attr) => attr.slice instanceof Cursor ? [attr.slice.type, attr.slice.data()] : attr.slice.data()))),
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
