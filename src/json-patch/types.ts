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

/**
 * JSON Patch add (or replace) operation.
 *
 * Below example sets __"foo"__ key of an object to `"bar"` value:
 *
 * ```ts
 * const operation: OperationAdd = {
 *   op: 'add',
 *   path: '/foo',
 *   value: 'bar',
 * };
 * ```
 *
 * @category JSON Patch
 */
export interface OperationAdd<T = unknown> extends OperationBase {
  readonly op: 'add';
  readonly value: T;
}

/**
 * @category JSON Patch
 */
export interface OperationRemove<T = unknown> extends OperationBase {
  readonly op: 'remove';
  /** Value which was remove, for ability to reverse operations. */
  readonly oldValue?: T;
}

/**
 * @category JSON Patch
 */
export interface OperationReplace<V = unknown, O = unknown> extends OperationBase {
  readonly op: 'replace';
  readonly value: V;
  readonly oldValue?: O;
}

/**
 * @category JSON Patch
 */
export interface OperationCopy extends OperationBase {
  readonly op: 'copy';
  readonly from: string;
}

/**
 * @category JSON Patch
 */
export interface OperationMove extends OperationBase {
  readonly op: 'move';
  readonly from: string;
}

/**
 * Tests that value at `path` strictly equals `value`. If `not` is set to `true`
 * inverts the condition to test for value not being strictly equal.
 *
 * @category JSON Patch
 */
export interface OperationTest<T = unknown> extends OperationBase {
  readonly op: 'test';
  readonly value: T;
  readonly not?: boolean;
}

/**
 * Tests is the target value exists in the document, fails otherwise.
 *
 * @category JSON Predicate
 */
export interface OperationDefined extends OperationBase {
  readonly op: 'defined';
}

/**
 * Opposite of "defined" operation.
 *
 * @category JSON Predicate
 */
export interface OperationUndefined extends OperationBase {
  readonly op: 'undefined';
}

/**
 * Tests is the target is of any of the given types.
 *
 * @category JSON Patch Extended
 */
export interface OperationTestType extends OperationBase {
  readonly op: 'test_type';
  readonly type: JsonPatchTypes[];
}

/**
 * @category JSON Patch Extended
 */
export interface OperationTestString extends OperationBase {
  readonly op: 'test_string';
  readonly not?: boolean;
  readonly pos: number;
  readonly str: string;
}

/**
 * Fails if string is shorter than `len` characters.
 *
 * @category JSON Patch Extended
 */
export interface OperationTestStringLen extends OperationBase {
  readonly op: 'test_string_len';
  readonly not?: boolean;
  readonly len: number;
}

/**
 * Inserts a `value` string into a string at position `pos`.
 *
 * @category JSON Patch Extended
 */
export interface OperationStrIns extends OperationBase {
  readonly op: 'str_ins';
  readonly pos: number;
  readonly str: string;
}

/**
 * Removes `len` number of characters from a string starting at position `pos`.
 *
 * @category JSON Patch Extended
 */
export interface OperationStrDel1 extends OperationBase {
  readonly op: 'str_del';
  readonly pos: number;
  readonly str: string;
}

/**
 * @category JSON Patch Extended
 */
export interface OperationStrDel2 extends OperationBase {
  readonly op: 'str_del';
  readonly pos: number;
  readonly len: number;
}

/**
 * @category JSON Patch Extended
 */
export interface OperationStrDel extends OperationBase {
  readonly op: 'str_del';
  readonly pos: number;
  readonly str?: string;
  readonly len?: number;
}

/**
 * Flips boolean value to the opposite one.
 *
 * @category JSON Patch Extended
 */
export interface OperationFlip extends OperationBase {
  readonly op: 'flip';
}

/**
 * Increments a number by a specified value `inc`.
 *
 * @category JSON Patch Extended
 */
export interface OperationInc extends OperationBase {
  readonly op: 'inc';
  readonly inc: number;
}

/**
 * @category JSON Patch Extended
 */
export interface OperationSplit extends OperationBase {
  readonly op: 'split';
  pos: number;
  props?: object;
}

/**
 * @category JSON Patch Extended
 */
export interface OperationMerge extends OperationBase {
  readonly op: 'merge';
  pos: number; // Not used, but here because it is inverse of 'split'.
  props?: object; // Not used, but here because it is inverse of 'split'.
}

/**
 * @category JSON Patch Extended
 */
export interface OperationExtend extends OperationBase {
  readonly op: 'extend';
  props: Record<string, unknown>;
  deleteNull?: boolean;
}

/**
 * @category JSON Predicate
 */
export interface OperationContains extends OperationBase {
  readonly op: 'contains';
  readonly value: string;
  readonly ignore_case?: boolean;
}

/**
 * @category JSON Predicate
 */
export interface OperationMatches extends OperationBase {
  readonly op: 'matches';
  readonly value: string;
  readonly ignore_case?: boolean;
}

/**
 * @category JSON Predicate
 */
export interface OperationEnds extends OperationBase {
  readonly op: 'ends';
  readonly value: string;
  readonly ignore_case?: boolean;
}

/**
 * @category JSON Predicate
 */
export interface OperationStarts extends OperationBase {
  readonly op: 'starts';
  readonly value: string;
  readonly ignore_case?: boolean;
}

/**
 * @category JSON Predicate
 */
export interface OperationType extends OperationBase {
  readonly op: 'type';
  readonly value: JsonPatchTypes;
}

/**
 * @category JSON Predicate
 */
export interface OperationIn extends OperationBase {
  readonly op: 'in';
  readonly value: unknown[];
}

/**
 * @category JSON Predicate
 */
export interface OperationLess extends OperationBase {
  readonly op: 'less';
  readonly value: number;
}

/**
 * @category JSON Predicate
 */
export interface OperationMore extends OperationBase {
  readonly op: 'more';
  readonly value: number;
}

/**
 * @category JSON Predicate
 */
export interface OperationAnd extends OperationBase {
  readonly op: 'and';
  readonly apply: PredicateOperation[];
}

/**
 * @category JSON Predicate
 */
export interface OperationNot extends OperationBase {
  readonly op: 'not';
  readonly apply: PredicateOperation[];
}

/**
 * @category JSON Predicate
 */
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

/**
 * Slate.js nodes
 *
 * @ignore
 */
export interface SlateTextNode {
  text: string;
  [key: string]: unknown;
}

/**
 * @ignore
 */
export interface SlateElementNode {
  children: SlateNode[];
  [key: string]: unknown;
}

/**
 * @ignore
 */
export type SlateNode = SlateElementNode | SlateTextNode;
