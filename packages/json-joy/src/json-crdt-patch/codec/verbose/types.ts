/**
 * Represents a JSON CRDT Patch object.
 */
export interface JsonCodecPatch {
  /**
   * ID of the first operation in the patch. IDs of subsequent operations are
   * derived from this ID.
   */
  id: [sessionId: number, time: number];

  /**
   * List of operations comprising this patch. Patches are atomic, so all
   * operations are applied at once. "time" part of the IDs of all operations
   * is incremented by size of each operation in the patch.
   */
  ops: JsonCodecOperation[];

  /** Custom metadata. */
  meta?: unknown;
}

/**
 * Represents a JSON CRDT Patch operation.
 */
export type JsonCodecOperation =
  | JsonCodecNewConOperation
  | JsonCodecNewValOperation
  | JsonCodecNewObjOperation
  | JsonCodecNewVecOperation
  | JsonCodecNewStrOperation
  | JsonCodecNewBinOperation
  | JsonCodecNewArrOperation
  | JsonCodecInsValOperation
  | JsonCodecInsObjOperation
  | JsonCodecInsVecOperation
  | JsonCodecInsStrOperation
  | JsonCodecInsBinOperation
  | JsonCodecInsArrOperation
  | JsonCodecUpdArrOperation
  | JsonCodecDelOperation
  | JsonCodecNopOperation;

/**
 * Represents a logical clock timestamp. If number, it is a relative timestamp
 * and is relative to the patch ID. If array, it is an absolute timestamp, where
 * array is a tuple of `[sessionId, time]`.
 */
export type JsonCodecTimestamp =
  | [
      /** A random site ID. */
      sessionId: number,
      /** A logical clock sequence number. */
      time: number,
    ]
  | number;

/**
 * Represents a logical clock timespan. Timespan is a logical clock timestamp
 * with an additional `span` property, which is a number representing the length
 * of the timespan.
 */
export type JsonCodecTimespan = [
  /** A random site ID. */
  sessionId: number,
  /** A logical clock sequence number. */
  time: number,
  /**
   * Length of the timespan, including the first timestamp identified by the
   * `sessionId` and `time` properties.
   */
  span: number,
];

/**
 * Represents a JSON CRDT Patch operation mnemonic.
 */
export type JsonCrdtPatchMnemonic =
  | 'new_con'
  | 'new_val'
  | 'new_obj'
  | 'new_vec'
  | 'new_str'
  | 'new_bin'
  | 'new_arr'
  | 'ins_val'
  | 'ins_obj'
  | 'ins_vec'
  | 'ins_str'
  | 'ins_bin'
  | 'ins_arr'
  | 'upd_arr'
  | 'del'
  | 'nop';

export interface JsonCodecOperationBase<T extends JsonCrdtPatchMnemonic> {
  /** Mnemonic. */
  op: T;
}

export type NotUndefined<T> = T extends undefined ? never : T;

/**
 * Operations which creates a new "con" Constant data type. Constant CRDT data
 * types are immutable and cannot be changed after creation.
 */
export interface JsonCodecNewConOperation extends JsonCodecOperationBase<'new_con'> {
  /**
   * Literal JSON value, which can also contain binary data; or, a logical clock
   * timestamp.
   */
  value?: NotUndefined<unknown> | JsonCodecTimestamp;

  /** If true, the `value` is a timestamp. */
  timestamp?: boolean;
}

/**
 * Operation which creates a new "val" CRDT data type, which is a
 * Last-Write-Wins Register of a pointer to another CRDT data type.
 */
export type JsonCodecNewValOperation = JsonCodecOperationBase<'new_val'>;

/**
 * Operation which creates a new "object" CRDT data type, which is a map of
 * key-value pairs. Keys are strings. The values of the map are Last-Write-Wins
 * Registers of pointers to other CRDT data types.
 */
export type JsonCodecNewObjOperation = JsonCodecOperationBase<'new_obj'>;

/**
 * Operation which creates a new "vec" CRDT data type, which is a vector
 * of indexed contiguously starting from zero. The values of the vector are
 * Last-Write-Wins Registers of pointers to other CRDT data types.
 */
export type JsonCodecNewVecOperation = JsonCodecOperationBase<'new_vec'>;

/**
 * Operation which creates a new "str" CRDT data type, which is an RGA
 * (Replicated Growable Array) of JavaScript (UTF-16) characters.
 */
export type JsonCodecNewStrOperation = JsonCodecOperationBase<'new_str'>;

/**
 * Operation which creates a new "bin" CRDT data type, which is an RGA
 * (Replicated Growable Array) of binary octet data.
 */
export type JsonCodecNewBinOperation = JsonCodecOperationBase<'new_bin'>;

/**
 * Operation which creates a new "arr" CRDT data type, which is an RGA
 * (Replicated Growable Array) of immutable pointers to other CRDT data types.
 */
export type JsonCodecNewArrOperation = JsonCodecOperationBase<'new_arr'>;

/**
 * Inserts contents into a CRDT object. The `obj` property specifies the
 * object on which to perform the operation.
 */
export interface JsonCodecObjectOperation<T extends JsonCrdtPatchMnemonic> extends JsonCodecOperationBase<T> {
  /**
   * Object on which to perform the operation.
   *
   * For "val" CRDT object, if omitted, or set to falsy
   * value, or equal to origin `[0, 0]`, the "set" operation is applied to the
   * root object, which is LWW Register of a pointer to another CRDT data type.
   */
  obj: JsonCodecTimestamp;
}

/**
 * Updates the value of "val" LWW-Register. The `obj` property specifies the "val"
 * object on which to perform the operation. The `value` property is the
 * value to apply to the object.
 */
export interface JsonCodecInsValOperation extends JsonCodecObjectOperation<'ins_val'> {
  /**
   * The new value of the "val" LWW-Register object. The ID of the CRDT object
   * to which the "val" LWW-Register will point to, if operation is successful.
   */
  value: JsonCodecTimestamp;
}

/**
 * Updates the value of "obj" LWW-Map. The `value` property is a map
 * of new values to apply to the "obj" LWW-Map.
 */
export interface JsonCodecInsObjOperation extends JsonCodecObjectOperation<'ins_obj'> {
  /** A map of values to apply to the "obj" LWW-Map object. */
  value: Array<[key: string, value: JsonCodecTimestamp]>;
}

/**
 * Updates the value of "vec" LWW-Vector. The `value` property is a map
 * of new values to apply to the "vec" LWW-Map.
 */
export interface JsonCodecInsVecOperation extends JsonCodecObjectOperation<'ins_vec'> {
  /** A map of values to apply to the "vec" LWW-Vector object. */
  value: Array<[index: number, value: JsonCodecTimestamp]>;
}

/** Operation which inserts a substring into a "str" RGA-string data type. */
export interface JsonCodecInsStrOperation extends JsonCodecObjectOperation<'ins_str'> {
  /**
   * Specifies the ID of element after which to attempt to insert the substring
   * using the RGA algorithm.
   */
  after: JsonCodecTimestamp;

  /** The substring to insert in the string. */
  value: string;
}

/** Operation which inserts a chunk into a "bin" RGA binary string data type. */
export interface JsonCodecInsBinOperation extends JsonCodecObjectOperation<'ins_bin'> {
  /**
   * Specifies the ID of element after which to attempt to insert the substring
   * using the RGA algorithm.
   */
  after: JsonCodecTimestamp;

  /** The binary data to insert, encoded using Base64. */
  value: string;
}

/** Operation which inserts elements into an "arr" RGA array data type. */
export interface JsonCodecInsArrOperation extends JsonCodecObjectOperation<'ins_arr'> {
  /**
   * Specifies the ID of element after which to attempt to insert the elements
   * using the RGA algorithm.
   */
  after: JsonCodecTimestamp;

  /** Values to insert in the array. */
  values: JsonCodecTimestamp[];
}

/** Operation which updates an existing "arr" RGA array element in-place. */
export interface JsonCodecUpdArrOperation extends JsonCodecObjectOperation<'upd_arr'> {
  /**
   * Specifies the ID of element to update.
   */
  ref: JsonCodecTimestamp;

  /** The new value to set for the element. */
  value: JsonCodecTimestamp;
}

/**
 * The "del" operation deletes contents from list CRDT (RGA) data types, such
 * as "str", "bin", and "arr". The `what` property specifies the ranges of
 * contents to delete.
 */
export interface JsonCodecDelOperation extends JsonCodecObjectOperation<'del'> {
  /** Range of content to delete. */
  what: JsonCodecTimespan[];
}

/**
 * The "nop" operation is a no-op operation, which is used to pad the patch;
 * it consumes the specified number of logical clock timestamps, but does not
 * perform any other side-effects.
 */
export interface JsonCodecNopOperation extends JsonCodecOperationBase<'nop'> {
  /** Defaults to 1, if omitted. */
  len?: number;
}
