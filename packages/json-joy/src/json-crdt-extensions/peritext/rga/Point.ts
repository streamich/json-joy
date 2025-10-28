import {compare, type ITimestampStruct, printTs, equal, tick, containsId} from '../../../json-crdt-patch/clock';
import {Anchor} from './constants';
import {ChunkSlice} from '../util/ChunkSlice';
import {hashId, updateId} from '../../../json-crdt/hash';
import {Position} from '../constants';
import type {AbstractRga, Chunk} from '../../../json-crdt/nodes/rga';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';

/**
 * A "point" in a rich-text Peritext document. It is a combination of a
 * character ID and an anchor. Anchor specifies the side of the character to
 * which the point is attached. For example, a point with an anchor "before" .▢
 * points just before the character, while a point with an anchor "after" ▢.
 * points just after the character. Points attached to string characters are
 * referred to as *relative* points, while points attached to the beginning or
 * end of the string are referred to as *absolute* points.
 *
 * The *absolute* points are reference the string itself, by using the string's
 * ID as the character ID. The *absolute (abs) start* references the very start
 * of the string, before the first character, and even before any deleted
 * characters. The *absolute (abs) end* references the very end of the string,
 * after the last character, and even after any deleted characters at the end
 * of the string.
 */
export class Point<T = string> implements Pick<Stateful, 'refresh'>, Printable {
  constructor(
    protected readonly rga: AbstractRga<T>,
    public id: ITimestampStruct,
    public anchor: Anchor,
  ) {}

  /**
   * Overwrites the internal state of this point with the state of the given
   * point.
   *
   * @param point Point to copy.
   */
  public set(point: Point<T>): void {
    this.id = point.id;
    this.anchor = point.anchor;
  }

  /**
   * Creates a copy of this point.
   *
   * @returns Returns a new point with the same ID and anchor as this point.
   */
  public clone(): Point<T> {
    return new Point(this.rga, this.id, this.anchor);
  }

  public copy(mutate: (copy: Point<T>) => void): Point<T> {
    const copy = this.clone();
    mutate(copy);
    return copy;
  }

  /**
   * Compares two points by their character IDs and anchors. First, the character
   * IDs are compared. If they are equal, the anchors are compared. The anchor
   * "before" is considered less than the anchor "after".
   *
   * @param other The other point to compare to.
   * @returns Returns 0 if the two points are equal, -1 if this point is less
   *          than the other point, and 1 if this point is greater than the other
   *          point.
   */
  public cmp(other: Point<T>): -1 | 0 | 1 {
    const cmp = compare(this.id, other.id);
    if (cmp !== 0) return cmp;
    return (this.anchor - other.anchor) as -1 | 0 | 1;
  }

  /**
   * Compares two points by their spatial (view) location in the string. Takes
   * into account not only the character position in the view, but also handles
   * deleted characters, attachment anchors, and absolute points.
   *
   * @param other The other point to compare to.
   * @returns Returns 0 if the two points are equal, negative if this point is
   *          less than the other point, and positive if this point is greater
   *          than the other point.
   */
  public cmpSpatial(other: Point<T>): number {
    const thisId = this.id;
    const otherId = other.id;
    if (this.isAbs()) {
      const isStart = this.anchor === Anchor.After;
      return isStart ? (other.isAbsStart() ? 0 : -1) : other.isAbsEnd() ? 0 : 1;
    } else if (other.isAbs()) {
      const isStart = other.anchor === Anchor.After;
      return isStart ? (this.isAbsStart() ? 0 : 1) : this.isAbsEnd() ? 0 : -1;
    }
    const cmp0 = compare(thisId, otherId);
    if (!cmp0) return this.anchor - other.anchor;
    const cmp1 = this.pos() - other.pos();
    if (cmp1) return cmp1;
    let chunk = this.chunk();
    if (!chunk) return cmp0;
    if (containsId(chunk.id, chunk.span, otherId)) return thisId.time - otherId.time;
    const rga = this.rga;
    chunk = rga.next(chunk);
    while (chunk) {
      if (containsId(chunk.id, chunk.span, otherId)) return -1;
      chunk = rga.next(chunk);
    }
    return 1;
  }

  private _chunk: Chunk<T> | undefined;

  /**
   * @returns Returns the chunk that contains the character referenced by the
   *          point, or `undefined` if the chunk is not found.
   */
  public chunk(): Chunk<T> | undefined {
    let chunk = this._chunk;
    const id = this.id;
    if (chunk) {
      const chunkId = chunk.id;
      const chunkIdTime = chunkId.time;
      const idTime = id.time;
      if (id.sid === chunkId.sid && idTime >= chunkIdTime && idTime < chunkIdTime + chunk.span) return chunk;
    }
    this._chunk = chunk = this.rga.findById(this.id);
    return chunk;
  }

  /**
   * @returns Returns position of the character referenced by the point.
   */
  public pos(): number {
    const chunk = this.chunk();
    if (!chunk) return this.isAbsEnd() ? Position.AbsEnd : Position.AbsStart;
    const pos = this.rga.pos(chunk);
    if (chunk.del) return pos;
    return pos + this.id.time - chunk.id.time;
  }

  /**
   * @returns Returns the view position of the point, as if it is a caret in
   *          the text pointing between characters (0 is before the first
   *          character, 1 is after the first character, etc.).
   */
  public viewPos(): number {
    const isAbs = equal(this.rga.id, this.id);
    if (isAbs) return this.anchor === Anchor.After ? 0 : this.rga.length();
    const pos = this.pos();
    return this.anchor === Anchor.Before ? pos : pos + 1;
  }

  /**
   * @returns Returns `true` if the point is at the very start of the string, i.e.
   *     there are no visible characters before it.
   */
  public isStart(): boolean {
    const chunk = this.chunk();
    if (!chunk) return true;
    if (!chunk.del && chunk.id.time < this.id.time) return false;
    const l = chunk.l;
    return l ? !l.len : true;
  }

  /**
   * Goes to the next visible character in the string. The `move` parameter
   * specifies how many characters to move the cursor by. If the cursor reaches
   * the end of the string, it will return `undefined`.
   *
   * @param skip How many characters to move by.
   * @returns Next visible ID in string.
   */
  public nextId(skip: number = 1): ITimestampStruct | undefined {
    if (this.isAbsEnd()) return;
    let remaining: number = skip;
    const {id, rga} = this;
    let chunk: Chunk<T> | undefined;
    if (this.isAbsStart()) {
      chunk = rga.first();
      while (chunk && chunk.del) chunk = rga.next(chunk);
      if (!chunk) return;
      const span = chunk.span;
      if (remaining <= span) return tick(chunk.id, remaining - 1);
      remaining -= span;
      chunk = rga.next(chunk);
    } else {
      chunk = this.chunk();
      if (!chunk) return undefined;
      if (!chunk.del) {
        const offset = id.time - chunk.id.time;
        const span = chunk.span;
        if (offset + remaining < span) return tick(id, remaining);
        else remaining -= span - offset - 1;
      }
      chunk = rga.next(chunk);
    }
    let lastVisibleChunk: Chunk<T> | undefined;
    while (chunk && remaining >= 0) {
      if (chunk.del) {
        chunk = rga.next(chunk);
        continue;
      }
      lastVisibleChunk = chunk;
      const span = chunk.span;
      if (remaining <= span) return remaining > 1 ? tick(chunk.id, remaining - 1) : chunk.id;
      remaining -= span;
      chunk = rga.next(chunk);
    }
    if (remaining > 0) return;
    return lastVisibleChunk ? tick(lastVisibleChunk.id, lastVisibleChunk.span - 1) : undefined;
  }

  /**
   * @returns ID of the character that is `move` characters before the
   *          character referenced by the point, or `undefined` if there is no
   *          such character.
   */
  public prevId(skip: number = 1): ITimestampStruct | undefined {
    if (this.isAbsStart()) return;
    let remaining: number = skip;
    const {id, rga} = this;
    let chunk = this.chunk();
    if (!chunk) return rga.id;
    if (!chunk.del) {
      const offset = id.time - chunk.id.time;
      if (offset >= remaining) return tick(id, -remaining);
      remaining -= offset;
    }
    chunk = rga.prev(chunk);
    while (chunk) {
      if (chunk.del) {
        chunk = rga.prev(chunk);
        continue;
      }
      const span = chunk.span;
      if (remaining <= span) {
        return tick(chunk.id, span - remaining);
      }
      remaining -= span;
      chunk = rga.prev(chunk);
    }
    return;
  }

  /**
   * Returns one character to the left of the point, or `undefined` if there
   * is no such character. Skips any deleted characters. Handles absolute points.
   *
   * @returns A character slice to the left of the point.
   */
  public leftChar(): ChunkSlice<T> | undefined {
    const rga = this.rga;
    if (this.isAbsEnd()) {
      const res = rga.findChunk(rga.length() - 1);
      if (!res) return;
      return new ChunkSlice(res[0], res[1], 1);
    }
    const tmp = this.clone();
    tmp.refAfter();
    if (tmp.isAbsStart()) return;
    const chunk = tmp.chunk();
    if (!chunk || chunk.del) return;
    const off = tmp.id.time - chunk.id.time;
    return new ChunkSlice(chunk, off, 1);
  }

  /**
   * Returns one character to the right of the point, or `undefined` if there
   * is no such character. Skips any deleted characters. Handles absolute points.
   *
   * @returns A character slice to the right of the point.
   */
  public rightChar(): ChunkSlice<T> | undefined {
    const rga = this.rga;
    if (this.isAbsStart()) {
      const res = rga.findChunk(0);
      if (!res) return;
      return new ChunkSlice(res[0], res[1], 1);
    }
    const tmp = this.clone();
    tmp.refBefore();
    if (tmp.isAbsEnd()) return;
    const chunk = tmp.chunk();
    if (!chunk || chunk.del) return;
    const off = tmp.id.time - chunk.id.time;
    return new ChunkSlice(chunk, off, 1);
  }

  public char(): ChunkSlice<T> | undefined {
    return this.anchor === Anchor.Before ? this.rightChar() : this.leftChar();
  }

  /**
   * Checks if the point is an absolute point. An absolute point is a point that
   * references the string itself, rather than a character in the string. It can
   * be either the very start or the very end of the string.
   *
   * @returns Returns `true` if the point is an absolute point.
   */
  public isAbs(): boolean {
    return equal(this.id, this.rga.id);
  }

  /**
   * @returns Returns `true` if the point is an absolute point and is anchored
   *          before the first character in the string.
   */
  public isAbsStart(): boolean {
    return this.isAbs() && this.anchor === Anchor.After;
  }

  /**
   * @returns Returns `true` if the point is an absolute point and is anchored
   *          after the last character in the string.
   */
  public isAbsEnd(): boolean {
    return this.isAbs() && this.anchor === Anchor.Before;
  }

  /**
   * @returns Returns `true` if the point is exactly the relative start, i.e.
   *          it is attached to the first visible character in the string and
   *          anchored "before".
   */
  public isRelStart(): boolean {
    if (this.anchor !== Anchor.Before) return false;
    const id = this.rga.find(0);
    return !!id && equal(this.id, id);
  }

  /**
   * @returns Returns `true` if the point is exactly the relative end, i.e. it
   *          is attached to the last visible character in the string and
   *          anchored "after".
   */
  public isRelEnd(): boolean {
    if (this.anchor !== Anchor.After) return false;
    const rga = this.rga;
    const length = rga.length();
    if (length === 0) return false;
    const id = rga.find(length - 1);
    return !!id && equal(this.id, id);
  }

  /**
   * Sets the point to the absolute start of the string.
   */
  public refAbsStart(): void {
    this.id = this.rga.id;
    this.anchor = Anchor.After;
  }

  /**
   * Sets the point to the absolute end of the string.
   */
  public refAbsEnd(): void {
    this.id = this.rga.id;
    this.anchor = Anchor.Before;
  }

  /**
   * Sets the point to the relative start of the string.
   */
  public refStart(): this {
    this.refAbsStart();
    this.refBefore();
    return this;
  }

  /**
   * Sets the point to the relative end of the string.
   */
  public refEnd(): this {
    this.refAbsEnd();
    this.refAfter();
    return this;
  }

  /**
   * Modifies the location of the point, such that the view location remains
   * the same, but ensures that it is anchored before a character. Skips any
   * deleted characters (chunks), attaching the point to the next visible
   * character.
   */
  public refBefore(): void {
    const chunk = this.chunk();
    if (!chunk) {
      if (this.isAbsStart()) {
        const id = this.rga.find(0);
        if (id) {
          this.id = id;
          this.anchor = Anchor.Before;
          return;
        }
      }
      this.refAbsEnd();
      return;
    }
    if (!chunk.del && this.anchor === Anchor.Before) return;
    this.anchor = Anchor.Before;
    this.id = this.nextId() || this.rga.id;
  }

  /**
   * Modifies the location of the point, such that the view location remains
   * the same, but ensures that it is anchored after a character. Skips any
   * deleted characters (chunks), attaching the point to the next visible
   * character.
   */
  public refAfter(): void {
    const chunk = this.chunk();
    if (!chunk) {
      if (this.isAbsEnd()) {
        const rga = this.rga;
        const length = rga.length();
        if (length !== 0) {
          const id = rga.find(length - 1);
          if (id) {
            this.id = id;
            this.anchor = Anchor.After;
            return;
          }
        }
      }
      this.refAbsStart();
      return;
    }
    if (!chunk.del && this.anchor === Anchor.After) return;
    this.anchor = Anchor.After;
    this.id = this.prevId() || this.rga.id;
  }

  /**
   * Modifies the location of the point, such that the spatial location remains
   * the same and tries to preserve anchor location, but ensures that the point
   * references a visible (not deleted) character.
   */
  public refVisible(): void {
    if (this.anchor === Anchor.Before) this.refBefore();
    else this.refAfter();
  }

  /**
   * Moves point past given number of visible characters. Accepts positive
   * and negative distances.
   *
   * @param length How many characters to move by. Positive number moves the
   *     point to the right, negative number moves the point to the left.
   * @returns Returns `true` if the absolute end of the string is reached.
   */
  public step(length: number): boolean {
    if (!length) return this.isAbs();
    const anchor = this.anchor;
    if (anchor !== Anchor.After) this.refAfter();
    if (length > 0) {
      const nextId = this.nextId(length);
      if (!nextId) {
        this.refAbsEnd();
        return true;
      } else {
        this.id = nextId;
        if (anchor !== Anchor.After) this.refBefore();
      }
    } else {
      const prevId = this.prevId(-length);
      if (!prevId) {
        this.refAbsStart();
        return true;
      } else {
        this.id = prevId;
        if (anchor !== Anchor.After) this.refBefore();
      }
    }
    return false;
  }

  /**
   * Moves the to the next point, which does not necessarily result in a visible
   * character skip.
   *
   * @param length How many points to move by.
   * @returns Returns `true` if the absolute end of the string is reached.
   */
  public halfstep(length: number): boolean {
    this.refVisible();
    const isOdd = !!(length % 2);
    if (isOdd) {
      if (length > 0) {
        length--;
        if (this.anchor === Anchor.After) this.refBefore();
        else if (this.isAbs()) return true;
        else this.anchor = Anchor.After;
      } else {
        length++;
        if (this.anchor === Anchor.Before) this.refAfter();
        else if (this.isAbs()) return true;
        else this.anchor = Anchor.Before;
      }
    }
    return this.step(length / 2);
  }

  public key(): number {
    return hashId(this.id) + (this.anchor ? 0 : 1);
  }

  // ----------------------------------------------------------------- Stateful

  public refresh(): number {
    return updateId(this.anchor, this.id);
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    return 'Point';
  }

  public toString(tab: string = '', lite?: boolean): string {
    const name = lite ? '' : this.toStringName() + ' ';
    const pos = this.pos();
    const id = printTs(this.id);
    let char: string | undefined = this.char()?.view() as string | undefined;
    char = typeof char === 'string' ? JSON.stringify(char) : '▢';
    const anchor = this.anchor === Anchor.Before ? '.' + char : char + '.';
    return `${name}{ ${pos === Position.AbsEnd ? '∞' : pos}, ${id}, ${anchor} }`;
  }
}
