import {
  compare,
  tick,
  type ITimestampStruct,
  type ITimespanStruct,
  tss,
  printTs,
  containsId,
  Timestamp,
} from '../../../json-crdt-patch/clock';
import {isUint8Array} from '@jsonjoy.com/buffers/lib/isUint8Array';
import {printOctets} from '@jsonjoy.com/buffers/lib/printOctets';
import {rSplay, lSplay, llSplay, rrSplay, lrSplay, rlSplay} from 'sonic-forest/lib/splay/util';
import {splay2} from 'sonic-forest/lib/splay/util2';
import {insert2, remove2} from 'sonic-forest/lib/util2';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import {printTree} from 'tree-dump/lib/printTree';
import {printBinary} from 'tree-dump/lib/printBinary';
import {UndEndIterator, type UndEndNext} from '../../../util/iterator';

/**
 * @category CRDT Node
 */
export interface Chunk<T> {
  /** Unique sortable ID of this chunk and its span. */
  id: ITimestampStruct;
  /** Length of the logical clock interval of this chunk. */
  span: number;
  /** Whether this chunk is deleted. */
  del: boolean;
  /** Actual content of the chunk, may be undefined if chunk is deleted. */
  data: T | undefined;
  /** Length of content in this subtree (this node and its children). */
  len: number;
  /** Parent. */
  p: Chunk<T> | undefined;
  /** Left. */
  l: Chunk<T> | undefined;
  /** Right. */
  r: Chunk<T> | undefined;
  /** Parent 2. */
  p2: Chunk<T> | undefined;
  /** Left 2. */
  l2: Chunk<T> | undefined;
  /** Right 2. */
  r2: Chunk<T> | undefined;
  /** Split link, next chunk which was split from this chunk. */
  s: Chunk<T> | undefined;
  /** Add more content to this chunk. */
  merge(content: T): void;
  /**
   * Split this chunk after given clock ticks. Minimal `ticks` is 1.
   */
  split(ticks: number): Chunk<T>;
  /** Mark chunk as deleted. */
  delete(): void;
  /** Return a deep copy of itself. */
  clone(): Chunk<T>;
  /** Return the data of the chunk, if not deleted. */
  view(): T & {slice: (start: number, end: number) => T};
}

const compareById = (c1: Chunk<unknown>, c2: Chunk<unknown>): number => {
  const ts1 = c1.id;
  const ts2 = c2.id;
  return ts1.sid - ts2.sid || ts1.time - ts2.time;
};

const updateLenOne = (chunk: Chunk<unknown>): void => {
  const l = chunk.l;
  const r = chunk.r;
  chunk.len = (chunk.del ? 0 : chunk.span) + (l ? l.len : 0) + (r ? r.len : 0);
};

const updateLenOneLive = (chunk: Chunk<unknown>): void => {
  const l = chunk.l;
  const r = chunk.r;
  chunk.len = chunk.span + (l ? l.len : 0) + (r ? r.len : 0);
};

const dLen = (chunk: Chunk<unknown> | undefined, delta: number): void => {
  while (chunk) {
    chunk.len += delta;
    chunk = chunk.p;
  }
};

const next = <T>(curr: Chunk<T>): Chunk<T> | undefined => {
  const r = curr.r;
  if (r) {
    curr = r;
    let tmp: Chunk<T> | undefined;
    while ((tmp = curr.l)) curr = tmp;
    return curr;
  }
  let p = curr.p;
  while (p && p.r === curr) {
    curr = p;
    p = p.p;
  }
  return p;
};

const prev = <T>(curr: Chunk<T>): Chunk<T> | undefined => {
  const l = curr.l;
  if (l) {
    curr = l;
    let tmp: Chunk<T> | undefined;
    while ((tmp = curr.r)) curr = tmp;
    return curr;
  }
  let p = curr.p;
  while (p && p.l === curr) {
    curr = p;
    p = p.p;
  }
  return p;
};

/**
 * @category CRDT Node
 */
export abstract class AbstractRga<T, C extends Chunk<T> = Chunk<T>> {
  public root: Chunk<T> | undefined = undefined;
  public ids: Chunk<T> | undefined = undefined;
  public count: number = 0;

  public abstract view(): unknown;
  protected abstract createChunk(id: ITimestampStruct, content: T | undefined): Chunk<T>;
  protected abstract onChange(): void;

  constructor(public readonly id: ITimestampStruct) {}

  // --------------------------------------------------------------- Public API

  public ins(after: ITimestampStruct, id: ITimestampStruct, content: T): void {
    const rootId = this.id;
    const afterTime = after.time;
    const afterSid = after.sid;
    // TODO: perf: sid equality check is redundant? As it is implied by time equality.
    const isRootInsert = rootId.time === afterTime && rootId.sid === afterSid;
    if (isRootInsert) {
      this.insAfterRoot(after, id, content);
      return;
    }
    let curr: Chunk<T> | undefined = this.ids;
    let chunk: Chunk<T> | undefined = curr;
    while (curr) {
      const currId = curr.id;
      const currIdSid = currId.sid;
      if (currIdSid > afterSid) {
        curr = curr.l2;
      } else if (currIdSid < afterSid) {
        chunk = curr;
        curr = curr.r2;
      } else {
        const currIdTime = currId.time;
        if (currIdTime > afterTime) {
          curr = curr.l2;
        } else if (currIdTime < afterTime) {
          chunk = curr;
          curr = curr.r2;
        } else {
          chunk = curr;
          break;
        }
      }
    }
    if (!chunk) return;
    const atId = chunk.id;
    const atIdTime = atId.time;
    const atIdSid = atId.sid;
    const atSpan = chunk.span;
    if (atIdSid !== afterSid) return;
    const offset = afterTime - atIdTime;
    if (offset >= atSpan) return;
    const offsetInInsertAtChunk = afterTime - atIdTime;
    this.insAfterChunk(after, chunk, offsetInInsertAtChunk, id, content);
  }

  public insAt(position: number, id: ITimestampStruct, content: T): ITimestampStruct | undefined {
    if (!position) {
      const rootId = this.id;
      this.insAfterRoot(rootId, id, content);
      return rootId;
    }
    const found = this.findChunk(position - 1);
    if (!found) return undefined;
    const [at, offset] = found;
    const atId = at.id;
    const after = offset === 0 ? atId : new Timestamp(atId.sid, atId.time + offset);
    this.insAfterChunk(after, at, offset, id, content);
    return after;
  }

  protected insAfterRoot(after: ITimestampStruct, id: ITimestampStruct, content: T): void {
    const chunk = this.createChunk(id, content);
    const first = this.first();
    if (!first) this.setRoot(chunk);
    else if (compare(first.id, id) < 0) this.insertBefore(chunk, first);
    else {
      if (containsId(first.id, first.span, id)) return;
      this.insertAfterRef(chunk, after, first);
    }
  }

  protected insAfterChunk(
    after: ITimestampStruct,
    chunk: Chunk<T>,
    chunkOffset: number,
    id: ITimestampStruct,
    content: T,
  ): void {
    const atId = chunk.id;
    const atIdTime = atId.time;
    const atIdSid = atId.sid;
    const atSpan = chunk.span;
    const newChunk = this.createChunk(id, content);
    const needsSplit = chunkOffset + 1 < atSpan;
    if (needsSplit) {
      const idSid = id.sid;
      const idTime = id.time;
      if (atIdSid === idSid && atIdTime <= idTime && atIdTime + atSpan - 1 >= idTime) return;
      if (idTime > after.time + 1 || idSid > after.sid) {
        this.insertInside(newChunk, chunk, chunkOffset + 1);
        this.splay(newChunk);
        return;
      }
    }
    this.insertAfterRef(newChunk, after, chunk);
    this.splay(newChunk);
  }

  public delete(spans: ITimespanStruct[]): void {
    const length = spans.length;
    for (let i = 0; i < length; i++) this.deleteSpan(spans[i]);
    this.onChange();
  }

  protected deleteSpan(span: ITimespanStruct): void {
    const len = span.span;
    const t1 = span.time;
    const t2 = t1 + len - 1;
    const start = this.findById(span);
    if (!start) return;
    let chunk: Chunk<T> | undefined = start;
    let last: Chunk<T> | undefined = chunk;
    while (chunk) {
      last = chunk;
      const id = chunk.id;
      const chunkSpan = chunk.span;
      const c1 = id.time;
      const c2 = c1 + chunkSpan - 1;
      if (chunk.del) {
        if (c2 >= t2) break;
        chunk = chunk.s;
        continue;
      }
      const deleteStartsFromLeft = t1 <= c1;
      const deleteStartsInTheMiddle = t1 <= c2;
      if (deleteStartsFromLeft) {
        const deleteFullyContainsChunk = t2 >= c2;
        if (deleteFullyContainsChunk) {
          chunk.delete();
          dLen(chunk, -chunk.span);
          if (t2 <= c2) break;
        } else {
          const range = t2 - c1 + 1;
          const newChunk = this.split(chunk, range);
          chunk.delete();
          updateLenOne(newChunk);
          dLen(chunk, -chunk.span);
          break;
        }
      } else if (deleteStartsInTheMiddle) {
        const deleteContainsRightSide = t2 >= c2;
        if (deleteContainsRightSide) {
          const offset = t1 - c1;
          const newChunk = this.split(chunk, offset);
          newChunk.delete();
          newChunk.len = newChunk.r ? newChunk.r.len : 0;
          dLen(chunk, -newChunk.span);
          if (t2 <= c2) break;
        } else {
          const right = this.split(chunk, t2 - c1 + 1);
          const mid = this.split(chunk, t1 - c1);
          mid.delete();
          updateLenOne(right);
          updateLenOne(mid);
          dLen(chunk, -mid.span);
          break;
        }
      }
      chunk = chunk.s;
    }
    if (last) this.mergeTombstones2(start, last);
  }

  public find(position: number): undefined | ITimestampStruct {
    let curr = this.root;
    while (curr) {
      const l = curr.l;
      const leftLength = l ? l.len : 0;
      let span: number;
      if (position < leftLength) curr = l;
      else if (curr.del) {
        position -= leftLength;
        curr = curr.r;
      } else if (position < leftLength + (span = curr.span)) {
        const ticks = position - leftLength;
        const id = curr.id;
        return !ticks ? id : new Timestamp(id.sid, id.time + ticks);
      } else {
        position -= leftLength + span;
        curr = curr.r;
      }
    }
    return;
  }

  public findChunk(position: number): undefined | [chunk: Chunk<T>, offset: number] {
    let curr = this.root;
    while (curr) {
      const l = curr.l;
      const leftLength = l ? l.len : 0;
      let span: number;
      if (position < leftLength) curr = l;
      else if (curr.del) {
        position -= leftLength;
        curr = curr.r;
      } else if (position < leftLength + (span = curr.span)) {
        return [curr, position - leftLength];
      } else {
        position -= leftLength + span;
        curr = curr.r;
      }
    }
    return;
  }

  public findInterval(position: number, length: number): ITimespanStruct[] {
    const ranges: ITimespanStruct[] = [];
    if (!length) return ranges;
    let curr = this.root;
    let offset: number = 0;
    while (curr) {
      const leftLength = curr.l ? curr.l.len : 0;
      if (position < leftLength) curr = curr.l;
      else if (curr.del) {
        position -= leftLength;
        curr = curr.r;
      } else if (position < leftLength + curr.span) {
        offset = position - leftLength;
        break;
      } else {
        position -= leftLength + curr.span;
        curr = curr.r;
      }
    }
    if (!curr) return ranges;
    if (curr.span >= length + offset) {
      const id = curr.id;
      ranges.push(tss(id.sid, id.time + offset, length));
      return ranges;
    }
    const len = curr.span - offset;
    const id = curr.id;
    ranges.push(tss(id.sid, id.time + offset, len));
    length -= len;
    curr = next(curr);
    if (!curr) return ranges;
    do {
      if (curr.del) continue;
      const id = curr.id;
      const span = curr.span;
      if (length <= span) {
        ranges.push(tss(id.sid, id.time, length));
        return ranges;
      }
      ranges.push(tss(id.sid, id.time, span));
      length -= span;
    } while ((curr = next(curr)) && length > 0);
    return ranges;
  }

  /** Rename to .rangeX() method? */
  public findInterval2(from: ITimestampStruct, to: ITimestampStruct): ITimespanStruct[] {
    const ranges: ITimespanStruct[] = [];
    this.range0(undefined, from, to, (chunk, off, len) => {
      const id = chunk.id;
      ranges.push(tss(id.sid, id.time + off, len));
    });
    return ranges;
  }

  /**
   * @note All ".rangeX()" method are not performance optimized. For hot paths
   * it is better to hand craft the loop.
   *
   * @param startChunk Chunk from which to start the range. If undefined, the
   *                   chunk containing `from` will be used. This is an optimization
   *                   to avoid a lookup.
   * @param from ID of the first element in the range.
   * @param to ID of the last element in the range.
   * @param callback Function to call for each chunk slice in the range. If it
   *     returns truthy value, the iteration will stop.
   * @returns Reference to the last chunk in the range.
   */
  public range0(
    startChunk: Chunk<T> | undefined,
    from: ITimestampStruct,
    to: ITimestampStruct,
    callback: (chunk: Chunk<T>, off: number, len: number) => boolean | void,
  ): Chunk<T> | void {
    let chunk: Chunk<T> | undefined = startChunk ? startChunk : this.findById(from);
    if (startChunk) while (chunk && !containsId(chunk.id, chunk.span, from)) chunk = next(chunk);
    if (!chunk) return;
    if (!chunk.del) {
      const off: number = from.time - chunk.id.time;
      const toContainedInChunk = containsId(chunk.id, chunk.span, to);
      if (toContainedInChunk) {
        const len = to.time - from.time + 1;
        callback(chunk, off, len);
        return chunk;
      }
      const len = chunk.span - off;
      if (callback(chunk, off, len)) return chunk;
    } else {
      if (containsId(chunk.id, chunk.span, to)) return;
    }
    chunk = next(chunk);
    while (chunk) {
      const toContainedInChunk = containsId(chunk.id, chunk.span, to);
      // TODO: fast path for chunk.del
      if (toContainedInChunk) {
        if (!chunk.del) if (callback(chunk, 0, to.time - chunk.id.time + 1)) return chunk;
        return chunk;
      }
      if (!chunk.del) if (callback(chunk, 0, chunk.span)) return chunk;
      chunk = next(chunk);
    }
    return chunk;
  }

  // ---------------------------------------------------------------- Retrieval

  public first(): C | undefined {
    let curr = this.root as C;
    while (curr) {
      const l = curr.l;
      if (l) curr = l as C;
      else return curr;
    }
    return curr;
  }

  public last(): Chunk<T> | undefined {
    let curr = this.root as C;
    while (curr) {
      const r = curr.r;
      if (r) curr = r as C;
      else return curr;
    }
    return curr;
  }

  public lastId(): ITimestampStruct | undefined {
    const chunk = this.last();
    if (!chunk) return undefined;
    const id = chunk.id;
    const span = chunk.span;
    return span === 1 ? id : new Timestamp(id.sid, id.time + span - 1);
  }

  /** @todo Maybe use implementation from tree utils, if does not impact performance. */
  /** @todo Or better remove this method completely, as it does not require "this". */
  public next(curr: Chunk<T>): Chunk<T> | undefined {
    return next(curr);
  }

  /** @todo Maybe use implementation from tree utils, if does not impact performance. */
  /** @todo Or better remove this method completely, as it does not require "this". */
  public prev(curr: Chunk<T>): Chunk<T> | undefined {
    return prev(curr);
  }

  /** Content length. */
  public length(): number {
    const root = this.root;
    return root ? root.len : 0;
  }

  /** Number of chunks. */
  public size(): number {
    return this.count;
  }

  /** Returns the position of the first element in the chunk. */
  public pos(chunk: Chunk<T>): number {
    const p = chunk.p;
    const l = chunk.l;
    if (!p) return l ? l.len : 0;
    const parentPos = this.pos(p);
    const isRightChild = p.r === chunk;
    if (isRightChild) return parentPos + (p.del ? 0 : p.span) + (l ? l.len : 0);
    const r = chunk.r;
    return parentPos - (chunk.del ? 0 : chunk.span) - (r ? r.len : 0);
  }

  public chunks0(): UndEndNext<C> {
    let chunk: C | undefined = this.first();
    return () => {
      const result = chunk;
      if (chunk) chunk = next(chunk) as C | undefined;
      return result;
    };
  }

  public chunks(): UndEndIterator<C> {
    return new UndEndIterator(this.chunks0());
  }

  // --------------------------------------------------------------- Insertions

  public setRoot(chunk: Chunk<T>): void {
    this.root = chunk;
    this.insertId(chunk);
    this.onChange();
  }

  public insertBefore(chunk: Chunk<T>, before: Chunk<T>): void {
    const l = before.l;
    before.l = chunk;
    chunk.l = l;
    chunk.p = before;
    let lLen = 0;
    if (l) {
      l.p = chunk;
      lLen = l.len;
    }
    chunk.len = chunk.span + lLen;
    dLen(before, chunk.span);
    this.insertId(chunk);
    this.onChange();
  }

  public insertAfter(chunk: Chunk<T>, after: Chunk<T>): void {
    const r = after.r;
    after.r = chunk;
    chunk.r = r;
    chunk.p = after;
    let rLen = 0;
    if (r) {
      r.p = chunk;
      rLen = r.len;
    }
    chunk.len = chunk.span + rLen;
    dLen(after, chunk.span);
    this.insertId(chunk);
    this.onChange();
  }

  protected insertAfterRef(chunk: Chunk<T>, ref: ITimestampStruct, left: Chunk<T>): void {
    const id = chunk.id;
    const sid = id.sid;
    const time = id.time;
    let isSplit: boolean = false;
    for (;;) {
      const leftId = left.id;
      const leftNextTick = leftId.time + left.span;
      if (!left.s) {
        isSplit = leftId.sid === sid && leftNextTick === time && leftNextTick - 1 === ref.time;
        if (isSplit) left.s = chunk;
      }
      const right = next(left);
      if (!right) break;
      const rightId = right.id;
      const rightIdTime = rightId.time;
      const rightIdSid = rightId.sid;
      if (rightIdTime < time) break;
      if (rightIdTime === time) {
        if (rightIdSid === sid) return;
        if (rightIdSid < sid) break;
      }
      left = right;
    }
    if (isSplit && !left.del) {
      this.mergeContent(left, chunk.data!);
      left.s = undefined;
    } else this.insertAfter(chunk, left);
  }

  protected mergeContent(chunk: Chunk<T>, content: T): void {
    const span1 = chunk.span;
    chunk.merge(content);
    dLen(chunk, chunk.span - span1);
    this.onChange();
    return;
  }

  protected insertInside(chunk: Chunk<T>, at: Chunk<T>, offset: number): void {
    const p = at.p;
    const l = at.l;
    const r = at.r;
    const s = at.s;
    const len = at.len;
    const at2 = at.split(offset);
    at.s = at2;
    at2.s = s;
    at.l = at.r = at2.l = at2.r = undefined;
    at2.l = undefined;
    chunk.p = p;
    if (!l) {
      chunk.l = at;
      at.p = chunk;
    } else {
      chunk.l = l;
      l.p = chunk;
      const a = l.r;
      l.r = at;
      at.p = l;
      at.l = a;
      if (a) a.p = at;
    }
    if (!r) {
      chunk.r = at2;
      at2.p = chunk;
    } else {
      chunk.r = r;
      r.p = chunk;
      const b = r.l;
      r.l = at2;
      at2.p = r;
      at2.r = b;
      if (b) b.p = at2;
    }
    if (!p) this.root = chunk;
    else if (p.l === at) p.l = chunk;
    else p.r = chunk;
    updateLenOne(at);
    updateLenOne(at2);
    if (l) l.len = (l.l ? l.l.len : 0) + at.len + (l.del ? 0 : l.span);
    if (r) r.len = (r.r ? r.r.len : 0) + at2.len + (r.del ? 0 : r.span);
    chunk.len = len + chunk.span;
    const span = chunk.span;
    let curr = chunk.p;
    while (curr) {
      curr.len += span;
      curr = curr.p;
    }
    // TODO: perf: could insert these two ids in one go
    this.insertId(at2);
    this.insertIdFast(chunk);
    this.onChange();
  }

  protected split(chunk: Chunk<T>, ticks: number): Chunk<T> {
    const s = chunk.s;
    const newChunk = chunk.split(ticks);
    const r = chunk.r;
    chunk.s = newChunk;
    newChunk.r = r;
    newChunk.s = s;
    chunk.r = newChunk;
    newChunk.p = chunk;
    this.insertId(newChunk);
    if (r) r.p = newChunk;
    return newChunk;
  }

  protected mergeTombstones(ch1: Chunk<T>, ch2: Chunk<T>): boolean {
    if (!ch1.del || !ch2.del) return false;
    const id1 = ch1.id;
    const id2 = ch2.id;
    if (id1.sid !== id2.sid) return false;
    if (id1.time + ch1.span !== id2.time) return false;
    ch1.s = ch2.s;
    ch1.span += ch2.span;
    this.deleteChunk(ch2);
    return true;
  }

  protected mergeTombstones2(start: Chunk<T>, end: Chunk<T>): void {
    let curr: Chunk<T> | undefined = start;
    while (curr) {
      const nextCurr = next(curr);
      if (!nextCurr) break;
      const merged = this.mergeTombstones(curr, nextCurr);
      if (!merged) {
        if (nextCurr === end) {
          if (nextCurr) {
            const n = next(nextCurr);
            if (n) this.mergeTombstones(nextCurr, n);
          }
          break;
        }
        curr = curr.s;
      }
    }
    const left = prev(start);
    if (left) this.mergeTombstones(left, start);
  }

  public rmTombstones(): void {
    let curr = this.first();
    const list: Chunk<T>[] = [];
    while (curr) {
      if (curr.del) list.push(curr);
      curr = next(curr) as C | undefined;
    }
    for (let i = 0; i < list.length; i++) this.deleteChunk(list[i]);
  }

  public deleteChunk(chunk: Chunk<T>): void {
    this.deleteId(chunk);
    const p = chunk.p;
    const l = chunk.l;
    const r = chunk.r;
    chunk.id = ORIGIN; // mark chunk as disposed
    // TODO: perf: maybe set .p, .l, .r to undefined to help GC?
    if (!l && !r) {
      if (!p) this.root = undefined;
      else {
        if (p.l === chunk) p.l = undefined;
        else p.r = undefined;
      }
    } else if (l && r) {
      let mostRightChildFromLeft = l;
      while (mostRightChildFromLeft.r) mostRightChildFromLeft = mostRightChildFromLeft.r;
      mostRightChildFromLeft.r = r;
      r.p = mostRightChildFromLeft;
      const rLen = r.len;
      let curr: undefined | Chunk<T>;
      curr = mostRightChildFromLeft;
      if (!p) {
        this.root = l;
        l.p = undefined;
      } else {
        if (p.l === chunk) p.l = l;
        else p.r = l;
        l.p = p;
      }
      while (curr && curr !== p) {
        curr.len += rLen;
        curr = curr.p;
      }
    } else {
      const child = (l || r)!;
      child.p = p;
      if (!p) this.root = child;
      else if (p.l === chunk) p.l = child;
      else p.r = child;
    }
  }

  public insertId(chunk: Chunk<T>): void {
    this.ids = insert2(this.ids, chunk, compareById);
    this.count++;
    this.ids = splay2(this.ids, chunk);
  }

  public insertIdFast(chunk: Chunk<T>): void {
    this.ids = insert2(this.ids, chunk, compareById);
    this.count++;
  }

  protected deleteId(chunk: Chunk<T>): void {
    this.ids = remove2(this.ids, chunk);
    this.count--;
  }

  public findById(after: ITimestampStruct): Chunk<T> | undefined {
    const afterSid = after.sid;
    const afterTime = after.time;
    let curr: Chunk<T> | undefined = this.ids;
    let chunk: Chunk<T> | undefined = curr;
    while (curr) {
      const currId = curr.id;
      const currIdSid = currId.sid;
      if (currIdSid > afterSid) {
        curr = curr.l2;
      } else if (currIdSid < afterSid) {
        chunk = curr;
        curr = curr.r2;
      } else {
        const currIdTime = currId.time;
        if (currIdTime > afterTime) {
          curr = curr.l2;
        } else if (currIdTime < afterTime) {
          chunk = curr;
          curr = curr.r2;
        } else {
          chunk = curr;
          break;
        }
      }
    }
    if (!chunk) return;
    const atId = chunk.id;
    const atIdTime = atId.time;
    const atIdSid = atId.sid;
    const atSpan = chunk.span;
    if (atIdSid !== afterSid) return;
    if (afterTime < atIdTime) return;
    const offset = afterTime - atIdTime;
    if (offset >= atSpan) return;
    return chunk;
  }

  public posById(id: ITimestampStruct): number | undefined {
    const chunk = this.findById(id);
    if (!chunk) return;
    const pos = this.pos(chunk);
    return chunk.del ? pos : pos + (id.time - chunk.id.time);
  }

  /**
   * @param id ID of character to start the search from.
   * @returns Previous ID in the RGA sequence.
   */
  public prevId(id: ITimestampStruct): ITimestampStruct | undefined {
    let chunk = this.findById(id);
    if (!chunk) return;
    const time = id.time;
    if (chunk.id.time < time) return new Timestamp(id.sid, time - 1);
    chunk = prev(chunk);
    if (!chunk) return;
    const prevId = chunk.id;
    const span = chunk.span;
    return span > 1 ? new Timestamp(prevId.sid, prevId.time + chunk.span - 1) : prevId;
  }

  public spanView(span: ITimespanStruct): T[] {
    const view: T[] = [];
    let remaining = span.span;
    const time = span.time;
    let chunk = this.findById(span);
    if (!chunk) return view;
    if (!chunk.del) {
      if (chunk.span >= remaining + time - chunk.id.time) {
        const offset = time - chunk.id.time;
        const end = offset + remaining;
        const viewChunk = chunk.view().slice(offset, end);
        view.push(viewChunk);
        return view;
      } else {
        const offset = time - chunk.id.time;
        const viewChunk = chunk.view().slice(offset, span.span);
        remaining -= chunk.span - offset;
        view.push(viewChunk);
      }
    }
    while ((chunk = chunk.s)) {
      const chunkSpan = chunk.span;
      if (!chunk.del) {
        if (chunkSpan > remaining) {
          const viewChunk = chunk.view().slice(0, remaining);
          view.push(viewChunk);
          break;
        }
        view.push(chunk.data!);
      }
      remaining -= chunkSpan;
      if (remaining <= 0) break;
    }
    return view;
  }

  // ---------------------------------------------------------- Splay balancing

  public splay(chunk: Chunk<T>): void {
    const p = chunk.p;
    if (!p) return;
    const pp = p.p;
    const l2 = p.l === chunk;
    if (!pp) {
      if (l2) rSplay(chunk, p);
      else lSplay(chunk, p);
      this.root = chunk;
      updateLenOne(p);
      updateLenOneLive(chunk);
      return;
    }
    const l1 = pp.l === p;
    if (l1) {
      if (l2) {
        this.root = llSplay(this.root!, chunk, p, pp);
      } else {
        this.root = lrSplay(this.root!, chunk, p, pp);
      }
    } else {
      if (l2) {
        this.root = rlSplay(this.root!, chunk, p, pp);
      } else {
        this.root = rrSplay(this.root!, chunk, p, pp);
      }
    }
    updateLenOne(pp);
    updateLenOne(p);
    updateLenOneLive(chunk);
    this.splay(chunk);
  }

  // ---------------------------------------------------------- Export / Import

  public iterator(): () => Chunk<T> | undefined {
    let curr = this.first();
    return () => {
      const res = curr;
      if (curr) curr = next(curr) as C | undefined;
      return res;
    };
  }

  public ingest(size: number, next: () => Chunk<T>): void {
    if (size < 1) return;
    const splitLeftChunks = new Map<string, Chunk<T>>();
    this.root = this._ingest(size, () => {
      const chunk = next();
      const id = chunk.id;
      const key = id.sid + '.' + id.time;
      const split = splitLeftChunks.get(key);
      if (split) {
        split.s = chunk;
        splitLeftChunks.delete(key);
      }
      const nextStampAfterSpan = tick(id, chunk.span);
      splitLeftChunks.set(nextStampAfterSpan.sid + '.' + nextStampAfterSpan.time, chunk);
      return chunk;
    });
  }

  private _ingest(size: number, next: () => Chunk<T>): Chunk<T> {
    const leftSize = size >> 1;
    const rightSize = size - leftSize - 1;
    const c1 = leftSize > 0 ? this._ingest(leftSize, next) : undefined;
    const c2 = next();
    if (c1) {
      c2.l = c1;
      c1.p = c2;
    }
    const c3 = rightSize > 0 ? this._ingest(rightSize, next) : undefined;
    if (c3) {
      c2.r = c3;
      c3.p = c2;
    }
    updateLenOne(c2);
    // TODO: perf: splay only nodes with hight clock values and which are not tombstones?
    this.insertId(c2);
    return c2;
  }

  // ---------------------------------------------------------------- Printable

  protected toStringName(): string {
    return 'AbstractRga';
  }

  public toString(tab: string = ''): string {
    const view = this.view();
    let value = '';
    if (isUint8Array(view)) value += ` { ${printOctets(view) || '∅'} }`;
    else if (typeof view === 'string')
      value += `{ ${view.length > 32 ? JSON.stringify(view.substring(0, 32)) + ' …' : JSON.stringify(view)} }`;
    const header = `${this.toStringName()} ${printTs(this.id)} ${value}`;
    return header + printTree(tab, [(tab) => (this.root ? this.printChunk(tab, this.root) : '∅')]);
  }

  protected printChunk(tab: string, chunk: Chunk<T>): string {
    return (
      this.formatChunk(chunk) +
      printBinary(tab, [
        chunk.l ? (tab) => this.printChunk(tab, chunk.l!) : null,
        chunk.r ? (tab) => this.printChunk(tab, chunk.r!) : null,
      ])
    );
  }

  protected formatChunk(chunk: Chunk<T>): string {
    const id = printTs(chunk.id);
    let str = `chunk ${id}:${chunk.span} .${chunk.len}.`;
    if (chunk.del) str += ` [${chunk.span}]`;
    else {
      if (isUint8Array(chunk.data)) str += ` { ${printOctets(chunk.data) || '∅'} }`;
      else if (typeof chunk.data === 'string') {
        const data =
          chunk.data.length > 32 ? JSON.stringify(chunk.data.substring(0, 32)) + ' …' : JSON.stringify(chunk.data);
        str += ` { ${data} }`;
      }
    }
    return str;
  }
}
