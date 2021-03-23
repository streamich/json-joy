import type {JsonChunk} from '../types';
import {LogicalTimestamp} from '../../json-crdt-patch/clock';

export class ArrayChunk implements JsonChunk {
  public left: ArrayChunk | null = null;
  public right: ArrayChunk | null = null;

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
  constructor(public readonly id: LogicalTimestamp, public values: undefined | LogicalTimestamp[]) {}

  /**
   * Returns "length" of this chunk, number of elements. Effectively the ID of
   * the chunk is the ID of the first element, each subsequent element in the
   * chunk has a monotonically increasing ID by one tick.
   * 
   * @returns Number of elements in this chunk.
   */
  public span(): number {
    return this.deleted || this.values!.length;
  }

  /**
   * Splits this chunk into two, such that elements up to and including `splitId`
   * remain in this chunk and a new chunk is returns with all the remaining elements.
   * 
   * @param time Last element ID which to keep in this chunk.
   * @returns New chunk which contains all the remaining elements.
   */
  public split(time: number): ArrayChunk {
    const newSpan = 1 + time - this.id.time;
    const newId = new LogicalTimestamp(this.id.sessionId, time + 1);
    if (this.values) {
      const newChunkValues = this.values.splice(newSpan);
      return new ArrayChunk(newId, newChunkValues);
    } else {
      const chunk = new ArrayChunk(newId, undefined);
      chunk.deleted = this.span() - newSpan;
      this.deleted = newSpan;
      return chunk;
    }
  }

  public delete() {
    this.deleted = this.span();
    delete this.values;
  }

  /**
   * @param tab Whitespace to print before any other output.
   * @returns Human readable representation of the array chunk.
   */
  public toString(tab: string = ''): string {
    let str = `${tab}ArrayChunk(${this.id.toDisplayString()}) { ${this.deleted ? `[${this.deleted}]` : this.values!.map(val => val.toString()).join(', ')} }`;
    return str;
  }
}
