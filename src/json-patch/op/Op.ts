import {OpAdd} from './OpAdd';
import {OpRemove} from './OpRemove';
import {OpReplace} from './OpReplace';
import {OpMove} from './OpMove';
import {OpCopy} from './OpCopy';
import {OpTest} from './OpTest';
import {OpFlip} from './OpFlip';
import {OpInc} from './OpInc';
import {OpStrIns} from './OpStrIns';
import {OpStrDel} from './OpStrDel';
import {OpSplit} from './OpSplit';
import {OpMerge} from './OpMerge';
import {OpExtend} from './OpExtend';
import {OpDefined} from './OpDefined';
import {OpUndefined} from './OpUndefined';
import {OpTestType} from './OpTestType';
import {OpTestString} from './OpTestString';
import {OpTestStringLen} from './OpTestStringLen';
import {OpContains} from './OpContains';
import {OpEnds} from './OpEnds';
import {OpStarts} from './OpStarts';
import {OpIn} from './OpIn';
import {OpLess} from './OpLess';
import {OpMore} from './OpMore';
import {OpAnd} from './OpAnd';
import {OpOr} from './OpOr';
import {OpNot} from './OpNot';
import {OpMatches} from './OpMatches';
import {OpType} from './OpType';

export {AbstractPredicateOp} from './AbstractPredicateOp';

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
};

export type PredicateOp =
  | OpTest
  | OpDefined
  | OpUndefined
  | OpTestType
  | OpTestString
  | OpTestStringLen
  | OpContains
  | OpEnds
  | OpStarts
  | OpIn
  | OpLess
  | OpMore
  | OpAnd
  | OpOr
  | OpNot
  | OpMatches
  | OpType;

export type Op =
  | PredicateOp
  | OpAdd
  | OpRemove
  | OpReplace
  | OpMove
  | OpCopy
  | OpFlip
  | OpInc
  | OpStrIns
  | OpStrDel
  | OpSplit
  | OpMerge
  | OpExtend;
