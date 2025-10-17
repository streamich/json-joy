/**
 * # json-patch
 *
 * JSON Joy json-patch library implements various JSON mutation operations. In
 * particular it implements:
 *
 * - [JSON Patch](https://tools.ietf.org/html/rfc6902)
 * - [JSON Predicate](https://tools.ietf.org/id/draft-snell-json-test-01.html)
 * - JSON Patch Extended
 *
 * @module
 */

export * from './opcodes';
export * from './types';
export * from './applyPatch';
export * from './validate';
export {
  OpTest,
  OpDefined,
  OpUndefined,
  OpTestType,
  OpTestString,
  OpTestStringLen,
  OpContains,
  OpEnds,
  OpStarts,
  OpIn,
  OpLess,
  OpMore,
  OpAnd,
  OpOr,
  OpNot,
  OpMatches,
  OpType,
  OpAdd,
  OpRemove,
  OpReplace,
  OpMove,
  OpCopy,
  OpFlip,
  OpInc,
  OpStrIns,
  OpStrDel,
  OpSplit,
  OpMerge,
  OpExtend,
} from './op';
