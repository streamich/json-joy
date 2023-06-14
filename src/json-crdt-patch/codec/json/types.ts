export type JsonCodecTimestamp = [sessionId: number, time: number] | number;
export type JsonCodecTimespan = [sessionId: number, time: number, span: number];

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
  | JsonCodecMakeTupleOperation
  | JsonCodecMakeStringOperation
  | JsonCodecMakeBinaryOperation
  | JsonCodecMakeValueOperation
  | JsonCodecMakeConstantOperation
  | JsonCodecSetRootOperation
  | JsonCodecSetObjectKeysOperation
  | JsonCodecSetValueOperation
  | JsonCodecInsertStringSubstringOperation
  | JsonCodecBinaryInsertDataOperation
  | JsonCodecInsertArrayElementsOperation
  | JsonCodecDeleteOperation
  | JsonCodecNoopOperation;

export interface JsonCodecMakeObjectOperation {
  op: 'obj';
}

export interface JsonCodecMakeArrayOperation {
  op: 'arr';
}

export interface JsonCodecMakeTupleOperation {
  op: 'tup';
}

export interface JsonCodecMakeStringOperation {
  op: 'str';
}

export interface JsonCodecMakeBinaryOperation {
  op: 'bin';
}

export interface JsonCodecMakeValueOperation {
  op: 'val';
  value: JsonCodecTimestamp;
}

export interface JsonCodecMakeConstantOperation {
  op: 'const';
  timestamp?: boolean;
  value?: unknown | JsonCodecTimestamp;
}

export interface JsonCodecSetRootOperation {
  op: 'root';
  value: JsonCodecTimestamp;
}

export interface JsonCodecSetObjectKeysOperation {
  op: 'obj_set';
  obj: JsonCodecTimestamp;
  tuples: [key: string | number, value: JsonCodecTimestamp][];
}

export interface JsonCodecSetValueOperation {
  op: 'val_set';
  obj: JsonCodecTimestamp;
  value: JsonCodecTimestamp;
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

export interface JsonCodecBinaryInsertDataOperation {
  /** Mnemonic. */
  op: 'bin_ins';
  /** Binary into which to insert the substring. */
  obj: JsonCodecTimestamp;
  /** If `after` is omitted, it means the insertion is at the start of the binary. */
  after?: JsonCodecTimestamp;
  /** The binary data to insert, encoded using Base64. */
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
  /** Range of content to delete. */
  what: JsonCodecTimespan[];
}

export interface JsonCodecNoopOperation {
  op: 'noop';
  /** Defaults to 1, if omitted. */
  len?: number;
}
