/**
 * A structural snapshot of JSON CRDT model.
 */
export interface JsonCrdtSnapshot {
  /**
   * Vector clock which contains the latest values of all known logical clocks.
   * The first clock is the local clock of this document.
   */
  time: JsonCrdtServerTimestamp | JsonCrdtLogicalTimestamp[];

  /**
   * Root node of the document data model.
   */
  root: ValueJsonCrdtNode;
}

export type JsonCrdtTimestamp = JsonCrdtServerTimestamp | JsonCrdtLogicalTimestamp;

/**
 * A serialized logical clock timestamp.
 */
export type JsonCrdtLogicalTimestamp = [sessionId: number, time: number];

/**
 * A serialized server clock timestamp.
 */
export type JsonCrdtServerTimestamp = number;

/**
 * A constant immutable JSON value.
 */
export interface ConstantJsonCrdtNode {
  type: 'con';
  id: JsonCrdtTimestamp;
  timestamp?: boolean;
  value?: unknown | JsonCrdtTimestamp;
}

/**
 * LWW register for any JSON value.
 */
export interface ValueJsonCrdtNode {
  type: 'val';
  id: JsonCrdtTimestamp;
  value: JsonCrdtNode;
}

/**
 * LWW JSON object node.
 */
export interface ObjectJsonCrdtNode {
  type: 'obj';
  id: JsonCrdtTimestamp;
  map: Record<string, JsonCrdtNode>;
}

/**
 * Tuple (LWW JSON array) node.
 */
export interface VectorJsonCrdtNode {
  type: 'vec';
  id: JsonCrdtTimestamp;
  map: (null | JsonCrdtNode)[];
}

/**
 * RGA JSON string node.
 */
export interface StringJsonCrdtNode {
  type: 'str';
  id: JsonCrdtTimestamp;
  chunks: (StringJsonCrdtChunk | JsonCrdtRgaTombstone)[];
}

export interface StringJsonCrdtChunk {
  id: JsonCrdtTimestamp;
  value: string;
}

/**
 * RGA binary node.
 */
export interface BinaryJsonCrdtNode {
  type: 'bin';
  id: JsonCrdtTimestamp;
  chunks: (BinaryJsonCrdtChunk | JsonCrdtRgaTombstone)[];
}

export interface BinaryJsonCrdtChunk {
  id: JsonCrdtTimestamp;
  value: string;
}

/**
 * RGA JSON array node.
 */
export interface ArrayJsonCrdtNode {
  type: 'arr';
  id: JsonCrdtTimestamp;
  chunks: (ArrayJsonCrdtChunk | JsonCrdtRgaTombstone)[];
}

export interface ArrayJsonCrdtChunk {
  id: JsonCrdtTimestamp;
  value: JsonCrdtNode[];
}

/**
 * A tombstone used in RGA nodes.
 */
export interface JsonCrdtRgaTombstone {
  id: JsonCrdtTimestamp;
  span: number;
}

export type JsonCrdtNode =
  | ObjectJsonCrdtNode
  | VectorJsonCrdtNode
  | ArrayJsonCrdtNode
  | StringJsonCrdtNode
  | BinaryJsonCrdtNode
  | ValueJsonCrdtNode
  | ConstantJsonCrdtNode;
