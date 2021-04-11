import type {JsonChunk} from '../../types';
import {LogicalTimestamp} from '../../../json-crdt-patch/clock';

export class StringChunk implements JsonChunk {
  public left: StringChunk | null = null;
  public right: StringChunk | null = null;

  /**
   * If this chunk is deleted, this `deleted` property contains the number of
   * elements this chunk used to contain.
   */
  public deleted?: number;

  /**
   * @param id Unique ID of the first element in this chunk
   * @param values Elements contained by this chunk. If `undefined`, means that
   *        this chunk was deleted by a subsequent operation.
   */
  constructor(public readonly id: LogicalTimestamp, public str?: string) {}

  /**
   * Returns "length" of this chunk, number of elements. Effectively the ID of
   * the chunk is the ID of the first element, each subsequent element in the
   * chunk has a monotonically increasing ID by one tick.
   *
   * @returns Number of elements in this chunk.
   */
  public span(): number {
    return this.deleted || this.str!.length;
  }

  /**
   * Splits this chunk into two, such that elements up to and including `time`
   * remain in this chunk and a new chunk is returns with all the remaining elements.
   *
   * @param time Last element ID which to keep in this chunk.
   * @returns New chunk which contains all the remaining elements.
   */
  public split(time: number): StringChunk {
    const newSpan = 1 + time - this.id.time;
    const newId = new LogicalTimestamp(this.id.sessionId, time + 1);
    if (this.str) {
      const newChunkStr = this.str.substr(newSpan);
      this.str = this.str.substr(0, newSpan);
      return new StringChunk(newId, newChunkStr);
    } else {
      const chunk = new StringChunk(newId, undefined);
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
    delete this.str;
  }

  /**
   * Merge into this chunk a subsequent chunk, which has IDs increasing without gaps.
   */
  public merge(substring: string) {
    this.str += substring;
  }

  /**
   * Returns a deep independent copy of itself.
   */
  public clone(): StringChunk {
    const chunk = new StringChunk(this.id, this.str);
    if (this.deleted) {
      chunk.deleted = this.deleted;
      delete chunk.str;
    }
    return chunk;
  }

  /**
   * @param tab Whitespace to print before any other output.
   * @returns Human readable representation of the array chunk.
   */
  public toString(tab: string = ''): string {
    let str = `${tab}StringChunk(${this.id.toDisplayString()}) { ${
      !this.str ? `[${this.deleted || this.span()}]` : this.str.length > 10 ? this.str.substr(0, 10) + '…' : this.str
    } }`;
    return str;
  }
}
