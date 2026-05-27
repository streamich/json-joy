import type {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';

/**
 * Runtime-safe mirror of json-joy's {@link JsonCrdtDataType}. That enum is
 * declared as a `const enum`, so it is erased from the emitted JS and reads as
 * `undefined` at runtime whenever this package is transpiled file-by-file.
 */
export const NodeType = {
  con: 0 as JsonCrdtDataType.con,
  val: 1 as JsonCrdtDataType.val,
  obj: 2 as JsonCrdtDataType.obj,
  vec: 3 as JsonCrdtDataType.vec,
  str: 4 as JsonCrdtDataType.str,
  bin: 5 as JsonCrdtDataType.bin,
  arr: 6 as JsonCrdtDataType.arr,
};

/** Indices into the {@link UserPresence} tuple. */
export enum UserPresenceIdx {
  UserId = 0,
  ProcessId = 1,
  Seq = 2,
  Ts = 3,
  Selections = 4,
  Meta = 5,
}
