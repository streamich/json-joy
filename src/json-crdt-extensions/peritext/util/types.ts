import type {Chunk} from '../../../json-crdt/nodes/rga';

export type StringChunk = Chunk<string>;

export interface IChunkSlice<T = string> {
  readonly chunk: Chunk<T>;
  view(): T;
}
