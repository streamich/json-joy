export enum OPCODE {
  // JSON Patch.
  add = 0,
  remove = 1,
  replace = 2,
  copy = 3,
  move = 4,
  test = 5,

  // String editing.
  str_ins = 6,
  str_del = 7,

  // Extra
  flip = 8,
  inc = 9,

  // Slate.js
  split = 10,
  merge = 11,
  extend = 12,

  // JSON Predicate
  contains = 30,
  defined = 31,
  ends = 32,
  in = 33,
  less = 34,
  matches = 35,
  more = 36,
  starts = 37,
  undefined = 38,
  test_type = 39,
  test_string = 40,
  test_string_len = 41,
  type = 42,
  and = 43,
  not = 44,
  or = 45,
}
