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
  | JsonCodecSetNumberOperation
  | JsonCodecInsertStringSubstringOperation
  | JsonCodecInsertArrayElementsOperation
  | JsonCodecDeleteOperation;

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
  op: 'obj_set';
  after: JsonCodecTimestamp;
  tuples: [key: string, value: JsonCodecTimestamp][];
}

export interface JsonCodecSetNumberOperation {
  op: 'num_set';
  after: JsonCodecTimestamp;
  value: number;
}

export interface JsonCodecInsertStringSubstringOperation {
  op: 'str_ins';
  after: JsonCodecTimestamp;
  value: string;
}

export interface JsonCodecInsertArrayElementsOperation {
  op: 'arr_ins';
  after: JsonCodecTimestamp;
  values: JsonCodecTimestamp[];
}

export interface JsonCodecDeleteOperation {
  op: 'del';
  after: JsonCodecTimestamp;
  /** Defaults to 1 if omitted. */
  len?: number;
}
