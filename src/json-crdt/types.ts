export type JsonCrdtNullNode = null;
export type JsonCrdtBooleanNode = boolean;
export type JsonCrdtNumberNode = number;

/** Types of nodes represented by a non-null object. */
export const enum JsonCrdtNodeTypes {
  Array = 0,
  Object = 1,
  String = 2,
}

/** A node representing "complex" types: string, array, map. */
export interface JsonCrdtComplexNode<Chunk> {
  /** Identifier of the node type. */
  t: JsonCrdtNodeTypes;
  /** Linked list first chunk. */
  l: string;
  /** Linked list last chunk. */
  r: string;
  /** Chunk ID to chunk mapping. */
  c: Record<string, undefined | Chunk>;
}

/** A linked list entry, which represents a part of a complex node. */
export interface JsonCrdtChunk<Content> {
  /** Original item to the left when this chunk was inserted. */
  l0?: string;
  /** Current item to the left. */
  l1?: string;
  /** Original item to the right when this chunk was inserted. */
  r0?: string;
  /** Current item to the right. */
  r1?: string;
  /** Chunk's content value. */
  c?: Content;
}

export type JsonCrdtStringNodeChunk = JsonCrdtChunk<string>;
export interface JsonCrdtStringNode extends JsonCrdtComplexNode<JsonCrdtStringNodeChunk> {
  t: JsonCrdtNodeTypes.String;
}

export type JsonCrdtArrayNodeChunk = JsonCrdtChunk<JsonCrdtNode>;
export interface JsonCrdtArrayNode extends JsonCrdtComplexNode<JsonCrdtArrayNodeChunk> {
  t: JsonCrdtNodeTypes.Array;
}

export type JsonCrdtObjectNodeChunk = JsonCrdtChunk<[key: string, value: JsonCrdtNode]>;
export interface JsonCrdtObjectNode extends JsonCrdtComplexNode<JsonCrdtObjectNodeChunk> {
  t: JsonCrdtNodeTypes.Object;
}

export type JsonCrdtNode = 
  | JsonCrdtNullNode
  | JsonCrdtBooleanNode
  | JsonCrdtNumberNode
  | JsonCrdtStringNode
  | JsonCrdtArrayNode
  | JsonCrdtObjectNode;

export interface JsonCrdtBlock {
  node: JsonCrdtNode;
}
