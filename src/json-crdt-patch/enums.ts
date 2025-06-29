export const enum SESSION {
  /**
   * Session ID which is reserved by the JSON CRDT Patch protocol for internal
   * usage. This session ID cannot be used by users when editing the documents.
   */
  SYSTEM = 0,

  /**
   * The only valid session ID for CRDT ran in the server clock mode.
   */
  SERVER = 1,

  /**
   * Use this session ID when you want to apply a patch globally, without
   * attributing it to any specific user. For example, when the initial document
   * is created, the default patch can be applied on all clients to result in
   * the same initial state on all clients.
   *
   * @todo Rename or alias this to `SCHEMA`.
   */
  GLOBAL = 2,

  /**
   * Session ID used for models that are not shared with other users. For
   * example, when a user is editing a document in a local editor, these
   * documents could capture local information, like the cursor position, which
   * is not shared with other users.
   */
  LOCAL = 3,

  /** Max allowed session ID, they are capped at 53-bits. */
  MAX = 9007199254740991,
}

export const enum SYSTEM_SESSION_TIME {
  ORIGIN = 0,
  UNDEFINED = 1,
}

export const enum JsonCrdtDataType {
  con = 0b000,
  val = 0b001,
  obj = 0b010,
  vec = 0b011,
  str = 0b100,
  bin = 0b101,
  arr = 0b110,
}

export const enum JsonCrdtPatchOpcode {
  new_con = 0b00000 | JsonCrdtDataType.con, // 0
  new_val = 0b00000 | JsonCrdtDataType.val, // 1
  new_obj = 0b00000 | JsonCrdtDataType.obj, // 2
  new_vec = 0b00000 | JsonCrdtDataType.vec, // 3
  new_str = 0b00000 | JsonCrdtDataType.str, // 4
  new_bin = 0b00000 | JsonCrdtDataType.bin, // 5
  new_arr = 0b00000 | JsonCrdtDataType.arr, // 6
  ins_val = 0b01000 | JsonCrdtDataType.val, // 9
  ins_obj = 0b01000 | JsonCrdtDataType.obj, // 10
  ins_vec = 0b01000 | JsonCrdtDataType.vec, // 11
  ins_str = 0b01000 | JsonCrdtDataType.str, // 12
  ins_bin = 0b01000 | JsonCrdtDataType.bin, // 13
  ins_arr = 0b01000 | JsonCrdtDataType.arr, // 14
  upd_arr = 0b01000 | JsonCrdtDataType.arr + 1, // 15
  del = 0b10000, // 16
  nop = 0b10001, // 17
}

export const enum JsonCrdtPatchOpcodeOverlay {
  new_con = JsonCrdtPatchOpcode.new_con << 3,
  new_val = JsonCrdtPatchOpcode.new_val << 3,
  new_obj = JsonCrdtPatchOpcode.new_obj << 3,
  new_vec = JsonCrdtPatchOpcode.new_vec << 3,
  new_str = JsonCrdtPatchOpcode.new_str << 3,
  new_bin = JsonCrdtPatchOpcode.new_bin << 3,
  new_arr = JsonCrdtPatchOpcode.new_arr << 3,
  ins_val = JsonCrdtPatchOpcode.ins_val << 3,
  ins_obj = JsonCrdtPatchOpcode.ins_obj << 3,
  ins_vec = JsonCrdtPatchOpcode.ins_vec << 3,
  ins_str = JsonCrdtPatchOpcode.ins_str << 3,
  ins_bin = JsonCrdtPatchOpcode.ins_bin << 3,
  ins_arr = JsonCrdtPatchOpcode.ins_arr << 3,
  upd_arr = JsonCrdtPatchOpcode.upd_arr << 3,
  del = JsonCrdtPatchOpcode.del << 3,
  nop = JsonCrdtPatchOpcode.nop << 3,
}
