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
import {Operation} from '../types';
import {toPath} from '../../json-pointer';

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

export const operationToOp = (op: Operation): Op => {
  switch (op.op) {
    case 'add':
      return new OpAdd(toPath(op.path), op.value);
    case 'remove':
      return new OpRemove(toPath(op.path), op.oldValue);
    case 'replace':
      return new OpReplace(toPath(op.path), op.value, op.oldValue);
    case 'move':
      return new OpMove(toPath(op.path), toPath(op.from));
    case 'copy':
      return new OpCopy(toPath(op.path), toPath(op.from));
    case 'flip':
      return new OpFlip(toPath(op.path));
    case 'inc':
      return new OpInc(toPath(op.path), op.inc);
    case 'str_ins':
      return new OpStrIns(toPath(op.path), op.pos, op.str);
    case 'str_del':
      return new OpStrDel(toPath(op.path), op.pos, op.str, op.len);
    case 'split':
      return new OpSplit(toPath(op.path), op.pos, op.props || null);
    case 'merge':
      return new OpMerge(toPath(op.path), op.pos, op.props || null);
    case 'extend':
      return new OpExtend(toPath(op.path), op.props, !!op.deleteNull);
    default:
      return operationToPredicateOp(op);
  }
};

export const operationToPredicateOp = (op: Operation): PredicateOp => {
  switch (op.op) {
    case 'test':
      return new OpTest(toPath(op.path), op.value, !!op.not);
    case 'defined':
      return new OpDefined(toPath(op.path));
    case 'undefined':
      return new OpUndefined(toPath(op.path));
    case 'type':
      return new OpType(toPath(op.path), op.value);
    case 'test_type':
      return new OpTestType(toPath(op.path), op.type);
    case 'test_string':
      return new OpTestString(toPath(op.path), op.pos, op.str, !!op.not);
    case 'test_string_len':
      return new OpTestStringLen(toPath(op.path), op.len, !!op.not);
    case 'contains':
      return new OpContains(toPath(op.path), op.value, !!op.ignore_case);
    case 'ends':
      return new OpEnds(toPath(op.path), op.value, !!op.ignore_case);
    case 'starts':
      return new OpStarts(toPath(op.path), op.value, !!op.ignore_case);
    case 'matches':
      return new OpMatches(toPath(op.path), op.value, !!op.ignore_case);
    case 'in':
      return new OpIn(toPath(op.path), op.value);
    case 'less':
      return new OpLess(toPath(op.path), op.value);
    case 'more':
      return new OpMore(toPath(op.path), op.value);
    case 'and':
      return new OpAnd(
        toPath(op.path),
        op.apply.map((x) => operationToPredicateOp({...x, path: [...op.path, ...toPath(x.path)]})),
      );
    case 'or':
      return new OpOr(
        toPath(op.path),
        op.apply.map((x) => operationToPredicateOp({...x, path: [...op.path, ...toPath(x.path)]})),
      );
    case 'not':
      return new OpNot(
        toPath(op.path),
        op.apply.map((x) => operationToPredicateOp({...x, path: [...op.path, ...toPath(x.path)]})),
      );
    default:
      throw new Error('OP_UNKNOWN');
  }
};
