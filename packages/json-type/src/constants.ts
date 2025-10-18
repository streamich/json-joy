/**
 * @module
 * @todo Move to `src/validator/`.
 */

/**
 * Validation error codes.
 *
 * ATTENTION: Only add new error codes at the end of the list !!!
 * =========
 */
export enum ValidationError {
  STR = 0,
  NUM,
  BOOL,
  ARR,
  TUP,
  OBJ,
  MAP,
  KEY,
  KEYS,
  BIN,
  OR,
  REF,
  ENUM,
  CONST,
  VALIDATION,
  INT,
  UINT,
  STR_LEN,
  ARR_LEN,
  GT,
  GTE,
  LT,
  LTE,
  BIN_LEN,
}

/** Human-readable error messages by error code. */
export const ValidationErrorMessage = {
  [ValidationError.STR]: 'Not a string.',
  [ValidationError.NUM]: 'Not a number.',
  [ValidationError.BOOL]: 'Not a boolean.',
  [ValidationError.ARR]: 'Not an array.',
  [ValidationError.TUP]: 'Not a tuple.',
  [ValidationError.OBJ]: 'Not an object.',
  [ValidationError.MAP]: 'Not a map.',
  [ValidationError.KEY]: 'Missing key.',
  [ValidationError.KEYS]: 'Too many or missing object keys.',
  [ValidationError.BIN]: 'Not a binary.',
  [ValidationError.OR]: 'None of types matched.',
  [ValidationError.REF]: 'Validation error in referenced type.',
  [ValidationError.ENUM]: 'Not an enum value.',
  [ValidationError.CONST]: 'Invalid constant.',
  [ValidationError.VALIDATION]: 'Custom validator failed.',
  [ValidationError.INT]: 'Not an integer.',
  [ValidationError.UINT]: 'Not an unsigned integer.',
  [ValidationError.STR_LEN]: 'Invalid string length.',
  [ValidationError.BIN_LEN]: 'Invalid binary length.',
  [ValidationError.ARR_LEN]: 'Invalid array length.',
  [ValidationError.GT]: 'Value is too small.',
  [ValidationError.GTE]: 'Value is too small.',
  [ValidationError.LT]: 'Value is too large.',
  [ValidationError.LTE]: 'Value is too large.',
};
