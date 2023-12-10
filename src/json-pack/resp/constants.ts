export const enum RESP {
  RN = 0x0d0a, // \r\n
  NULL = 95, // _
  STR = 36, // $
  STR_SIMPLE = 43, // +
  STR_VERBATIM = 61, // =
  ERR_SIMPLE = 45, // -
  ERR = 33, // !
  ARR = 42, // *
  SET = 126, // ~
  OBJ = 37, // %
  PUSH = 62, // >
  ATTR = 124, // |
  BOOL = 35, // #
  BIG = 40, // (
  INT = 58, // :
  FLOAT = 44, // ,
}
