import type {Op, PredicateOp} from '../../op';
import type {CompactOp} from './types';
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
import {OPCODE} from '../../constants';
import type {JsonPatchOptions} from '../../types';
import {createMatcherDefault} from '../../util';

export const compactToOp = (op: CompactOp, options: JsonPatchOptions): Op => {
  switch (op[0]) {
    case OPCODE.add:
    case 'add':
      return new OpAdd(toPath(op[1]), op[2]);
    case OPCODE.remove:
    case 'remove':
      return new OpRemove(toPath(op[1]), op[2]);
    case OPCODE.replace:
    case 'replace':
      return new OpReplace(toPath(op[1]), op[2], op[3]);
    case OPCODE.move:
    case 'move':
      return new OpMove(toPath(op[1]), toPath(op[2]));
    case OPCODE.copy:
    case 'copy':
      return new OpCopy(toPath(op[1]), toPath(op[2]));
    case OPCODE.flip:
    case 'flip':
      return new OpFlip(toPath(op[1]));
    case OPCODE.inc:
    case 'inc':
      return new OpInc(toPath(op[1]), op[2]);
    case OPCODE.str_ins:
    case 'str_ins':
      return new OpStrIns(toPath(op[1]), op[2], op[3]);
    case OPCODE.str_del:
    case 'str_del':
      return new OpStrDel(toPath(op[1]), op[2], op[3] || undefined, op[4]);
    case OPCODE.split:
    case 'split':
      return new OpSplit(toPath(op[1]), op[2], op[3] || null);
    case OPCODE.merge:
    case 'merge':
      return new OpMerge(toPath(op[1]), op[2], op[3] || null);
    case OPCODE.extend:
    case 'extend':
      return new OpExtend(toPath(op[1]), op[2], !!op[3]);
    default:
      return compactToPredicateOp(op, options);
  }
};

export const compactToPredicateOp = (op: CompactOp, options: JsonPatchOptions): PredicateOp => {
  switch (op[0]) {
    case OPCODE.test:
    case 'test':
      return new OpTest(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.defined:
    case 'defined':
      return new OpDefined(toPath(op[1]));
    case OPCODE.undefined:
    case 'undefined':
      return new OpUndefined(toPath(op[1]));
    case OPCODE.type:
    case 'type':
      return new OpType(toPath(op[1]), op[2]);
    case OPCODE.test_type:
    case 'test_type':
      return new OpTestType(toPath(op[1]), op[2]);
    case OPCODE.test_string:
    case 'test_string':
      return new OpTestString(toPath(op[1]), op[2], op[3], !!op[4]);
    case OPCODE.test_string_len:
    case 'test_string_len':
      return new OpTestStringLen(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.contains:
    case 'contains':
      return new OpContains(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.ends:
    case 'ends':
      return new OpEnds(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.starts:
    case 'starts':
      return new OpStarts(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.matches:
    case 'matches':
      return new OpMatches(toPath(op[1]), op[2], !!op[3], options.createMatcher || createMatcherDefault);
    case OPCODE.in:
    case 'in':
      return new OpIn(toPath(op[1]), op[2]);
    case OPCODE.less:
    case 'less':
      return new OpLess(toPath(op[1]), op[2]);
    case OPCODE.more:
    case 'more':
      return new OpMore(toPath(op[1]), op[2]);
    case OPCODE.and:
    case 'and': {
      const path = toPath(op[1]);
      return new OpAnd(
        path,
        op[2].map((x) => {
          const copy = [...x];
          copy[1] = [...path, ...toPath(x[1])];
          return compactToPredicateOp(copy as CompactOp, options);
        }),
      );
    }
    case OPCODE.or:
    case 'or': {
      const path = toPath(op[1]);
      return new OpOr(
        path,
        op[2].map((x) => {
          const copy = [...x];
          copy[1] = [...path, ...toPath(x[1])];
          return compactToPredicateOp(copy as CompactOp, options);
        }),
      );
    }
    case OPCODE.not:
    case 'not': {
      const path = toPath(op[1]);
      return new OpNot(
        path,
        op[2].map((x) => {
          const copy = [...x];
          copy[1] = [...path, ...toPath(x[1])];
          return compactToPredicateOp(copy as CompactOp, options);
        }),
      );
    }
    default:
      throw new Error('OP_UNKNOWN');
  }
};

export function decode(patch: readonly CompactOp[], options: JsonPatchOptions): Op[] {
  const ops: Op[] = [];
  const length = patch.length;
  for (let i = 0; i < length; i++) {
    const op = compactToOp(patch[i], options);
    ops.push(op);
  }
  return ops;
}
