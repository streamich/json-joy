export const enum RESP {
  // Human readable separators
  R = 0x0d, // \r
  N = 0x0a, // \n
  RN = 0x0d0a, // \r\n

  // Data types
  NULL = 95, // _
  BOOL = 35, // #
  INT = 58, // :
  BIG = 40, // (
  FLOAT = 44, // ,
  STR_SIMPLE = 43, // +
  STR_BULK = 36, // $
  STR_VERBATIM = 61, // =
  ERR_SIMPLE = 45, // -
  ERR_BULK = 33, // !
  ARR = 42, // *
  SET = 126, // ~
  OBJ = 37, // %
  PUSH = 62, // >
  ATTR = 124, // |

  // Special chars
  PLUS = 43, // +
  MINUS = 45, // -
}
