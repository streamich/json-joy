import {Point} from '../point/Point';
import {Anchor} from '../constants';
import {StringChunk} from '../util/types';
import {type ITimestampStruct, tick} from '../../../json-crdt-patch/clock';
import type {Peritext} from '../Peritext';
import type {Printable} from '../../../util/print/types';

export class Range implements Printable {
  public static from(txt: Peritext, p1: Point, p2: Point) {
    return p1.compareSpatial(p2) > 0 ? new Range(txt, p2, p1) : new Range(txt, p1, p2);
  }

  constructor(
    protected readonly txt: Peritext,
    public start: Point,
    public end: Point,
  ) {}

  public clone(): Range {
    return new Range(this.txt, this.start.clone(), this.end.clone());
  }

  public isCollapsed(): boolean {
    const start = this.start;
    const end = this.end;
    if (start === end) return true;
    const pos1 = start.pos();
    const pos2 = end.pos();
    if (pos1 === pos2) {
      if (start.anchor === end.anchor) return true;
      // TODO: inspect below cases, if they are needed
      if (start.anchor === Anchor.After) return true;
      else {
        const chunk = start.chunk();
        if (chunk && chunk.del) {
          this.start = this.end.clone();
          return true;
        }
      }
    }
    return false;
  }

  public collapseToStart(): void {
    this.start = this.start.clone();
    this.start.refAfter();
    this.end = this.start.clone();
  }

  public collapseToEnd(): void {
    this.end = this.end.clone();
    this.end.refAfter();
    this.start = this.end.clone();
  }

  public viewRange(): [at: number, len: number] {
    const start = this.start.viewPos();
    const end = this.end.viewPos();
    return [start, end - start];
  }

  public set(start: Point, end: Point = start): void {
    this.start = start;
    this.end = end === start ? end.clone() : end;
  }

  public setRange(range: Range): void {
    this.set(range.start, range.end);
  }

  public setAt(start: number, length: number = 0): void {
    const range = this.txt.rangeAt(start, length);
    this.setRange(range);
  }

  /** @todo Can this be moved to Cursor? */
  public setCaret(after: ITimestampStruct, shift: number = 0): void {
    const id = shift ? tick(after, shift) : after;
    const caretAfter = new Point(this.txt, id, Anchor.After);
    this.set(caretAfter);
  }

  public contains(range: Range): boolean {
    return this.start.compareSpatial(range.start) <= 0 && this.end.compareSpatial(range.end) >= 0;
  }

  public containsPoint(range: Point): boolean {
    return this.start.compareSpatial(range) <= 0 && this.end.compareSpatial(range) >= 0;
  }

  /**
   * Expand range left and right to contain all invisible space: (1) tombstones,
   * (2) anchors of non-deleted adjacent chunks.
   */
  public expand(): void {
    this.expandStart();
    this.expandEnd();
  }

  public expandStart(): void {
    const start = this.start;
    const str = this.txt.str;
    let chunk = start.chunk();
    if (!chunk) return;
    if (!chunk.del) {
      if (start.anchor === Anchor.After) return;
      const pointIsStartOfChunk = start.id.time === chunk.id.time;
      if (!pointIsStartOfChunk) {
        start.id = tick(start.id, -1);
        start.anchor = Anchor.After;
        return;
      }
    }
    while (chunk) {
      const prev = str.prev(chunk);
      if (!prev) {
        start.id = chunk.id;
        start.anchor = Anchor.Before;
        break;
      } else {
        if (prev.del) {
          chunk = prev;
          continue;
        } else {
          start.id = prev.span > 1 ? tick(prev.id, prev.span - 1) : prev.id;
          start.anchor = Anchor.After;
          break;
        }
      }
    }
  }

  public expandEnd(): void {
    const end = this.end;
    const str = this.txt.str;
    let chunk = end.chunk();
    if (!chunk) return;
    if (!chunk.del) {
      if (end.anchor === Anchor.Before) return;
      const pointIsEndOfChunk = end.id.time === chunk.id.time + chunk.span - 1;
      if (!pointIsEndOfChunk) {
        end.id = tick(end.id, 1);
        end.anchor = Anchor.Before;
        return;
      }
    }
    while (chunk) {
      const next = str.next(chunk);
      if (!next) {
        end.id = chunk.span > 1 ? tick(chunk.id, chunk.span - 1) : chunk.id;
        end.anchor = Anchor.After;
        break;
      } else {
        if (next.del) {
          chunk = next;
          continue;
        } else {
          end.id = next.id;
          end.anchor = Anchor.Before;
          break;
        }
      }
    }
  }

  public text(): string {
    const isCaret = this.isCollapsed();
    if (isCaret) return '';
    const {start, end} = this;
    const str = this.txt.str;
    const startId = start.anchor === Anchor.Before ? start.id : start.nextId();
    const endId = end.anchor === Anchor.After ? end.id : end.prevId();
    if (!startId || !endId) return '';
    let result = '';
    str.range0(undefined, startId, endId, (chunk: StringChunk, from: number, length: number) => {
      if (chunk.data) result += chunk.data.slice(from, from + length);
    });
    return result;
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = '', lite: boolean = true): string {
    const name = lite ? '' : `${this.constructor.name} `;
    const start = this.start.toString(tab, lite);
    const end = this.end.toString(tab, lite);
    return `${name}${start} ↔ ${end}`;
  }
}
