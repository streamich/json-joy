import type {JsonChunk} from '../../types';
import {LogicalTimestamp, ITimestamp} from '../../../json-crdt-patch/clock';

export class BinaryChunk implements JsonChunk {
  public left: BinaryChunk | null = null;
  public right: BinaryChunk | null = null;

  /**
   * If this chunk is deleted, this `deleted` property contains the number of
   * elements this chunk used to contain.
   */
  public deleted?: number;

  /**
   * @param id Unique ID of the first element in this chunk
   * @param buf Elements contained by this chunk. If `undefined`, means that
   *        this chunk was deleted by a subsequent operation.
   */
  constructor(public readonly id: ITimestamp, public buf?: Uint8Array) {}

  /**
   * Returns "length" of this chunk, number of elements. Effectively the ID of
   * the chunk is the ID of the first element, each subsequent element in the
   * chunk has a monotonically increasing ID by one tick.
   *
   * @returns Number of elements in this chunk.
   */
  public span(): number {
    return this.deleted || this.buf!.byteLength;
  }

  /**
   * Splits this chunk into two, such that elements up to and including `time`
   * remain in this chunk and a new chunk it returns is with all the remaining elements.
   *
   * @param time Last element ID which to keep in this chunk.
   * @returns New chunk which contains all the remaining elements.
   */
  public split(time: number): BinaryChunk {
    const newSpan = 1 + time - this.id.time;
    const newId = new LogicalTimestamp(this.id.getSessionId(), time + 1);
    if (this.buf) {
      const newChunkStr = this.buf.subarray(newSpan);
      this.buf = this.buf.subarray(0, newSpan);
      return new BinaryChunk(newId, newChunkStr);
    } else {
      const chunk = new BinaryChunk(newId, undefined);
      chunk.deleted = this.span() - newSpan;
      this.deleted = newSpan;
      return chunk;
    }
  }

  /**
   * Mark this chunk as deleted and dispose of the contents.
   */
  public delete() {
    this.deleted = this.span();
    delete this.buf;
  }

  /**
   * Merge into this chunk a subsequent chunk, which has IDs increasing without gaps.
   */
  public merge(buf: Uint8Array) {
    if (this.deleted) {
      this.deleted += buf.length;
      return;
    }
    const length = this.buf!.length;
    const combined = new Uint8Array(length + buf.length);
    combined.set(this.buf!);
    combined.set(buf, length);
    this.buf = combined;
  }

  /**
   * Returns a deep independent copy of itself.
   */
  public clone(): BinaryChunk {
    const chunk = new BinaryChunk(this.id, this.buf);
    if (this.deleted) {
      chunk.deleted = this.deleted;
      delete chunk.buf;
    }
    return chunk;
  }

  /**
   * @param tab Whitespace to print before any other output.
   * @returns Human readable representation of the array chunk.
   */
  public toString(tab: string = ''): string {
    const str = `${tab}${this.constructor.name}(${this.id.toDisplayString()}) { ${
      !this.buf ? `[${this.deleted || this.span()}]` : this.buf.length > 10 ? this.buf.subarray(0, 10).toString() + ',…' : this.buf.toString()
    } }`;
    return str;
  }
}
