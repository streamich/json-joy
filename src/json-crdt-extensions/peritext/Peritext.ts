import {PersistedSlice} from './slice/PersistedSlice';
import {Slices} from './slice/Slices';
import {Overlay} from './overlay/Overlay';
import {Anchor, SliceBehavior} from './constants';
import {Point} from './point/Point';
import {CONST, updateNum} from '../../json-hash';
import {Blocks} from './block/Blocks';
import {printTree} from '../../util/print/printTree';
import {Editor} from './editor/Editor';
import {Range} from './slice/Range';
import {interval} from '../../json-crdt-patch/clock';
import {type ITimestampStruct} from '../../json-crdt-patch/clock';
import type {Model} from '../../json-crdt/model';
import type {ArrayRga} from '../../json-crdt/types/rga-array/ArrayRga';
import type {StringRga} from '../../json-crdt/types/rga-string/StringRga';
import type {SliceType, Stateful, StringChunk} from './types';
import type {Printable} from '../../util/print/types';
import type {SplitSlice} from './slice/SplitSlice';

export class Peritext implements Printable, Stateful {
  public readonly slices: Slices;
  public readonly overlay = new Overlay(this);
  public readonly blocks: Blocks;
  public readonly editor: Editor;

  constructor(public readonly model: Model, public readonly str: StringRga, slices: ArrayRga) {
    this.slices = new Slices(this, slices);
    this.blocks = new Blocks(this);
    this.editor = new Editor(this);
  }

  public point(id: ITimestampStruct, anchor: Anchor = Anchor.After): Point {
    return new Point(this, id, anchor);
  }

  public pointAt(pos: number, anchor: Anchor = Anchor.Before): Point {
    const str = this.str;
    const id = str.find(pos);
    if (!id) return this.point(str.id, Anchor.After);
    return this.point(id, anchor);
  }

  public range(start: Point, end: Point): Range {
    return new Range(this, start, end);
  }

  public rangeAt(start: number, length: number = 0): Range {
    const str = this.str;
    if (!length) {
      const startId = !start ? str.id : str.find(start - 1) || str.id;
      const point = this.point(startId, Anchor.After);
      return this.range(point, point);
    }
    const startId = str.find(start) || str.id;
    const endId = str.find(start + length - 1) || startId;
    const startEndpoint = this.point(startId, Anchor.Before);
    const endEndpoint = this.point(endId, Anchor.After);
    return this.range(startEndpoint, endEndpoint);
  }

  public insAt(pos: number, text: string): void {
    const str = this.model.api.wrap(this.str);
    str.ins(pos, text);
  }

  public ins(after: ITimestampStruct, text: string): ITimestampStruct {
    if (!text) throw new Error('NO_TEXT');
    const api = this.model.api;
    const textId = api.builder.insStr(this.str.id, after, text);
    api.apply();
    return textId;
  }

  public insSplit(after: ITimestampStruct, type: SliceType, data?: unknown, char: string = '\n'): SplitSlice {
    const api = this.model.api;
    const builder = api.builder;
    const str = this.str;
    /**
     * We skip one clock cycle to prevent Block-wise-RGA from merging adjacent
     * characters. We wan the split chunk to be a distinct chunk.
     */
    builder.nop(1);
    const textId = builder.insStr(str.id, after, char[0]);
    const point = this.point(textId, Anchor.Before);
    const range = this.range(point, point);
    return this.slices.ins(range, SliceBehavior.Split, type, data);
  }

  /** @todo This can probably use .del() */
  public delSplit(split: SplitSlice): void {
    const str = this.str;
    const api = this.model.api;
    const builder = api.builder;
    const strChunk = split.start.chunk();
    if (strChunk) builder.del(str.id, [interval(strChunk.id, 0, 1)]);
    builder.del(this.slices.set.id, [interval(split.id, 0, 1)]);
    api.apply();
  }

  public insSlice(
    range: Range,
    behavior: SliceBehavior,
    type: SliceType,
    data?: unknown | ITimestampStruct,
  ): PersistedSlice {
    // if (range.isCollapsed()) throw new Error('INVALID_RANGE');
    // TODO: If range is not collapsed, check if there are any visible characters in the range.
    const slice = this.slices.ins(range, behavior, type, data);
    return slice;
  }

  public delAt(pos: number, len: number): void {
    const range = this.rangeAt(pos, len);
    this.del(range);
  }

  public del(range: Range): void {
    this.delSlices(range);
    this.delStr(range);
  }

  public delStr(range: Range): void {
    const nothingToDelete = range.isCollapsed();
    if (nothingToDelete) return;
    const {start, end} = range;
    const deleteStartId = start.anchor === Anchor.Before ? start.id : start.nextId();
    const deleteEndId = end.anchor === Anchor.After ? end.id : end.prevId();
    const str = this.str;
    if (!deleteStartId || !deleteEndId) throw new Error('INVALID_RANGE');
    const spans = str.findInterval2(deleteStartId, deleteEndId);
    const model = this.model;
    const api = model.api;
    api.builder.del(str.id, spans);
    api.apply();
    if (start.anchor === Anchor.After) range.setCaret(start.id);
    else range.setCaret(start.prevId() || str.id);
  }

  public delSlices(range: Range): void {
    this.overlay.refresh();
    range = range.clone();
    range.expand();
    const slices = this.overlay.findContained(range);
    this.slices.delMany(Array.from(slices));
  }

  public delSlice(sliceId: ITimestampStruct): void {
    this.slices.del(sliceId);
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

  public firstVisibleChunk(): StringChunk | undefined {
    const str = this.str;
    let curr = str.first();
    if (!curr) return;
    while (curr.del) {
      curr = str.next(curr);
      if (!curr) return;
    }
    return curr;
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
        nl,
        (tab) => this.blocks.toString(tab),
      ])
    );
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    let state: number = CONST.START_STATE;
    this.overlay.refresh();
    state = updateNum(state, this.blocks.refresh());
    state = updateNum(state, this.overlay.hash);
    return (this.hash = state);
  }
}
