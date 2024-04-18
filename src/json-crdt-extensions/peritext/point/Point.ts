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
   * Compares two points by their character IDs and anchors. First, the character
   * IDs are compared. If they are equal, the anchors are compared. The anchor
   * "before" is considered less than the anchor "after".
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

  /**
   * Compares two points by their spatial (view) location in the string. Takes
   * into account not only the character position in the view, but also handles
   * deleted characters and absolute points.
   *
   * @param other The other point to compare to.
   * @returns Returns 0 if the two points are equal, negative if this point is
   *          less than the other point, and positive if this point is greater
   *          than the other point.
   */
  public compareSpatial(other: Point): number {
    const thisId = this.id;
    const otherId = other.id;
    if (this.isAbs()) {
      const isStart = this.anchor === Anchor.After;
      return isStart
        ? other.isAbsStart() ? 0 : -1
        : other.isAbsEnd() ? 0 : 1;
    } else if (other.isAbs()) {
      const isStart = other.anchor === Anchor.After;
      return isStart
        ? this.isAbsStart() ? 0 : 1
        : this.isAbsEnd() ? 0 : -1;
    }
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

  /**
   * @returns Returns the chunk that contains the character referenced by the
   *          point, or `undefined` if the chunk is not found.
   */
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
   * @returns Returns the view position of the point, as if it is a caret in
   *          the text pointing between characters.
   */
  public viewPos(): number {
    const pos = this.pos();
    if (pos < 0) return this.isAbsStart() ? 0 : this.txt.str.length();
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
    if (this.isAbsEnd()) return;
    let remaining: number = move;
    const {id, txt} = this;
    const str = txt.str;
    let chunk: StringChunk | undefined;
    if (this.isAbsStart()) {
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
    if (this.isAbsStart()) return;
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

  /**
   * Returns one character to the left of the point, or `undefined` if there
   * is no such character. Skips any deleted characters. Handles absolute points.
   *
   * @returns A character slice to the left of the point.
   */
  public leftChar(): ChunkSlice | undefined {
    const str = this.txt.str;
    if (this.isAbsEnd()) {
      const res = str.findChunk(str.length() - 1);
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
  public rightChar(): ChunkSlice | undefined {
    const str = this.txt.str;
    if (this.isAbsStart()) {
      const res = str.findChunk(0);
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

  /**
   * Checks if the point is an absolute point. An absolute point is a point that
   * references the string itself, rather than a character in the string. It can
   * be either the very start or the very end of the string.
   *
   * @returns Returns `true` if the point is an absolute point.
   */
  public isAbs(): boolean {
    return equal(this.id, this.txt.str.id);
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
    const id = this.txt.str.find(0);
    return !!id && equal(this.id, id);
  }

  /**
   * @returns Returns `true` if the point is exactly the relative end, i.e. it
   *          is attached to the last visible character in the string and
   *          anchored "after".
   */
  public isRelEnd(): boolean {
    if (this.anchor !== Anchor.After) return false;
    const str = this.txt.str;
    const length = str.length();
    if (length === 0) return false;
    const id = str.find(length - 1);
    return !!id && equal(this.id, id);
  }

  /**
   * Sets the point to the absolute start of the string.
   */
  public refAbsStart(): void {
    this.id = this.txt.str.id;
    this.anchor = Anchor.After;
  }

  /**
   * Sets the point to the absolute end of the string.
   */
  public refAbsEnd(): void {
    this.id = this.txt.str.id;
    this.anchor = Anchor.Before;
  }

  /**
   * Sets the point to the relative start of the string.
   */
  public refStart(): void {
    this.refAbsStart();
    this.refBefore();
  }

  /**
   * Sets the point to the relative end of the string.
   */
  public refEnd(): void {
    this.refAbsEnd();
    this.refAfter();
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
        const id = this.txt.str.find(0);
        if (id) {
          this.id = id;
          this.anchor = Anchor.Before;
          return;
        }
      }
      return this.refAbsEnd();
    }
    if (!chunk.del && this.anchor === Anchor.Before) return;
    this.anchor = Anchor.Before;
    this.id = this.nextId() || this.txt.str.id;
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
        const str = this.txt.str;
        const length = str.length();
        if (length !== 0) {
          const id = str.find(length - 1);
          if (id) {
            this.id = id;
            this.anchor = Anchor.After;
            return;
          }
        }
      }
      return this.refAbsStart();
    }
    if (!chunk.del && this.anchor === Anchor.After) return;
    this.anchor = Anchor.After;
    this.id = this.prevId() || this.txt.str.id;
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
   */
  public move(skip: number): void {
    if (!skip) return;
    const anchor = this.anchor;
    if (anchor !== Anchor.After) this.refAfter();
    if (skip > 0) {
      const nextId = this.nextId(skip);
      if (!nextId) this.refAbsEnd();
      else {
        this.id = nextId;
        if (anchor !== Anchor.After) this.refBefore();
      }
    } else {
      const prevId = this.prevId(-skip);
      if (!prevId) this.refAbsStart();
      else {
        this.id = prevId;
        if (anchor !== Anchor.After) this.refBefore();
      }
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
