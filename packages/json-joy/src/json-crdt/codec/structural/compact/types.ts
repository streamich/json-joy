import type {JsonCrdtDataType} from '../../../../json-crdt-patch/constants';

export type JsonCrdtCompactDocument = [time: JsonCrdtCompactClockTable | number, root: JsonCrdtCompactNode | 0];

export type JsonCrdtCompactClockTable = number[];

export type JsonCrdtCompactTimestamp = JsonCrdtCompactTimestampServer | JsonCrdtCompactTimestampLogical;

export type JsonCrdtCompactTimestampServer = number;
export type JsonCrdtCompactTimestampLogical = [sessionId: number, time: number];

export type JsonCrdtCompactNode =
  | JsonCrdtCompactCon
  | JsonCrdtCompactVal
  | JsonCrdtCompactObj
  | JsonCrdtCompactVec
  | JsonCrdtCompactStr
  | JsonCrdtCompactBin
  | JsonCrdtCompactArr;

export type JsonCrdtCompactCon =
  | [type: JsonCrdtDataType.con, id: JsonCrdtCompactTimestamp, data: unknown]
  | [type: JsonCrdtDataType.con, id: JsonCrdtCompactTimestamp, data: 0, specialData: JsonCrdtCompactTimestamp | 0];

export type JsonCrdtCompactVal = [type: JsonCrdtDataType.val, id: JsonCrdtCompactTimestamp, child: JsonCrdtCompactNode];

export type JsonCrdtCompactObj = [
  type: JsonCrdtDataType.obj,
  id: JsonCrdtCompactTimestamp,
  map: Record<string, JsonCrdtCompactNode>,
];

export type JsonCrdtCompactVec = [
  type: JsonCrdtDataType.vec,
  id: JsonCrdtCompactTimestamp,
  map: (JsonCrdtCompactNode | 0)[],
];

export type JsonCrdtCompactStr = [
  type: JsonCrdtDataType.str,
  id: JsonCrdtCompactTimestamp,
  chunks: Array<JsonCrdtCompactStrChunk | JsonCrdtCompactTombstone>,
];

export type JsonCrdtCompactStrChunk = [id: JsonCrdtCompactTimestamp, data: string];

export type JsonCrdtCompactBin = [
  type: JsonCrdtDataType.bin,
  id: JsonCrdtCompactTimestamp,
  chunks: Array<JsonCrdtCompactBinChunk | JsonCrdtCompactTombstone>,
];

export type JsonCrdtCompactBinChunk = [id: JsonCrdtCompactTimestamp, data: Uint8Array];

export type JsonCrdtCompactArr = [
  type: JsonCrdtDataType.arr,
  id: JsonCrdtCompactTimestamp,
  chunks: Array<JsonCrdtCompactArrChunk | JsonCrdtCompactTombstone>,
];

export type JsonCrdtCompactArrChunk = [id: JsonCrdtCompactTimestamp, data: JsonCrdtCompactNode[]];

export type JsonCrdtCompactTombstone = [id: JsonCrdtCompactTimestamp, span: number];
