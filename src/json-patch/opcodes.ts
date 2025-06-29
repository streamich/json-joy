export type OpType = JsonPatchOpType | PredicateOpType | JsonPatchExtendedOpType;

export type JsonPatchOpType =
  // JSON Patch, RFC 6902 operations.
  // See: https://tools.ietf.org/html/rfc6902
  'add' | 'remove' | 'replace' | 'copy' | 'move';

export type PredicateOpType = FirstOrderPredicateOpType | SecondOrderPredicateOpType | AdditionalPredicateOpType;

export type FirstOrderPredicateOpType =
  // JSON Patch, RFC 6902 operations.
  // See: https://tools.ietf.org/html/rfc6902
  | 'test'
  // JSON Predicate, draft-snell-json-test-01 operations.
  // See: https://tools.ietf.org/id/draft-snell-json-test-01.html
  | 'contains'
  | 'defined'
  | 'ends'
  | 'in'
  | 'less'
  | 'matches'
  | 'more'
  | 'starts'
  | 'test'
  | 'type'
  | 'undefined';

export type AdditionalPredicateOpType =
  // Extended "test" operations.
  'test_type' | 'test_string' | 'test_string_len';

export type SecondOrderPredicateOpType = 'and' | 'not' | 'or';

export type JsonPatchExtendedOpType =
  // Extended operations.
  | 'flip'
  | 'inc'
  // Operations needed for text collaboration.
  | 'str_ins'
  | 'str_del'
  // Operations needed for binary blob collaboration.
  | 'bin_ins'
  | 'bin_del'
  // Operations needed for Slate.js.
  | 'split'
  | 'merge'
  | 'extend';

/**
 * # Ideas
 *
 * This operation could "box" a value into and array container, e.g. x -> [x].
 * Or box into an object container, e.g. x -> {value: x, ...props}.
 * This operation could also be called "wrap".
 */
