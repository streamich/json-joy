/** Types of complex nodes. */
export const enum JsonCrdtNodeTypes {
  String = 0,
  Array = 1,
  Object = 2,
}

export type JsonCrdtNullNode = null;
export type JsonCrdtBooleanNode = boolean;
export type JsonCrdtNumberNode = number;

export type JsonCrdtAtom =
  | JsonCrdtNullNode
  | JsonCrdtBooleanNode
  | JsonCrdtNumberNode;

export type JsonCrdtRef = string;
export type JsonCrdtValue = JsonCrdtAtom | JsonCrdtRef;

export type JsonCrdtStringNode = [type: JsonCrdtNodeTypes.String, firstChunkRef: JsonCrdtRef];
export type JsonCrdtArrayNode = [type: JsonCrdtNodeTypes.Array, firstChunkRef: JsonCrdtRef];
export type JsonCrdtObjectNode = [type: JsonCrdtNodeTypes.Object, firstChunkRef: JsonCrdtRef];

export type JsonCrdtStringNodeChunk = [next: string, value: string];
export type JsonCrdtArrayNodeChunk = [leftChunkRef: string, rightChunkRef: string, value: JsonCrdtValue];
export type JsonCrdtObjectNodeChunk = [rightChunkRef: string, key: string, value: JsonCrdtValue];

export type JsonCrdtNode = 
  | JsonCrdtNullNode
  | JsonCrdtBooleanNode
  | JsonCrdtNumberNode
  | JsonCrdtStringNode
  | JsonCrdtArrayNode
  | JsonCrdtObjectNode;

export type JsonCrdtChunk =
  | JsonCrdtStringNodeChunk
  | JsonCrdtArrayNodeChunk
  | JsonCrdtObjectNodeChunk;

export type JsonCrdtRefEntry = JsonCrdtNode | JsonCrdtChunk

export interface JsonCrdtBlock {
  startRef: string;
  refs: Record<string, JsonCrdtRefEntry>;
}
