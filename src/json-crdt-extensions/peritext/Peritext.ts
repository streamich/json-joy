import {Anchor} from './constants';
import {Point} from './point/Point';
import {Range} from './slice/Range';
import {Editor} from './editor/Editor';
import {printTree} from '../../util/print/printTree';
import {ArrNode, StrNode} from '../../json-crdt/nodes';
import {type ITimestampStruct} from '../../json-crdt-patch/clock';
import type {Model} from '../../json-crdt/model';
import type {Printable} from '../../util/print/types';

export class Peritext implements Printable {
  public readonly editor: Editor;

  constructor(
    public readonly model: Model,
    public readonly str: StrNode,
    slices: ArrNode,
  ) {
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

  public pointAtStart(): Point {
    return this.point(this.str.id, Anchor.After);
  }

  public pointAtEnd(): Point {
    return this.point(this.str.id, Anchor.Before);
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

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const nl = () => '';
    return this.constructor.name + printTree(tab, [(tab) => this.str.toString(tab)]);
  }
}
