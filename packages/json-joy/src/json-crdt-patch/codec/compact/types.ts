import type {JsonCrdtPatchOpcode} from '../../constants';
import type {JsonCodecTimestamp} from '../verbose/types';

/**
 * Represents a JSON CRDT Patch object in *Compact encoding*. Compact encoding
 * is a binary encoding of the JSON CRDT Patch, which is more compact than
 * *JSON encoding(), but less compact than *Binary encoding*.
 */
export type CompactCodecPatch = [
  /** Header of the patch. */
  header: [
    /**
     * ID of the first operation in the patch. IDs of subsequent operations are
     * derived from this ID.
     */
    id: CompactCodecTimestamp,
    /** Custom metadata. */
    meta?: unknown,
  ],
  /**
   * List of operations comprising this patch. Patches are atomic, so all
   * operations are applied at once. "time" part of the IDs of all operations
   * is incremented by size of each operation in the patch.
   */
  ...ops: CompactCodecOperation[],
];

/**
 * Represents a JSON CRDT Patch operation.
 */
export type CompactCodecOperation =
  | CompactCodecNewConOperation
  | CompactCodecNewValOperation
  | CompactCodecNewObjOperation
  | CompactCodecNewVecOperation
  | CompactCodecNewStrOperation
  | CompactCodecNewBinOperation
  | CompactCodecNewArrOperation
  | CompactCodecInsValOperation
  | CompactCodecInsObjOperation
  | CompactCodecInsVecOperation
  | CompactCodecInsStrOperation
  | CompactCodecInsBinOperation
  | CompactCodecInsArrOperation
  | CompactCodecUpdArrOperation
  | CompactCodecDelOperation
  | CompactCodecNopOperation;

/**
 * Represents a logical clock timestamp. If number, it is a relative timestamp
 * and is relative to the patch ID. If array, it is an absolute timestamp, where
 * array is a tuple of `[sessionId, time]`, unless the document is using
 * `ServerClock`, in which case the timestamps are always numbers.
 */
export type CompactCodecTimestamp =
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
export type CompactCodecTimespan =
  | [
      /** A random site ID. */
      sessionId: number,
      /** A logical clock sequence number. */
      time: number,
      /**
       * Length of the timespan, including the first timestamp identified by the
       * `sessionId` and `time` properties.
       */
      span: number,
    ]
  | [
      /** Time difference relative to the Patch ID time. */
      time: number,
      /**
       * Length of the timespan, including the first timestamp identified by the
       * `sessionId` and `time` properties.
       */
      span: number,
    ];

/**
 * Operations which creates a new "con" Constant data type. Constant CRDT data
 * types are immutable and cannot be changed after creation.
 */
export type CompactCodecNewConOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.new_con,
  /**
   * Literal JSON value, which can also contain binary data; or, a logical clock
   * timestamp.
   */
  value?: unknown | undefined | CompactCodecTimestamp,
  /** If true, the `value` is a timestamp. */
  timestamp?: boolean,
];

/**
 * Operation which creates a new "val" CRDT data type, which is a
 * Last-Write-Wins Register of a pointer to another CRDT data type.
 */
export type CompactCodecNewValOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.new_val,
  /** ID of the "val" LWW-Register object latest value. */
  value: CompactCodecTimestamp,
];

/**
 * Operation which creates a new "object" CRDT data type, which is a map of
 * key-value pairs. Keys are strings. The values of the map are Last-Write-Wins
 * Registers of pointers to other CRDT data types.
 */
export type CompactCodecNewObjOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.new_obj,
];

/**
 * Operation which creates a new "vec" CRDT data type, which is a vector
 * of indexed contiguously starting from zero. The values of the vector are
 * Last-Write-Wins Registers of pointers to other CRDT data types.
 */
export type CompactCodecNewVecOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.new_vec,
];

/**
 * Operation which creates a new "str" CRDT data type, which is an RGA
 * (Replicated Growable Array) of JavaScript (UTF-16) characters.
 */
export type CompactCodecNewStrOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.new_str,
];

/**
 * Operation which creates a new "bin" CRDT data type, which is an RGA
 * (Replicated Growable Array) of binary octet data.
 */
export type CompactCodecNewBinOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.new_bin,
];

/**
 * Operation which creates a new "arr" CRDT data type, which is an RGA
 * (Replicated Growable Array) of immutable pointers to other CRDT data types.
 */
export type CompactCodecNewArrOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.new_arr,
];

/**
 * Updates the value of "val" LWW-Register. The `obj` property specifies the "val"
 * object on which to perform the operation. The `value` property is the
 * value to apply to the object.
 */
export type CompactCodecInsValOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.ins_val,
  /**
   * Object on which to perform the operation. If omitted, or set to falsy
   * value, or equal to origin `[0, 0]`, the "set" operation is applied to the
   * root object, which is LWW Register of a pointer to another CRDT data type.
   */
  obj: CompactCodecTimestamp,
  /**
   * The new value of the "val" LWW-Register object. The ID of the CRDT object
   * to which the "val" LWW-Register will point to, if operation is successful.
   */
  value: CompactCodecTimestamp,
];

/**
 * Updates the value of "obj" LWW-Map. The `value` property is a map
 * of new values to apply to the "obj" LWW-Map.
 */
export type CompactCodecInsObjOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.ins_obj,
  /** Object on which to perform the operation. */
  obj: CompactCodecTimestamp,
  /** A map of values to apply to the "obj" LWW-Map object. */
  value: Array<[key: string, value: CompactCodecTimestamp]>,
];

/**
 * Updates the value of "vec" LWW-Vector. The `value` property is a map
 * of new values to apply to the "vec" LWW-Map.
 */
export type CompactCodecInsVecOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.ins_vec,
  /** Object on which to perform the operation. */
  obj: CompactCodecTimestamp,
  /** A map of values to apply to the "vec" LWW-Vector object. */
  value: Array<[index: number, value: CompactCodecTimestamp]>,
];

/** Operation which inserts a substring into a "str" RGA-string data type. */
export type CompactCodecInsStrOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.ins_str,
  /** Object on which to perform the operation. */
  obj: CompactCodecTimestamp,
  /**
   * Specifies the ID of element after which to attempt to insert the substring
   * using the RGA algorithm.
   */
  after: CompactCodecTimestamp,
  /** The substring to insert in the string. */
  value: string,
];

/** Operation which inserts a chunk into a "bin" RGA binary string data type. */
export type CompactCodecInsBinOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.ins_bin,
  /** Object on which to perform the operation. */
  obj: CompactCodecTimestamp,
  /**
   * Specifies the ID of element after which to attempt to insert the substring
   * using the RGA algorithm.
   */
  after: CompactCodecTimestamp,
  /** The binary data to insert, encoded using Base64. */
  value: string,
];

/** Operation which inserts elements into an "arr" RGA array data type. */
export type CompactCodecInsArrOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.ins_arr,
  /** Object on which to perform the operation. */
  obj: CompactCodecTimestamp,
  /**
   * Specifies the ID of element after which to attempt to insert the substring
   * using the RGA algorithm.
   */
  after: CompactCodecTimestamp,
  /** Values to insert in the array. */
  values: JsonCodecTimestamp[],
];

/** Operation which updates an existing element in an "arr" RGA array data type. */
export type CompactCodecUpdArrOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.upd_arr,
  /** Object on which to perform the operation. */
  obj: CompactCodecTimestamp,
  /**
   * Specifies the ID of element to update.
   */
  ref: CompactCodecTimestamp,
  /** ID of the new value to set. */
  value: CompactCodecTimestamp,
];

/**
 * The "del" operation deletes contents from list CRDT (RGA) data types, such
 * as "str", "bin", and "arr". The `what` property specifies the ranges of
 * contents to delete.
 */
export type CompactCodecDelOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.del,
  /** Object on which to perform the operation. */
  obj: CompactCodecTimestamp,
  /** Range of content to delete. */
  what: CompactCodecTimespan[],
];

/**
 * The "nop" operation is a no-op operation, which is used to pad the patch;
 * it consumes the specified number of logical clock timestamps, but does not
 * perform any other side-effects.
 */
export type CompactCodecNopOperation = [
  /** Operation type. */
  op: JsonCrdtPatchOpcode.nop,
  /** Defaults to 1, if omitted. */
  len?: number,
];
