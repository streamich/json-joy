import type {OPCODE} from '../../constants';
import type {Path} from '../../../json-pointer/util';
import type {JsonPatchTypes} from '../json/types';

export type CompactOp =
  | CompactJsonPatchOp
  | CompactJsonPredicateOp
  | CompactJsonPatchExtendedOp;

/**
 *     [opcode, path, ...extraOptions]
 */
export type CompactOpBase =
  | [opcode: OPCODE, path: string | Path]
  | [opcode: OPCODE, path: string | Path, arg1?: unknown]
  | [opcode: OPCODE, path: string | Path, arg1?: unknown, arg2?: unknown]
  | [opcode: OPCODE, path: string | Path, arg1?: unknown, arg2?: unknown, arg3?: unknown];


// JSON Patch ------------------------------------------------------------------

export type CompactJsonPatchOp =
  | CompactAddOp
  | CompactCopyOp
  | CompactMoveOp
  | CompactRemoveOp
  | CompactReplaceOp
  | CompactTestOp;

/**
 * @category JSON Patch
 */
export type CompactAddOp = [opcode: OPCODE.add, path: string | Path, value: unknown];

/**
 * @category JSON Patch
 */
export type CompactCopyOp = [opcode: OPCODE.copy, path: string | Path, from: string | Path];

/**
 * @category JSON Patch
 */
export type CompactMoveOp = [opcode: OPCODE.move, path: string | Path, from: string | Path];

/**
 * @category JSON Patch
 */
export type CompactRemoveOp =
  | [opcode: OPCODE.remove, path: string | Path]
  | [opcode: OPCODE.remove, path: string | Path, oldValue?: unknown];

/**
 * @category JSON Patch
 */
export type CompactReplaceOp =
  | [opcode: OPCODE.replace, path: Path | string, value: unknown]
  | [opcode: OPCODE.replace, path: Path | string, value: unknown, oldValue?: unknown];

/**
 * @category JSON Patch
 */
export type CompactTestOp =
  | [opcode: OPCODE.test, path: string | Path, value: unknown]
  | [opcode: OPCODE.test, path: string | Path, value: unknown, not?: 1];


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
export type CompactAndOp = [opcode: OPCODE.and, path: string | Path, ops: CompactOpBase[]];

/**
 * @category JSON Predicate
 */
export type CompactContainsOp =
  | [opcode: OPCODE.contains, path: string | Path, value: string]
  | [opcode: OPCODE.contains, path: string | Path, value: string, ignore_case?: 1];

/**
 * @category JSON Predicate
 */
export type CompactDefinedOp = [opcode: OPCODE.defined, path: string | Path];

/**
 * @category JSON Predicate
 */
export type CompactEndsOp =
  | [opcode: OPCODE.ends, path: string | Path, value: string]
  | [opcode: OPCODE.ends, path: string | Path, value: string, ignore_case?: 1];

/**
 * @category JSON Predicate
 */
export type CompactInOp = [opcode: OPCODE.in, path: string | Path, value: unknown[]];

/**
 * @category JSON Predicate
 */
 export type CompactLessOp = [opcode: OPCODE.less, path: string | Path, value: number];

/**
 * @category JSON Predicate
 */
export type CompactMatchesOp =
  | [opcode: OPCODE.matches, path: string | Path, value: string]
  | [opcode: OPCODE.matches, path: string | Path, value: string, ignore_case?: 1];

/**
 * @category JSON Predicate
 */
export type CompactMoreOp = [opcode: OPCODE.more, path: string | Path, value: number];

/**
 * @category JSON Predicate
 */
export type CompactNotOp = [opcode: OPCODE.not, path: string | Path, ops: CompactOpBase[]];

/**
 * @category JSON Predicate
 */
export type CompactOrOp = [opcode: OPCODE.or, path: string | Path, ops: CompactOpBase[]];

/**
 * @category JSON Predicate
 */
export type CompactStartsOp =
  | [opcode: OPCODE.starts, path: string | Path, value: string]
  | [opcode: OPCODE.starts, path: string | Path, value: string, ignore_case?: 1];

/**
 * @category JSON Predicate
 */
export type CompactTestTypeOp = [opcode: OPCODE.test_type, path: string | Path, type: JsonPatchTypes[]];

/**
 * @category JSON Predicate
 */
export type CompactTypeOp = [opcode: OPCODE.type, path: string | Path, value: JsonPatchTypes];

/**
 * @category JSON Predicate
 */
export type CompactUndefinedOp = [opcode: OPCODE.undefined, path: string | Path];


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
  | [opcode: OPCODE.extend, path: string | Path, props: Record<string, unknown>]
  | [opcode: OPCODE.extend, path: string | Path, props: Record<string, unknown>, deleteNull?: 1];

/**
 * @category JSON Patch Extended
 */
export type CompactFlipOp = [opcode: OPCODE.flip, path: string | Path];

/**
 * @category JSON Patch Extended
 */
export type CompactIncOp = [opcode: OPCODE.inc, path: string | Path, inc: number];

/**
 * @category JSON Patch Extended
 */
export type CompactMergeOp =
  | [opcode: OPCODE.merge, path: string | Path, pos: number]
  | [opcode: OPCODE.merge, path: string | Path, pos: number, props?: object | null];

/**
 * @category JSON Patch Extended
 */
export type CompactSplitOp =
  | [opcode: OPCODE.split, path: string | Path, pos: number]
  | [opcode: OPCODE.split, path: string | Path, pos: number, props?: object | null];

/**
 * @category JSON Patch Extended
 */
export type CompactStrDelOp =
  | [opcode: OPCODE.str_del, path: string | Path, pos: number, str: string | undefined]
  | [opcode: OPCODE.str_del, path: string | Path, pos: number, str: string | undefined, len?: number | undefined];

/**
 * @category JSON Patch Extended
 */
export type CompactStrInsOp = [opcode: OPCODE.str_ins, path: string | Path, pos: number, str: string];

/**
 * @category JSON Patch Extended
 */
export type CompactTestStringOp =
  | [opcode: OPCODE.test_string, path: string | Path, pos: number, str: string]
  | [opcode: OPCODE.test_string, path: string | Path, pos: number, str: string, not?: 1];

/**
 * @category JSON Patch Extended
 */
export type CompactTestStringLenOp =
  | [opcode: OPCODE.test_string_len, path: string | Path, len: number]
  | [opcode: OPCODE.test_string_len, path: string | Path, len: number, not?: 1];
