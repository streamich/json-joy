export type JsonCrdtNullNode = null;
export type JsonCrdtBooleanNode = boolean;
export type JsonCrdtNumberNode = number;

/** Types of nodes represented by a non-null object. */
export const enum JsonCrdtNodeTypes {
  Array = 0,
  Object = 1,
  String = 2,
}

/** A node representing string as a linked list. */
export interface JsonCrdtStringNode {
  /** Identifier for string node. */
  t: JsonCrdtNodeTypes.String;
  /** Linked list first chunk. */
  l: string;
  /** Linked list last chunk. */
  r: string;
  /** Chunk ID to chunk mapping. */
  chunks: Record<string, undefined | JsonCrdtStringNodeChunk>;
}

export interface JsonCrdtStringNodeChunk {
  /** Original item to the left when this chunk was inserted. */
  l0?: string;
  /** Current item to the left. */
  l1?: string;
  /** Original item to the right when this chunk was inserted. */
  r0?: string;
  /** Current item to the right. */
  r1?: string;
  /** Chunk string value. */
  val?: string;
}

export interface JsonCrdtArrayNode {
  t: JsonCrdtNodeTypes.Array;
  l: string;
  r: string;
  chunks: Record<string, undefined | JsonCrdtArrayNodeChunk>;
}

export interface JsonCrdtArrayNodeChunk {
  l0?: string;
  l1?: string;
  r0?: string;
  r1?: string;
  val?: JsonCrdtNode;
}

export interface JsonCrdtObjectNode {
  t: JsonCrdtNodeTypes.Object;
  l: string;
  r: string;
  chunks: Record<string, undefined | JsonCrdtObjectNodeChunk>;
}

export interface JsonCrdtObjectNodeChunk {
  l0?: string;
  l1?: string;
  r0?: string;
  r1?: string;
  key: string;
  val?: JsonCrdtNode;
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
