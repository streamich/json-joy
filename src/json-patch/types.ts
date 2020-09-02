import {Path} from '../json-pointer';

export type OpType =
  // JSON Patch, RFC 6902 operations.
  // See: https://tools.ietf.org/html/rfc6902
  | 'add'
  | 'remove'
  | 'replace'
  | 'copy'
  | 'move'
  // Extended operations.
  | 'flip'
  | 'inc'
  // Operations needed for text collaboration.
  | 'str_ins'
  | 'str_del'
  // Operations needed for Slate.js.
  | 'split'
  | 'merge'
  | 'extend'
  | PredicateOpType;

/**
 * This operation could "box" a value into and array container, e.g. x -> [x].
 * Or box into an object container, e.g. x -> {value: x, ...props}.
 * This operation could also be called "wrap".
 */
// | 'box'

export type PredicateOpType =
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
  | 'undefined'
  | SecondOrderPredicateOpType
  // Extended "test" operations.
  | 'test_type'
  | 'test_string'
  | 'test_string_len';

export type SecondOrderPredicateOpType = 'and' | 'not' | 'or';

export type JsTypes = 'string' | 'number' | 'boolean' | 'object';
export type JsonPatchTypes = JsTypes | 'integer' | 'array' | 'null';

export interface OperationBase {
  readonly op: OpType;
  readonly path: string | Path;
}

export interface OperationAdd<T = unknown> extends OperationBase {
  readonly op: 'add';
  readonly value: T;
}

export interface OperationRemove<T = unknown> extends OperationBase {
  readonly op: 'remove';
  /** Value which was remove, for ability to reverse operations. */
  readonly oldValue?: T;
}

export interface OperationReplace<V = unknown, O = unknown> extends OperationBase {
  readonly op: 'replace';
  readonly value: V;
  readonly oldValue?: O;
}

export interface OperationCopy extends OperationBase {
  readonly op: 'copy';
  readonly from: string;
}

export interface OperationMove extends OperationBase {
  readonly op: 'move';
  readonly from: string;
}

/**
 * Tests that value at `path` strictly equals `value`. If `not` is set to `true`
 * inverts the condition to test for value not being strictly equal.
 */
export interface OperationTest<T = unknown> extends OperationBase {
  readonly op: 'test';
  readonly value: T;
  readonly not?: boolean;
}

/** Tests is the target value exists in the document, fails otherwise. */
export interface OperationDefined extends OperationBase {
  readonly op: 'defined';
}

/** Opposite of "defined" operation. */
export interface OperationUndefined extends OperationBase {
  readonly op: 'undefined';
}

/** Tests is the target is of any of the given types. */
export interface OperationTestType extends OperationBase {
  readonly op: 'test_type';
  readonly type: JsonPatchTypes[];
}

export interface OperationTestString extends OperationBase {
  readonly op: 'test_string';
  readonly not?: boolean;
  readonly pos: number;
  readonly str: string;
}

/** Fails if string is shorter than `len` characters. */
export interface OperationTestStringLen extends OperationBase {
  readonly op: 'test_string_len';
  readonly not?: boolean;
  readonly len: number;
}

/** Inserts a `value` string into a string at position `pos`. */
export interface OperationStrIns extends OperationBase {
  readonly op: 'str_ins';
  readonly pos: number;
  readonly str: string;
}

/** Removes `len` number of characters from a string starting at position `pos`. */
export interface OperationStrDel1 extends OperationBase {
  readonly op: 'str_del';
  readonly pos: number;
  readonly str: string;
}
export interface OperationStrDel2 extends OperationBase {
  readonly op: 'str_del';
  readonly pos: number;
  readonly len: number;
}
export interface OperationStrDel extends OperationBase {
  readonly op: 'str_del';
  readonly pos: number;
  readonly str?: string;
  readonly len?: number;
}

/** Flips boolean value to the opposite one. */
export interface OperationFlip extends OperationBase {
  readonly op: 'flip';
}

/** Increments a number by a specified value `inc`. */
export interface OperationInc extends OperationBase {
  readonly op: 'inc';
  readonly inc: number;
}

export interface OperationSplit extends OperationBase {
  readonly op: 'split';
  pos: number;
  props?: object;
}

export interface OperationMerge extends OperationBase {
  readonly op: 'merge';
  pos: number; // Not used, but here because it is inverse of 'split'.
  props?: object; // Not used, but here because it is inverse of 'split'.
}

export interface OperationExtend extends OperationBase {
  readonly op: 'extend';
  props: Record<string, unknown>;
  deleteNull?: boolean;
}

export interface OperationContains extends OperationBase {
  readonly op: 'contains';
  readonly value: string;
  readonly ignore_case?: boolean;
}

export interface OperationMatches extends OperationBase {
  readonly op: 'matches';
  readonly value: string;
  readonly ignore_case?: boolean;
}

export interface OperationEnds extends OperationBase {
  readonly op: 'ends';
  readonly value: string;
  readonly ignore_case?: boolean;
}

export interface OperationStarts extends OperationBase {
  readonly op: 'starts';
  readonly value: string;
  readonly ignore_case?: boolean;
}

export interface OperationType extends OperationBase {
  readonly op: 'type';
  readonly value: JsonPatchTypes;
}

export interface OperationIn extends OperationBase {
  readonly op: 'in';
  readonly value: unknown[];
}

export interface OperationLess extends OperationBase {
  readonly op: 'less';
  readonly value: number;
}

export interface OperationMore extends OperationBase {
  readonly op: 'more';
  readonly value: number;
}

export interface OperationAnd extends OperationBase {
  readonly op: 'and';
  readonly apply: PredicateOperation[];
}

export interface OperationNot extends OperationBase {
  readonly op: 'not';
  readonly apply: PredicateOperation[];
}

export interface OperationOr extends OperationBase {
  readonly op: 'or';
  readonly apply: PredicateOperation[];
}

export type Operation =
  | OperationAdd
  | OperationRemove
  | OperationReplace
  | OperationMove
  | OperationCopy
  | OperationStrIns
  | OperationStrDel
  | OperationFlip
  | OperationInc
  | OperationSplit
  | OperationMerge
  | OperationExtend
  | PredicateOperation;

export type PredicateOperation =
  | OperationTest
  | OperationDefined
  | OperationUndefined
  | OperationTestType
  | OperationTestString
  | OperationTestStringLen
  | OperationContains
  | OperationEnds
  | OperationStarts
  | OperationIn
  | OperationLess
  | OperationMore
  | OperationMatches
  | OperationType
  | SecondOrderPredicateOperation;

export type SecondOrderPredicateOperation = OperationAnd | OperationNot | OperationOr;

// Slate.js nodes
export interface SlateTextNode {
  text: string;
  [key: string]: unknown;
}

export interface SlateElementNode {
  children: SlateNode[];
  [key: string]: unknown;
}

export type SlateNode = SlateElementNode | SlateTextNode;
