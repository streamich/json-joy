import {CONST, updateNum} from '../../../json-hash';
import {updateId} from '../../../json-crdt/hash';
import {ITimestampStruct, Timestamp, toDisplayString} from '../../../json-crdt-patch/clock';
import type {StringChunk, IChunkSlice} from './types';
import type {Stateful} from '../types';
import type {Printable} from '../../../util/print/types';

export class ChunkSlice implements IChunkSlice, Stateful, Printable {
  constructor(
    /** Chunk from which slice is computed. */
    chunk: StringChunk,
    /** Start offset of the slice within the chunk. */
    public off: number,
    /** Length of the slice. */
    public len: number,
  ) {
    this.chunk = chunk;
  }

  // -------------------------------------------------------------- IChunkSlice

  public readonly chunk: StringChunk;

  public id(): ITimestampStruct {
    const id = this.chunk.id;
    const off = this.off;
    return !off ? id : new Timestamp(id.sid, id.time + off);
  }

  public key(): number | string {
    const id = this.chunk.id;
    const sid = id.sid;
    const time = id.time + this.off;
    return sid.toString(36) + time.toString(36);
  }

  public view(): string {
    const str = this.chunk.data;
    if (!str) return '';
    // TODO: perf: if whole chunk is sliced, return chunk.data directly.
    return str.slice(this.off, this.off + this.len);
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    const {chunk, off, len} = this;
    const delOffLenState = (((off << 16) + len) << 1) + +chunk.del;
    let state = CONST.START_STATE;
    state = updateId(state, chunk.id);
    state = updateNum(state, delOffLenState);
    return (this.hash = state);
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const name = this.constructor.name;
    const off = this.off;
    const len = this.len;
    const str = this.view();
    const truncate = str.length > 32;
    const text = JSON.stringify(truncate ? str.slice(0, 32) : str) + (truncate ? ' …' : '');
    const id = toDisplayString(this.chunk.id);
    return `${name} ${id} [${off}..${off + len}) ${text}`;
  }
}
