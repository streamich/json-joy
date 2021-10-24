import {Op, PredicateOp} from '../../op';
import {CompactOp} from './types';
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
import {toPath} from '../../../json-pointer';
import {OPCODE} from '../../constants';

export const compactToOp = (op: CompactOp): Op => {
  switch (op[0]) {
    case OPCODE.add:
      return new OpAdd(toPath(op[1]), op[2]);
    case OPCODE.remove:
      return new OpRemove(toPath(op[1]), op[2]);
    case OPCODE.replace:
      return new OpReplace(toPath(op[1]), op[2], op[3]);
    case OPCODE.move:
      return new OpMove(toPath(op[1]), toPath(op[2]));
    case OPCODE.copy:
      return new OpCopy(toPath(op[1]), toPath(op[2]));
    case OPCODE.flip:
      return new OpFlip(toPath(op[1]));
    case OPCODE.inc:
      return new OpInc(toPath(op[1]), op[2]);
    case OPCODE.str_ins:
      return new OpStrIns(toPath(op[1]), op[2], op[3]);
    case OPCODE.str_del:
      return new OpStrDel(toPath(op[1]), op[2], op[3] || undefined, op[4]);
    case OPCODE.split:
      return new OpSplit(toPath(op[1]), op[2], op[3] || null);
    case OPCODE.merge:
      return new OpMerge(toPath(op[1]), op[2], op[3] || null);
    case OPCODE.extend:
      return new OpExtend(toPath(op[1]), op[2], !!op[3]);
    default:
      return compactToPredicateOp(op);
  }
};

export const compactToPredicateOp = (op: CompactOp): PredicateOp => {
  switch (op[0]) {
    case OPCODE.test:
      return new OpTest(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.defined:
      return new OpDefined(toPath(op[1]));
    case OPCODE.undefined:
      return new OpUndefined(toPath(op[1]));
    case OPCODE.type:
      return new OpType(toPath(op[1]), op[2]);
    case OPCODE.test_type:
      return new OpTestType(toPath(op[1]), op[2]);
    case OPCODE.test_string:
      return new OpTestString(toPath(op[1]), op[2], op[3], !!op[4]);
    case OPCODE.test_string_len:
      return new OpTestStringLen(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.contains:
      return new OpContains(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.ends:
      return new OpEnds(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.starts:
      return new OpStarts(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.matches:
      return new OpMatches(toPath(op[1]), op[2], !!op[3]);
    case OPCODE.in:
      return new OpIn(toPath(op[1]), op[2]);
    case OPCODE.less:
      return new OpLess(toPath(op[1]), op[2]);
    case OPCODE.more:
      return new OpMore(toPath(op[1]), op[2]);
    case OPCODE.and: {
      const path = toPath(op[1]);
      return new OpAnd(
        path,
        op[2].map((x) => {
          const copy = [...x];
          copy[1] = [...path, ...toPath(x[1])];
          return compactToPredicateOp(copy as CompactOp);
        }),
      );
    }
    case OPCODE.or: {
      const path = toPath(op[1]);
      return new OpOr(
        path,
        op[2].map((x) => {
          const copy = [...x];
          copy[1] = [...path, ...toPath(x[1])];
          return compactToPredicateOp(copy as CompactOp);
        }),
      );
    }
    case OPCODE.not: {
      const path = toPath(op[1]);
      return new OpNot(
        path,
        op[2].map((x) => {
          const copy = [...x];
          copy[1] = [...path, ...toPath(x[1])];
          return compactToPredicateOp(copy as CompactOp);
        }),
      );
    }
    default:
      throw new Error('OP_UNKNOWN');
  }
};

export function decode(patch: readonly CompactOp[]): Op[] {
  const ops: Op[] = [];
  const length = patch.length;
  for (let i = 0; i < length; i++) {
    const op = compactToOp(patch[i]);
    ops.push(op);
  }
  return ops;
}
