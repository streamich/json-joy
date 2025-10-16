import type {OPCODE} from '../../constants';
import type {Path} from '@jsonjoy.com/json-pointer/lib/types';
import type {JsonPatchTypes} from '../json/types';

export interface EncoderOptions {
  stringOpcode?: boolean;
}

export type CompactOp = CompactJsonPatchOp | CompactJsonPredicateOp | CompactJsonPatchExtendedOp;

/**
 *     [opcode, path, ...extraOptions]
 */
export type CompactOpBase =
  | [opcode: OPCODE | string, path: string | Path]
  | [opcode: OPCODE | string, path: string | Path, arg1?: unknown]
  | [opcode: OPCODE | string, path: string | Path, arg1?: unknown, arg2?: unknown]
  | [opcode: OPCODE | string, path: string | Path, arg1?: unknown, arg2?: unknown, arg3?: unknown];

// JSON Patch ------------------------------------------------------------------

export type CompactJsonPatchOp =
  | CompactAddOp
  | CompactCopyOp
  | CompactMoveOp
  | CompactRemoveOp
  | CompactReplaceOp
  | CompactTestOp;

export type OPCODE_ADD = OPCODE.add | 'add';
export type OPCODE_AND = OPCODE.and | 'and';
export type OPCODE_CONTAINS = OPCODE.contains | 'contains';
export type OPCODE_COPY = OPCODE.copy | 'copy';
export type OPCODE_DEFINED = OPCODE.defined | 'defined';
export type OPCODE_ENDS = OPCODE.ends | 'ends';
export type OPCODE_EXTEND = OPCODE.extend | 'extend';
export type OPCODE_FLIP = OPCODE.flip | 'flip';
export type OPCODE_IN = OPCODE.in | 'in';
export type OPCODE_INC = OPCODE.inc | 'inc';
export type OPCODE_LESS = OPCODE.less | 'less';
export type OPCODE_MATCHES = OPCODE.matches | 'matches';
export type OPCODE_MERGE = OPCODE.merge | 'merge';
export type OPCODE_MORE = OPCODE.more | 'more';
export type OPCODE_MOVE = OPCODE.move | 'move';
export type OPCODE_NOT = OPCODE.not | 'not';
export type OPCODE_OR = OPCODE.or | 'or';
export type OPCODE_REMOVE = OPCODE.remove | 'remove';
export type OPCODE_REPLACE = OPCODE.replace | 'replace';
export type OPCODE_SPLIT = OPCODE.split | 'split';
export type OPCODE_STARTS = OPCODE.starts | 'starts';
export type OPCODE_STR_DEL = OPCODE.str_del | 'str_del';
export type OPCODE_STR_INS = OPCODE.str_ins | 'str_ins';
export type OPCODE_BIN_INS = OPCODE.bin_ins | 'bin_ins';
export type OPCODE_TEST = OPCODE.test | 'test';
export type OPCODE_TEST_STRING = OPCODE.test_string | 'test_string';
export type OPCODE_TEST_STRING_LEN = OPCODE.test_string_len | 'test_string_len';
export type OPCODE_TEST_TYPE = OPCODE.test_type | 'test_type';
export type OPCODE_TYPE = OPCODE.type | 'type';
export type OPCODE_UNDEFINED = OPCODE.undefined | 'undefined';

/**
 * @category JSON Patch
 */
export type CompactAddOp = [opcode: OPCODE_ADD, path: string | Path, value: unknown];

/**
 * @category JSON Patch
 */
export type CompactCopyOp = [opcode: OPCODE_COPY, path: string | Path, from: string | Path];

/**
 * @category JSON Patch
 */
export type CompactMoveOp = [opcode: OPCODE_MOVE, path: string | Path, from: string | Path];

/**
 * @category JSON Patch
 */
export type CompactRemoveOp =
  | [opcode: OPCODE_REMOVE, path: string | Path]
  | [opcode: OPCODE_REMOVE, path: string | Path, oldValue?: unknown];

/**
 * @category JSON Patch
 */
export type CompactReplaceOp =
  | [opcode: OPCODE_REPLACE, path: Path | string, value: unknown]
  | [opcode: OPCODE_REPLACE, path: Path | string, value: unknown, oldValue?: unknown];

/**
 * @category JSON Patch
 */
export type CompactTestOp =
  | [opcode: OPCODE_TEST, path: string | Path, value: unknown]
  | [opcode: OPCODE_TEST, path: string | Path, value: unknown, not?: 1];

// JSON Predicate --------------------------------------------------------------

export type CompactJsonPredicateOp =
  | CompactAndOp
  | CompactContainsOp
  | CompactDefinedOp
  | CompactEndsOp
  | CompactInOp
  | CompactLessOp
  | CompactMatchesOp
  | CompactMoreOp
  | CompactNotOp
  | CompactOrOp
  | CompactStartsOp
  | CompactTestTypeOp
  | CompactTypeOp
  | CompactStartsOp
  | CompactUndefinedOp;

/**
 * @category JSON Predicate
 */
export type CompactAndOp = [opcode: OPCODE_AND, path: string | Path, ops: CompactOpBase[]];

/**
 * @category JSON Predicate
 */
export type CompactContainsOp =
  | [opcode: OPCODE_CONTAINS, path: string | Path, value: string]
  | [opcode: OPCODE_CONTAINS, path: string | Path, value: string, ignore_case?: 1];

/**
 * @category JSON Predicate
 */
export type CompactDefinedOp = [opcode: OPCODE_DEFINED, path: string | Path];

/**
 * @category JSON Predicate
 */
export type CompactEndsOp =
  | [opcode: OPCODE_ENDS, path: string | Path, value: string]
  | [opcode: OPCODE_ENDS, path: string | Path, value: string, ignore_case?: 1];

/**
 * @category JSON Predicate
 */
export type CompactInOp = [opcode: OPCODE_IN, path: string | Path, value: unknown[]];

/**
 * @category JSON Predicate
 */
export type CompactLessOp = [opcode: OPCODE_LESS, path: string | Path, value: number];

/**
 * @category JSON Predicate
 */
export type CompactMatchesOp =
  | [opcode: OPCODE_MATCHES, path: string | Path, value: string]
  | [opcode: OPCODE_MATCHES, path: string | Path, value: string, ignore_case?: 1];

/**
 * @category JSON Predicate
 */
export type CompactMoreOp = [opcode: OPCODE_MORE, path: string | Path, value: number];

/**
 * @category JSON Predicate
 */
export type CompactNotOp = [opcode: OPCODE_NOT, path: string | Path, ops: CompactOpBase[]];

/**
 * @category JSON Predicate
 */
export type CompactOrOp = [opcode: OPCODE_OR, path: string | Path, ops: CompactOpBase[]];

/**
 * @category JSON Predicate
 */
export type CompactStartsOp =
  | [opcode: OPCODE_STARTS, path: string | Path, value: string]
  | [opcode: OPCODE_STARTS, path: string | Path, value: string, ignore_case?: 1];

/**
 * @category JSON Predicate
 */
export type CompactTestTypeOp = [opcode: OPCODE_TEST_TYPE, path: string | Path, type: JsonPatchTypes[]];

/**
 * @category JSON Predicate
 */
export type CompactTypeOp = [opcode: OPCODE_TYPE, path: string | Path, value: JsonPatchTypes];

/**
 * @category JSON Predicate
 */
export type CompactUndefinedOp = [opcode: OPCODE_UNDEFINED, path: string | Path];

// JSON Patch Extended ---------------------------------------------------------

export type CompactJsonPatchExtendedOp =
  | CompactExtendOp
  | CompactFlipOp
  | CompactIncOp
  | CompactMergeOp
  | CompactSplitOp
  | CompactStrDelOp
  | CompactStrInsOp
  | CompactTestStringOp
  | CompactTestStringLenOp;

/**
 * @category JSON Patch Extended
 */
export type CompactExtendOp =
  | [opcode: OPCODE_EXTEND, path: string | Path, props: Record<string, unknown>]
  | [opcode: OPCODE_EXTEND, path: string | Path, props: Record<string, unknown>, deleteNull?: 1];

/**
 * @category JSON Patch Extended
 */
export type CompactFlipOp = [opcode: OPCODE_FLIP, path: string | Path];

/**
 * @category JSON Patch Extended
 */
export type CompactIncOp = [opcode: OPCODE_INC, path: string | Path, inc: number];

/**
 * @category JSON Patch Extended
 */
export type CompactMergeOp =
  | [opcode: OPCODE_MERGE, path: string | Path, pos: number]
  | [opcode: OPCODE_MERGE, path: string | Path, pos: number, props?: object | null];

/**
 * @category JSON Patch Extended
 */
export type CompactSplitOp =
  | [opcode: OPCODE_SPLIT, path: string | Path, pos: number]
  | [opcode: OPCODE_SPLIT, path: string | Path, pos: number, props?: object | null];

/**
 * @category JSON Patch Extended
 */
export type CompactStrDelOp =
  | [opcode: OPCODE_STR_DEL, path: string | Path, pos: number, str: string]
  | [opcode: OPCODE_STR_DEL, path: string | Path, pos: number, str: 0, len: number];

/**
 * @category JSON Patch Extended
 */
export type CompactStrInsOp = [opcode: OPCODE_STR_INS, path: string | Path, pos: number, str: string];

/**
 * @category JSON Patch Extended
 */
export type CompactBinInsOp = [opcode: OPCODE_BIN_INS, path: string | Path, pos: number, bin: Uint8Array];

/**
 * @category JSON Patch Extended
 */
export type CompactTestStringOp =
  | [opcode: OPCODE_TEST_STRING, path: string | Path, pos: number, str: string]
  | [opcode: OPCODE_TEST_STRING, path: string | Path, pos: number, str: string, not?: 1];

/**
 * @category JSON Patch Extended
 */
export type CompactTestStringLenOp =
  | [opcode: OPCODE_TEST_STRING_LEN, path: string | Path, len: number]
  | [opcode: OPCODE_TEST_STRING_LEN, path: string | Path, len: number, not?: 1];
