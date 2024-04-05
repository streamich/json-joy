import type {Chunk} from "../../../json-crdt/nodes/rga";

export type StringChunk = Chunk<string>;

export interface IChunkSlice {
  readonly chunk: StringChunk;
  view(): string;
}
