import type {Op, PredicateOp} from '../../op';
import type {Operation} from './types';
import {OpAdd} from '../../op/OpAdd';
import {OpRemove} from '../../op/OpRemove';
import {OpReplace} from '../../op/OpReplace';
import {OpMove} from '../../op/OpMove';
import {OpCopy} from '../../op/OpCopy';
import {OpTest} from '../../op/OpTest';
import {OpFlip} from '../../op/OpFlip';
import {OpInc} from '../../op/OpInc';
import {OpStrIns} from '../../op/OpStrIns';
import {OpStrDel} from '../../op/OpStrDel';
import {OpSplit} from '../../op/OpSplit';
import {OpMerge} from '../../op/OpMerge';
import {OpExtend} from '../../op/OpExtend';
import {OpDefined} from '../../op/OpDefined';
import {OpUndefined} from '../../op/OpUndefined';
import {OpTestType} from '../../op/OpTestType';
import {OpTestString} from '../../op/OpTestString';
import {OpTestStringLen} from '../../op/OpTestStringLen';
import {OpContains} from '../../op/OpContains';
import {OpEnds} from '../../op/OpEnds';
import {OpStarts} from '../../op/OpStarts';
import {OpIn} from '../../op/OpIn';
import {OpLess} from '../../op/OpLess';
import {OpMore} from '../../op/OpMore';
import {OpAnd} from '../../op/OpAnd';
import {OpOr} from '../../op/OpOr';
import {OpNot} from '../../op/OpNot';
import {OpMatches} from '../../op/OpMatches';
import {OpType} from '../../op/OpType';
import {toPath} from '@jsonjoy.com/json-pointer';
import type {JsonPatchOptions} from '../../types';
import {createMatcherDefault} from '../../util';

export const operationToOp = (op: Operation, options: JsonPatchOptions): Op => {
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
      return operationToPredicateOp(op, options);
  }
};

export const operationToPredicateOp = (op: Operation, options: JsonPatchOptions): PredicateOp => {
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
      return new OpMatches(toPath(op.path), op.value, !!op.ignore_case, options.createMatcher || createMatcherDefault);
    case 'in':
      return new OpIn(toPath(op.path), op.value);
    case 'less':
      return new OpLess(toPath(op.path), op.value);
    case 'more':
      return new OpMore(toPath(op.path), op.value);
    case 'and': {
      const path = toPath(op.path);
      return new OpAnd(
        path,
        op.apply.map((x) => operationToPredicateOp({...x, path: [...path, ...toPath(x.path)]}, options)),
      );
    }
    case 'or': {
      const path = toPath(op.path);
      return new OpOr(
        path,
        op.apply.map((x) => operationToPredicateOp({...x, path: [...path, ...toPath(x.path)]}, options)),
      );
    }
    case 'not': {
      const path = toPath(op.path);
      return new OpNot(
        path,
        op.apply.map((x) => operationToPredicateOp({...x, path: [...path, ...toPath(x.path)]}, options)),
      );
    }
    default:
      throw new Error('OP_UNKNOWN');
  }
};

export function decode(patch: readonly Operation[], options: JsonPatchOptions): Op[] {
  const ops: Op[] = [];
  const length = patch.length;
  for (let i = 0; i < length; i++) {
    const op = operationToOp(patch[i], options);
    ops.push(op);
  }
  return ops;
}
