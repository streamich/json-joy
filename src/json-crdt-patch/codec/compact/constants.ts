/**
 * Operation opcodes. Any change to this enum is a BREAKING CHANGE.
 */
export const enum Code {
  // "Make" operations go first, as they are reused in structural encoding.
  MakeUndefined = 0,
  MakeConstant,
  MakeValue,
  MakeObject,
  MakeString,
  MakeArray,
  MakeBinary,
  MakeTuple,
  MakeConstId,

  /**
   * @todo Separate type operations from all other operations.
   */

  // Other operations.
  InsertStringSubstring,
  Delete,
  SetObjectKeys,
  SetValue,
  InsertArrayElements,
  DeleteOne,
  NoopOne,
  Noop,
  InsertBinaryData,
}
