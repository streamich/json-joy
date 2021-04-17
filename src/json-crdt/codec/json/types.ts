/**
 * A structural snapshot of JSON CRDT model with logical time.
 */
export interface JsonCrdtLogicalSnapshot {
  /**
   * Vector clock which contains the latest values of all known logical clocks.
   * The first clock is the local clock of this document.
   */
  clock: JsonCrdtLogicalTimestamp[];

  /**
   * Root node of the document data model.
   */
  root: RootJsonCrdtNode<JsonCrdtLogicalTimestamp>;
}

/**
 * A serialized logical clock timestamp.
 */
export type JsonCrdtLogicalTimestamp = [sessionId: number, time: number];

/**
 * A structural snapshot of JSON CRDT model with server time.
 */
export interface JsonCrdtServerSnapshot {
  /**
   * Latest known time sequence number in this model.
   */
  time: JsonCrdtServerTimestamp;

  /**
   * Root node of the document data model.
   */
  root: RootJsonCrdtNode<JsonCrdtServerTimestamp>;
}

/**
 * A serialized server clock timestamp.
 */
export type JsonCrdtServerTimestamp = number;

/**
 * The root node of the document, implemented as LWW. Only one root node per
 * document is allowed.
 */
export interface RootJsonCrdtNode<Id> {
  type: 'root';
  id: Id;
  node: JsonCrdtNode<Id> | null;
}

/**
 * LWW JSON object node.
 */
export interface ObjectJsonCrdtNode<Id> {
  type: 'obj';
  id: Id;
  chunks: Record<string, ObjectJsonCrdtChunk<Id>>;
}

export interface ObjectJsonCrdtChunk<Id> {
  id: Id;
  node: JsonCrdtNode<Id>;
}

/**
 * RGA JSON array node.
 */
export interface ArrayJsonCrdtNode<Id> {
  type: 'arr';
  id: Id;
  chunks: (ArrayJsonCrdtChunk<Id> | JsonCrdtRgaTombstone<Id>)[];
}

export interface ArrayJsonCrdtChunk<Id> {
  id: Id;
  nodes: JsonCrdtNode<Id>[];
}

/**
 * RGA JSON string node.
 */
export interface StringJsonCrdtNode<Id> {
  type: 'str';
  id: Id;
  chunks: (StringJsonCrdtChunk<Id> | JsonCrdtRgaTombstone<Id>)[];
}

export interface StringJsonCrdtChunk<Id> {
  id: Id;
  value: string;
}

/**
 * A tombstone used in RGA nodes.
 */
export interface JsonCrdtRgaTombstone<Id> {
  id: Id;
  span: number;
}

/**
 * LWW register for any JSON value.
 */
export interface ValueJsonCrdtNode<Id> {
  type: 'val';
  id: Id;
  writeId: Id;
  value: unknown;
}

/**
 * A constant immutable JSON value.
 */
export interface ConstantJsonCrdtNode {
  type: 'const';
  value: unknown;
}

export type JsonCrdtNode<Id> =
  | ObjectJsonCrdtNode<Id>
  | ArrayJsonCrdtNode<Id>
  | StringJsonCrdtNode<Id>
  | ValueJsonCrdtNode<Id>
  | ConstantJsonCrdtNode;
