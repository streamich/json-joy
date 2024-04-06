import {compare, type ITimestampStruct, toDisplayString, equal, tick, containsId} from '../../../json-crdt-patch/clock';
import {Anchor} from '../constants';
import {ChunkSlice} from '../util/ChunkSlice';
import {updateId} from '../../../json-crdt/hash';
import type {Stateful} from '../types';
import type {Peritext} from '../Peritext';
import type {Printable} from '../../../util/print/types';
import type {StringChunk} from '../util/types';

/**
 * A "point" in a rich-text Peritext document. It is a combination of a
 * character ID and an anchor. Anchor specifies the side of the character to
 * which the point is attached. For example, a point with an anchor "before" .▢
 * points just before the character, while a point with an anchor "after" ▢.
 * points just after the character.
 */
export class Point implements Pick<Stateful, 'refresh'>, Printable {
  constructor(
    protected readonly txt: Peritext,
    public id: ITimestampStruct,
    public anchor: Anchor,
  ) {}

  /**
   * Overwrites the internal state of this point with the state of the given
   * point.
   *
   * @param point Point to copy.
   */
  public set(point: Point): void {
    this.id = point.id;
    this.anchor = point.anchor;
  }

  /**
   * Creates a copy of this point.
   *
   * @returns Returns a new point with the same ID and anchor as this point.
   */
  public clone(): Point {
    return new Point(this.txt, this.id, this.anchor);
  }

  /**
   *
   * @param other The other point to compare to.
   * @returns Returns 0 if the two points are equal, -1 if this point is less
   *          than the other point, and 1 if this point is greater than the other
   *          point.
   */
  public compare(other: Point): -1 | 0 | 1 {
    const cmp = compare(this.id, other.id);
    if (cmp !== 0) return cmp;
    return (this.anchor - other.anchor) as -1 | 0 | 1;
  }

  public compareSpatial(other: Point): number {
    const thisId = this.id;
    const otherId = other.id;
    const cmp0 = compare(thisId, otherId);
    if (!cmp0) return this.anchor - other.anchor;
    const cmp1 = this.pos() - other.pos();
    if (cmp1) return cmp1;
    let chunk = this.chunk();
    if (!chunk) return cmp0;
    if (containsId(chunk.id, chunk.span, otherId)) return thisId.time - otherId.time;
    const str = this.txt.str;
    chunk = str.next(chunk);
    while (chunk) {
      if (containsId(chunk.id, chunk.span, otherId)) return -1;
      chunk = str.next(chunk);
    }
    return 1;
  }

  private _chunk: StringChunk | undefined;
  public chunk(): StringChunk | undefined {
    let chunk = this._chunk;
    const id = this.id;
    if (chunk) {
      const chunkId = chunk.id;
      const chunkIdTime = chunkId.time;
      const idTime = id.time;
      if (id.sid === chunkId.sid && idTime >= chunkIdTime && idTime < chunkIdTime + chunk.span) return chunk;
    }
    this._chunk = chunk = this.txt.str.findById(this.id);
    return chunk;
  }

  /**
   * @returns Returns position of the character referenced by the point.
   */
  public pos(): number {
    const chunk = this.chunk();
    if (!chunk) return -1;
    const pos = this.txt.str.pos(chunk);
    if (chunk.del) return pos;
    return pos + this.id.time - chunk.id.time;
  }

  private _pos: number = -1;
  /** @todo Is this needed? */
  public posCached(): number {
    if (this._pos >= 0) return this._pos;
    const pos = (this._pos = this.pos());
    return pos;
  }

  /**
   * @returns Returns position of the point, as if it is a cursor in a text
   *          pointing between characters.
   */
  public viewPos(): number {
    const pos = this.pos();
    if (pos < 0) return 0;
    return this.anchor === Anchor.Before ? pos : pos + 1;
  }

  /**
   * Goes to the next visible character in the string. The `move` parameter
   * specifies how many characters to move the cursor by. If the cursor reaches
   * the end of the string, it will return `undefined`.
   *
   * @param move How many characters to move the cursor by.
   * @returns Next visible ID in string.
   */
  public nextId(move: number = 1): ITimestampStruct | undefined {
    if (this.isEndOfStr()) return;
    let remaining: number = move;
    const {id, txt} = this;
    const str = txt.str;
    let chunk: StringChunk | undefined;
    if (this.isStartOfStr()) {
      chunk = str.first();
      while (chunk && chunk.del) chunk = str.next(chunk);
      if (!chunk) return;
      const span = chunk.span;
      if (remaining <= span) return tick(chunk.id, remaining - 1);
      remaining -= span;
      chunk = str.next(chunk);
    } else {
      chunk = this.chunk();
      if (!chunk) return undefined;
      if (!chunk.del) {
        const offset = id.time - chunk.id.time;
        const span = chunk.span;
        if (offset + remaining < span) return tick(id, remaining);
        else remaining -= span - offset - 1;
      }
      chunk = str.next(chunk);
    }
    let lastVisibleChunk: StringChunk | undefined;
    while (chunk && remaining >= 0) {
      if (chunk.del) {
        chunk = str.next(chunk);
        continue;
      }
      lastVisibleChunk = chunk;
      const span = chunk.span;
      if (remaining <= span) return remaining > 1 ? tick(chunk.id, remaining - 1) : chunk.id;
      remaining -= span;
      chunk = str.next(chunk);
    }
    if (remaining > 0) return;
    return lastVisibleChunk ? tick(lastVisibleChunk.id, lastVisibleChunk.span - 1) : undefined;
  }

  /**
   * @returns ID of the character that is `move` characters before the
   *          character referenced by the point, or `undefined` if there is no
   *          such character.
   */
  public prevId(move: number = 1): ITimestampStruct | undefined {
    if (this.isStartOfStr()) return;
    let remaining: number = move;
    const {id, txt} = this;
    const str = txt.str;
    let chunk = this.chunk();
    if (!chunk) return str.id;
    if (!chunk.del) {
      const offset = id.time - chunk.id.time;
      if (offset >= remaining) return tick(id, -remaining);
      remaining -= offset;
    }
    chunk = str.prev(chunk);
    while (chunk) {
      if (chunk.del) {
        chunk = str.prev(chunk);
        continue;
      }
      const span = chunk.span;
      if (remaining <= span) {
        return tick(chunk.id, span - remaining);
      }
      remaining -= span;
      chunk = str.prev(chunk);
    }
    return;
  }

  public leftChar(): ChunkSlice | undefined {
    const str = this.txt.str;
    if (this.isEndOfStr()) {
      let chunk = str.last();
      while (chunk && chunk.del) chunk = str.prev(chunk);
      return chunk ? new ChunkSlice(chunk, chunk.span - 1, 1) : undefined;
    }
    let chunk = this.chunk();
    if (!chunk) return;
    if (chunk.del) {
      const prevId = this.prevId();
      if (!prevId) return;
      const tmp = new Point(this.txt, prevId, Anchor.After);
      return tmp.leftChar();
    }
    if (this.anchor === Anchor.After) {
      const off = this.id.time - chunk.id.time;
      return new ChunkSlice(chunk, off, 1);
    }
    const off = this.id.time - chunk.id.time - 1;
    if (off >= 0) return new ChunkSlice(chunk, off, 1);
    chunk = str.prev(chunk);
    while (chunk && chunk.del) chunk = str.prev(chunk);
    if (!chunk) return;
    return new ChunkSlice(chunk, chunk.span - 1, 1);
  }

  public rightChar(): ChunkSlice | undefined {
    const str = this.txt.str;
    if (this.isStartOfStr()) {
      let chunk = str.first();
      while (chunk && chunk.del) chunk = str.next(chunk);
      return chunk ? new ChunkSlice(chunk, 0, 1) : undefined;
    }
    let chunk = this.chunk();
    if (!chunk) return;
    if (chunk.del) {
      const nextId = this.nextId();
      if (!nextId) return;
      const tmp = new Point(this.txt, nextId, Anchor.Before);
      return tmp.rightChar();
    }
    if (this.anchor === Anchor.Before) {
      const off = this.id.time - chunk.id.time;
      return new ChunkSlice(chunk, off, 1);
    }
    const off = this.id.time - chunk.id.time + 1;
    if (off < chunk.span) return new ChunkSlice(chunk, off, 1);
    chunk = str.next(chunk);
    while (chunk && chunk.del) chunk = str.next(chunk);
    if (!chunk) return;
    return new ChunkSlice(chunk, 0, 1);
  }

  public isStartOfStr(): boolean {
    return equal(this.id, this.txt.str.id) && this.anchor === Anchor.After;
  }

  public isEndOfStr(): boolean {
    return equal(this.id, this.txt.str.id) && this.anchor === Anchor.Before;
  }

  /**
   * Modifies the location of the point, such that the spatial location remains
   * and anchor remains the same, but ensures that the point references a
   * visible (non-deleted) character.
   */
  public refVisible(): void {
    if (this.anchor === Anchor.Before) this.refBefore();
    else this.refAfter();
  }

  public refStart(): void {
    this.id = this.txt.str.id;
    this.anchor = Anchor.After;
  }

  public refEnd(): void {
    this.id = this.txt.str.id;
    this.anchor = Anchor.Before;
  }

  /**
   * Modifies the location of the point, such that the spatial location remains
   * the same, but ensures that it is anchored before a character. Skips any
   * deleted characters (chunks), attaching the point to the next visible
   * character.
   */
  public refBefore(): void {
    const chunk = this.chunk();
    if (!chunk) return this.refEnd();
    if (!chunk.del && this.anchor === Anchor.Before) return;
    this.anchor = Anchor.Before;
    this.id = this.nextId() || this.txt.str.id;
  }

  /**
   * Modifies the location of the point, such that the spatial location remains
   * the same, but ensures that it is anchored after a character. Skips any
   * deleted characters (chunks), attaching the point to the next visible
   * character.
   */
  public refAfter(): void {
    const chunk = this.chunk();
    if (!chunk) return this.refStart();
    if (!chunk.del && this.anchor === Anchor.After) return;
    this.anchor = Anchor.After;
    this.id = this.prevId() || this.txt.str.id;
  }

  /**
   * Moves point past given number of visible characters. Accepts positive
   * and negative distances.
   */
  public move(skip: number): void {
    // TODO: handle cases when cursor reaches ends of string, it should adjust anchor positions as well
    if (!skip) return;
    if (skip > 0) {
      const nextId = this.nextId(skip);
      if (nextId) this.id = nextId;
    } else {
      const prevId = this.prevId(-skip);
      if (prevId) this.id = prevId;
    }
  }

  // ----------------------------------------------------------------- Stateful

  public refresh(): number {
    let state = this.anchor;
    state = updateId(state, this.id);
    return state;
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = '', lite?: boolean): string {
    const name = lite ? '' : this.constructor.name + ' ';
    const pos = this.pos();
    const id = toDisplayString(this.id);
    const anchor = this.anchor === Anchor.Before ? '.▢' : '▢.';
    return `${name}{ ${pos}, ${id}, ${anchor} }`;
  }
}
