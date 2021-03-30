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
  | JsonCodecMakeConstantOperation
  | JsonCodecSetRootOperation
  | JsonCodecSetObjectKeysOperation
  | JsonCodecSetNumberOperation
  | JsonCodecInsertStringSubstringOperation
  | JsonCodecInsertArrayElementsOperation
  | JsonCodecDeleteOperation
  | JsonCodecNoopOperation;

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

export interface JsonCodecMakeConstantOperation {
  op: 'const';
  value: unknown;
}

export interface JsonCodecSetRootOperation {
  op: 'root';
  value: JsonCodecTimestamp;
}

export interface JsonCodecSetObjectKeysOperation {
  op: 'obj_set';
  obj: JsonCodecTimestamp;
  tuples: [key: string, value: JsonCodecTimestamp][];
}

export interface JsonCodecSetNumberOperation {
  op: 'num_set';
  after: JsonCodecTimestamp;
  value: number;
}

export interface JsonCodecInsertStringSubstringOperation {
  /** Mnemonic. */
  op: 'str_ins';
  /** String into which to insert the substring. */
  obj: JsonCodecTimestamp;
  /** If `after` is omitted, it means the insertion is at the start of the string. */
  after?: JsonCodecTimestamp;
  /** The substring to insert in the string. */
  value: string;
}

export interface JsonCodecInsertArrayElementsOperation {
  /** Mnemonic. */
  op: 'arr_ins';
  /** Array into which to insert the elements. */
  obj: JsonCodecTimestamp;
  /** If `after` is omitted, it means the insertion is at the start of the array. */
  after?: JsonCodecTimestamp;
  /** Values to insert in the array. */
  values: JsonCodecTimestamp[];
}

export interface JsonCodecDeleteOperation {
  op: 'del';
  /** Object in which to delete something. */
  obj: JsonCodecTimestamp;
  /** First operation to delete. */
  after: JsonCodecTimestamp;
  /** Defaults to 1, if omitted. */
  len?: number;
}

export interface JsonCodecNoopOperation {
  op: 'noop';
  /** Defaults to 1, if omitted. */
  len?: number;
}
