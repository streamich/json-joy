/**
 * A structural snapshot of JSON CRDT model.
 */
export interface JsonCrdtVerboseDocument {
  /**
   * Vector clock which contains the latest values of all known logical clocks.
   * The first clock is the local clock of this document.
   */
  time: JsonCrdtVerboseServerTimestamp | JsonCrdtVerboseLogicalTimestamp[];

  /**
   * Root node of the document data model.
   */
  root: JsonCrdtVerboseVal;
}

export type JsonCrdtVerboseTimestamp = JsonCrdtVerboseServerTimestamp | JsonCrdtVerboseLogicalTimestamp;

/**
 * A serialized logical clock timestamp.
 */
export type JsonCrdtVerboseLogicalTimestamp = [sessionId: number, time: number];

/**
 * A serialized server clock timestamp.
 */
export type JsonCrdtVerboseServerTimestamp = number;

/**
 * A constant immutable JSON value.
 */
export interface JsonCrdtVerboseCon {
  type: 'con';
  id: JsonCrdtVerboseTimestamp;
  timestamp?: boolean;
  value?: unknown | JsonCrdtVerboseTimestamp;
}

/**
 * LWW register for any JSON value.
 */
export interface JsonCrdtVerboseVal {
  type: 'val';
  id: JsonCrdtVerboseTimestamp;
  value: JsonCrdtNode;
}

/**
 * LWW JSON object node.
 */
export interface JsonCrdtVerboseObj {
  type: 'obj';
  id: JsonCrdtVerboseTimestamp;
  map: Record<string, JsonCrdtNode>;
}

/**
 * Tuple (LWW JSON array) node.
 */
export interface JsonCrdtVerboseVec {
  type: 'vec';
  id: JsonCrdtVerboseTimestamp;
  map: (null | JsonCrdtNode)[];
}

/**
 * RGA JSON string node.
 */
export interface JsonCrdtVerboseStr {
  type: 'str';
  id: JsonCrdtVerboseTimestamp;
  chunks: (JsonCrdtVerboseStrChunk | JsonCrdtVerboseTombstone)[];
}

export interface JsonCrdtVerboseStrChunk {
  id: JsonCrdtVerboseTimestamp;
  value: string;
}

/**
 * RGA binary node.
 */
export interface JsonCrdtVerboseBin {
  type: 'bin';
  id: JsonCrdtVerboseTimestamp;
  chunks: (JsonCrdtVerboseBinChunk | JsonCrdtVerboseTombstone)[];
}

export interface JsonCrdtVerboseBinChunk {
  id: JsonCrdtVerboseTimestamp;
  value: string;
}

/**
 * RGA JSON array node.
 */
export interface JsonCrdtVerboseArr {
  type: 'arr';
  id: JsonCrdtVerboseTimestamp;
  chunks: (JsonCrdtVerboseArrChunk | JsonCrdtVerboseTombstone)[];
}

export interface JsonCrdtVerboseArrChunk {
  id: JsonCrdtVerboseTimestamp;
  value: JsonCrdtNode[];
}

/**
 * A tombstone used in RGA nodes.
 */
export interface JsonCrdtVerboseTombstone {
  id: JsonCrdtVerboseTimestamp;
  span: number;
}

export type JsonCrdtNode =
  | JsonCrdtVerboseObj
  | JsonCrdtVerboseVec
  | JsonCrdtVerboseArr
  | JsonCrdtVerboseStr
  | JsonCrdtVerboseBin
  | JsonCrdtVerboseVal
  | JsonCrdtVerboseCon;
