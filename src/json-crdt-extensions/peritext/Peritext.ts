import {printTree} from 'tree-dump/lib/printTree';
import {Anchor} from './rga/constants';
import {Point} from './rga/Point';
import {Range} from './rga/Range';
import {Editor} from './editor/Editor';
import {ArrNode, StrNode} from '../../json-crdt/nodes';
import {Slices} from './slice/Slices';
import {Overlay} from './overlay/Overlay';
import {Chars} from './constants';
import {interval} from '../../json-crdt-patch/clock';
import {CONST, updateNum} from '../../json-hash';
import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {Model} from '../../json-crdt/model';
import type {Printable} from 'tree-dump/lib/types';
import type {StringChunk} from './util/types';
import type {SliceType} from './types';
import type {MarkerSlice} from './slice/MarkerSlice';

/**
 * Context for a Peritext instance. Contains all the data and methods needed to
 * interact with the text.
 */
export class Peritext implements Printable {
  public readonly slices: Slices;
  public readonly editor: Editor;
  public readonly overlay = new Overlay(this);

  constructor(
    public readonly model: Model,
    public readonly str: StrNode,
    slices: ArrNode,
  ) {
    this.slices = new Slices(this, slices);
    this.editor = new Editor(this);
  }

  public strApi() {
    return this.model.api.wrap(this.str);
  }

  /** Select a single character before a point. */
  public findCharBefore(point: Point): Range | undefined {
    if (point.anchor === Anchor.After) {
      const chunk = point.chunk();
      if (chunk && !chunk.del) return this.range(this.point(point.id, Anchor.Before), point);
    }
    const id = point.prevId();
    if (!id) return;
    return this.range(this.point(id, Anchor.Before), this.point(id, Anchor.After));
  }

  // ------------------------------------------------------------------- points

  /**
   * Creates a point at a character ID.
   *
   * @param id Character ID to which the point should be attached.
   * @param anchor Whether the point should be before or after the character.
   * @returns The point.
   */
  public point(id: ITimestampStruct = this.str.id, anchor: Anchor = Anchor.After): Point {
    return new Point(this.str, id, anchor);
  }

  /**
   * Creates a point at a view position in the text. The `pos` argument specifies
   * the position of the character, not the gap between characters.
   *
   * @param pos Position of the character in the text.
   * @param anchor Whether the point should attach before or after a character.
   *               Defaults to "before".
   * @returns The point.
   */
  public pointAt(pos: number, anchor: Anchor = Anchor.Before): Point {
    // TODO: Provide ability to attach to the beginning of the text?
    // TODO: Provide ability to attach to the end of the text?
    const str = this.str;
    const id = str.find(pos);
    if (!id) return this.point(str.id, Anchor.After);
    return this.point(id, anchor);
  }

  /**
   * Creates a point which is attached to the start of the text, before the
   * first character.
   *
   * @returns A point at the start of the text.
   */
  public pointAbsStart(): Point {
    return this.point(this.str.id, Anchor.After);
  }

  /**
   * Creates a point which is attached to the end of the text, after the last
   * character.
   *
   * @returns A point at the end of the text.
   */
  public pointAbsEnd(): Point {
    return this.point(this.str.id, Anchor.Before);
  }

  // ------------------------------------------------------------------- ranges

  /**
   * Creates a range from two points. The points can be in any order.
   *
   * @param p1 Point
   * @param p2 Point
   * @returns A range with points in correct order.
   */
  public rangeFromPoints(p1: Point, p2: Point): Range {
    return Range.from(this.str, p1, p2);
  }

  /**
   * Creates a range from two points, the points have to be in the correct order.
   *
   * @param start Start point of the range, must be before or equal to end.
   * @param end End point of the range, must be after or equal to start.
   * @returns A range with the given start and end points.
   */
  public range(start: Point, end: Point): Range {
    return new Range(this.str, start, end);
  }

  /**
   * A convenience method for creating a range from a view position and a length.
   * See {@link Range.at} for more information.
   *
   * @param start Position in the text.
   * @param length Length of the range.
   * @returns A range from the given position with the given length.
   */
  public rangeAt(start: number, length: number = 0): Range {
    return Range.at(this.str, start, length);
  }

  // --------------------------------------------------------------------- text

  /**
   * Insert plain text at a view position in the text.
   *
   * @param pos View position in the text.
   * @param text Text to insert.
   */
  public insAt(pos: number, text: string): void {
    const str = this.strApi();
    str.ins(pos, text);
  }

  /**
   * Insert plain text after a character referenced by its ID and return the
   * ID of the insertion operation.
   *
   * @param after Character ID after which the text should be inserted.
   * @param text Text to insert.
   * @returns ID of the insertion operation.
   */
  public ins(after: ITimestampStruct, text: string): ITimestampStruct {
    if (!text) throw new Error('NO_TEXT');
    const api = this.model.api;
    const textId = api.builder.insStr(this.str.id, after, text);
    api.apply();
    return textId;
  }

  // ------------------------------------------------------------------ markers

  public insMarker(
    after: ITimestampStruct,
    type: SliceType,
    data?: unknown,
    char: string = Chars.BlockSplitSentinel,
  ): MarkerSlice {
    const api = this.model.api;
    const builder = api.builder;
    const str = this.str;
    /**
     * We skip one clock cycle to prevent Block-wise RGA from merging adjacent
     * characters. We want the marker chunk to always be its own distinct chunk.
     */
    builder.nop(1);
    const textId = builder.insStr(str.id, after, char[0]);
    const point = this.point(textId, Anchor.Before);
    const range = this.range(point, point);
    return this.slices.insMarker(range, type, data);
  }

  /** @todo This can probably use .del() */
  public delMarker(split: MarkerSlice): void {
    const str = this.str;
    const api = this.model.api;
    const builder = api.builder;
    const strChunk = split.start.chunk();
    if (strChunk) builder.del(str.id, [interval(strChunk.id, 0, 1)]);
    builder.del(this.slices.set.id, [interval(split.id, 0, 1)]);
    api.apply();
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const nl = () => '';
    return (
      this.constructor.name +
      printTree(tab, [
        (tab) => this.editor.cursor.toString(tab),
        nl,
        (tab) => this.str.toString(tab),
        nl,
        (tab) => this.slices.toString(tab),
        nl,
        (tab) => this.overlay.toString(tab),
      ])
    );
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    let state: number = CONST.START_STATE;
    this.overlay.refresh();
    state = updateNum(state, this.overlay.hash);
    return (this.hash = state);
  }
}
