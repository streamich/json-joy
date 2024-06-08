import {printTree} from 'tree-dump/lib/printTree';
import {OverlayPoint} from '../overlay/OverlayPoint';
import {stringify} from '../../../json-text/stringify';
import {SliceBehavior, SliceTypes} from '../slice/constants';
import {Range} from '../rga/Range';
import {ChunkSlice} from '../util/ChunkSlice';
import {updateNum} from '../../../json-hash';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {Printable} from 'tree-dump/lib/types';
import type {PathStep} from '../../../json-pointer';
import type {Peritext} from '../Peritext';

export type InlineAttributes = Record<string | number, unknown>;

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

  /**
   * @returns Returns the attributes of the inline, which are the slice
   *     annotations and formatting applied to the inline.
   */
  public attr(): InlineAttributes {
    const attr: InlineAttributes = {};
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
            const dataList: unknown[] = (attr[SliceTypes.Cursor] as unknown[]) || (attr[SliceTypes.Cursor] = []);
            const data: unknown[] = [type];
            const cursorData = slice.data();
            if (cursorData !== void 0) data.push(cursorData);
            dataList.push(data);
            break;
          }
          case SliceBehavior.Stack: {
            let dataList: unknown[] = (attr[type] as unknown[]) || (attr[type] = []);
            if (!Array.isArray(dataList)) dataList = attr[type] = [dataList];
            let data = slice.data();
            if (data === undefined) data = 1;
            dataList.push(data);
            break;
          }
          case SliceBehavior.Overwrite: {
            let data = slice.data();
            if (data === undefined) data = 1;
            attr[type] = data;
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

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const str = this.text();
    const truncate = str.length > 32;
    const text = JSON.stringify(truncate ? str.slice(0, 32) : str) + (truncate ? ' …' : '');
    const startFormatted = this.start.toString(tab, true);
    const range =
      this.start.cmp(this.end) === 0 ? startFormatted : `${startFormatted} ↔ ${this.end.toString(tab, true)}`;
    const header = `${this.constructor.name} ${range} ${text}`;
    const marks = this.attr();
    const markKeys = Object.keys(marks);
    return (
      header +
      printTree(tab, [
        !markKeys.length
          ? null
          : (tab) =>
              'attributes' +
              printTree(
                tab,
                markKeys.map((key) => () => key + ' = ' + stringify(marks[key])),
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
