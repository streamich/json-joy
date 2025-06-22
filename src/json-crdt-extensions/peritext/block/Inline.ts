import {printTree} from 'tree-dump/lib/printTree';
import {stringify} from '../../../json-text/stringify';
import {SliceStacking, SliceTypeName} from '../slice/constants';
import {Range} from '../rga/Range';
import {ChunkSlice} from '../util/ChunkSlice';
import {Cursor} from '../editor/Cursor';
import {hashId} from '../../../json-crdt/hash';
import {formatType} from '../slice/util';
import type {Point} from '../rga/Point';
import type {OverlayPoint} from '../overlay/OverlayPoint';
import type {Printable} from 'tree-dump/lib/types';
import type {PathStep} from '@jsonjoy.com/json-pointer';
import type {Peritext} from '../Peritext';
import type {Slice} from '../slice/types';
import type {PeritextMlAttributes, PeritextMlNode} from './types';

export abstract class AbstractInlineAttr<T = string> {
  constructor(public slice: Slice<T>) {}

  /** @returns Whether the attribute starts at the start of the inline. */
  isStart(): boolean {
    return false;
  }

  /** @returns Whether the attribute ends at the end of the inline. */
  isEnd(): boolean {
    return false;
  }

  /** @returns Whether the attribute is collapsed to a point. */
  isCollapsed(): boolean {
    return false;
  }
}

/** The attribute started before this inline and ends after this inline. */
export class InlineAttrPassing<T = string> extends AbstractInlineAttr<T> {}

/** The attribute starts at the beginning of this inline. */
export class InlineAttrStart<T = string> extends AbstractInlineAttr<T> {
  isStart(): boolean {
    return true;
  }
}

/** The attribute ends at the end of this inline. */
export class InlineAttrEnd<T = string> extends AbstractInlineAttr<T> {
  isEnd(): boolean {
    return true;
  }
}

/** The attribute starts and ends in this inline, exactly contains it. */
export class InlineAttrContained<T = string> extends AbstractInlineAttr<T> {
  isStart(): boolean {
    return true;
  }
  isEnd(): boolean {
    return true;
  }
}

/** The attribute is collapsed at start of this inline. */
export class InlineAttrStartPoint<T = string> extends AbstractInlineAttr<T> {
  isStart(): boolean {
    return true;
  }
  isCollapsed(): boolean {
    return true;
  }
}

/** The attribute is collapsed at end of this inline. */
export class InlineAttrEndPoint<T = string> extends AbstractInlineAttr<T> {
  isEnd(): boolean {
    return true;
  }
  isCollapsed(): boolean {
    return true;
  }
}

export type InlineAttr<T = string> =
  | InlineAttrPassing<T>
  | InlineAttrStart<T>
  | InlineAttrEnd<T>
  | InlineAttrContained<T>
  | InlineAttrStartPoint<T>
  | InlineAttrEndPoint<T>;
export type InlineAttrStack<T = string> = InlineAttr<T>[];

export type InlineAttrs<T = string> = Record<string | number, InlineAttrStack<T>>;

/**
 * The `Inline` class represents a range of inline text within a block, which
 * has the same annotations and formatting for all of its text contents, i.e.
 * its text contents can be rendered as a single (`<span>`) element. However,
 * the text contents might still be composed of multiple {@link ChunkSlice}s,
 * which are the smallest units of text and need to be concatenated to get the
 * full text content of the inline.
 */
export class Inline<T = string> extends Range<T> implements Printable {
  constructor(
    public readonly txt: Peritext<T>,
    public readonly p1: OverlayPoint<T>,
    public readonly p2: OverlayPoint<T>,
    start: Point<T>,
    end: Point<T>,
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

  protected createAttr(slice: Slice<T>): InlineAttr<T> {
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

  private _attr: InlineAttrs<T> | undefined;

  /**
   * @returns Returns the attributes of the inline, which are the slice
   *     annotations and formatting applied to the inline.
   *
   * @todo Rename to `.stat()`.
   * @todo Create a more efficient way to compute inline stats, separate: (1)
   *     boolean flags, (2) cursor, (3) other attributes.
   */
  public attr(): InlineAttrs<T> {
    if (this._attr) return this._attr;
    const attr: InlineAttrs<T> = (this._attr = {});
    const p1 = this.p1;
    const p2 = this.p2;
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
        const type = slice.type() as PathStep;
        switch (slice.stacking) {
          case SliceStacking.Cursor: {
            const stack: InlineAttrStack<T> = attr[SliceTypeName.Cursor] ?? (attr[SliceTypeName.Cursor] = []);
            stack.push(this.createAttr(slice));
            break;
          }
          case SliceStacking.Many: {
            const stack: InlineAttrStack<T> = attr[type] ?? (attr[type] = []);
            stack.push(this.createAttr(slice));
            break;
          }
          case SliceStacking.One: {
            attr[type] = [this.createAttr(slice)];
            break;
          }
          case SliceStacking.Erase: {
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

  public texts(limit: number = 1e6): ChunkSlice<T>[] {
    const texts: ChunkSlice<T>[] = [];
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

  // ------------------------------------------------------------------- export

  public toJson(): PeritextMlNode {
    let node: PeritextMlNode = this.text();
    const attrs = this.attr();
    for (const key in attrs) {
      const keyNum = Number(key);
      if (keyNum === SliceTypeName.Cursor || keyNum === SliceTypeName.RemoteCursor) continue;
      const attr = attrs[key];
      if (!attr.length) node = [key, {inline: true}, node];
      else {
        const length = attr.length;
        for (let i = 0; i < length; i++) {
          const slice = attr[i].slice;
          const data = slice.data();
          const attributes: PeritextMlAttributes = data === void 0 ? {inline: true} : {inline: true, data};
          node = [key === keyNum + '' ? keyNum : key, attributes, node];
        }
      }
    }
    return node;
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    return 'Inline';
  }

  public toString(tab: string = ''): string {
    const header = `${super.toString(tab)}`;
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
                  return key === '-1'
                    ? '▚ (cursor)'
                    : formatType(key) +
                        ' = ' +
                        stringify(
                          attr[key].map((attr) => {
                            const slice = attr.slice;
                            return slice instanceof Cursor ? [slice.type(), slice.data()] : slice.data()
                          }),
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
