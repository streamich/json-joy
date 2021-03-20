export type JsonCodecTimestamp = [sessionId: number, time: number];

export interface JsonCodecPatch {
  /**
   * ID of the first operation in the patch.
   */
  id: JsonCodecTimestamp;

  /**
   * List of operations comprising this patch.
   */
  ops: JsonCodecOperation[];
}

export type JsonCodecOperation =
  | JsonCodecMakeObjectOperation
  | JsonCodecMakeArrayOperation
  | JsonCodecMakeStringOperation
  | JsonCodecMakeNumberOperation
  | JsonCodecSetRootOperation
  | JsonCodecSetObjectKeysOperation
  | JsonCodecInsertStringSubstringOperation
  | JsonCodecInsertArrayElementsOperation
  | JsonCodecDeleteStringSubstringOperation
  | JsonCodecDeleteArrayElementsOperation;

export interface JsonCodecMakeObjectOperation {
  op: 'obj';
}

export interface JsonCodecMakeArrayOperation {
  op: 'arr';
}

export interface JsonCodecMakeStringOperation {
  op: 'str';
}

export interface JsonCodecMakeNumberOperation {
  op: 'num';
}

export interface JsonCodecSetRootOperation {
  op: 'root';
  after: JsonCodecTimestamp;
  value: JsonCodecTimestamp;
}

export interface JsonCodecSetObjectKeysOperation {
  op: 'obj_ins';
  after: JsonCodecTimestamp;
  tuples: [key: string, value: JsonCodecTimestamp][];
}

export interface JsonCodecInsertStringSubstringOperation {
  op: 'str_ins';
  after: JsonCodecTimestamp;
  str: string;
}

export interface JsonCodecInsertArrayElementsOperation {
  op: 'arr_ins';
  after: JsonCodecTimestamp;
  values: JsonCodecTimestamp[];
}

export interface JsonCodecDeleteStringSubstringOperation {
  op: 'str_del';
  after: JsonCodecTimestamp;
  /** Defaults to 1 if omitted. */
  len?: number;
}

export interface JsonCodecDeleteArrayElementsOperation {
  op: 'arr_del';
  after: JsonCodecTimestamp;
  /** Defaults to 1 if omitted. */
  len?: number;
}
