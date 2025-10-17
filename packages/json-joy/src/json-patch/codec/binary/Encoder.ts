import {MsgPackEncoderFast as EncoderMessagePack} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackEncoderFast';
import type {Op} from '../../op';
import type {AbstractOp} from '../../op/AbstractOp';
import {OPCODE} from '../../constants';
import type {
  OpAdd,
  OpRemove,
  OpReplace,
  OpCopy,
  OpMove,
  OpTest,
  OpStrIns,
  OpStrDel,
  OpFlip,
  OpInc,
  OpSplit,
  OpMerge,
  OpExtend,
  OpContains,
  OpDefined,
  OpEnds,
  OpIn,
  OpLess,
  OpMatches,
  OpMore,
  OpStarts,
  OpTestString,
  OpTestStringLen,
  OpTestType,
  OpType,
  OpUndefined,
  OpAnd,
  OpOr,
  OpNot,
} from '../../op';

export class Encoder extends EncoderMessagePack {
  public encode(patch: Op[]): Uint8Array {
    this.writer.reset();
    this.encodeArrayHeader(patch.length);
    const length = patch.length;
    for (let i = 0; i < length; i++) this.encodeOp(patch[i]);
    return this.writer.flush();
  }

  private encodeOp(op: AbstractOp, parent?: AbstractOp): void {
    switch (op.code()) {
      case OPCODE.add: {
        const addOp = op as OpAdd;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.add);
        this.encodeArray(addOp.path as unknown[]);
        this.encodeAny(addOp.value);
        break;
      }

      case OPCODE.remove: {
        const removeOp = op as OpRemove;
        const hasOldValue = removeOp.oldValue !== undefined;
        this.encodeArrayHeader(hasOldValue ? 3 : 2);
        this.writer.u8(OPCODE.remove);
        this.encodeArray(removeOp.path as unknown[]);
        if (hasOldValue) this.encodeAny(removeOp.oldValue);
        break;
      }

      case OPCODE.replace: {
        const replaceOp = op as OpReplace;
        const hasOldValue = replaceOp.oldValue !== undefined;
        this.encodeArrayHeader(hasOldValue ? 4 : 3);
        this.writer.u8(OPCODE.replace);
        this.encodeArray(replaceOp.path as unknown[]);
        this.encodeAny(replaceOp.value);
        if (hasOldValue) this.encodeAny(replaceOp.oldValue);
        break;
      }

      case OPCODE.copy: {
        const copyOp = op as OpCopy;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.copy);
        this.encodeArray(copyOp.path as unknown[]);
        this.encodeArray(copyOp.from as unknown[]);
        break;
      }

      case OPCODE.move: {
        const moveOp = op as OpMove;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.move);
        this.encodeArray(moveOp.path as unknown[]);
        this.encodeArray(moveOp.from as unknown[]);
        break;
      }

      case OPCODE.test: {
        const testOp = op as OpTest;
        this.encodeArrayHeader(testOp.not ? 4 : 3);
        this.writer.u8(OPCODE.test);
        this.encodeArray(parent ? testOp.path.slice(parent.path.length) : (testOp.path as unknown[]));
        this.encodeAny(testOp.value);
        if (testOp.not) this.writer.u8(1);
        break;
      }

      case OPCODE.str_ins: {
        const strInsOp = op as OpStrIns;
        this.encodeArrayHeader(4);
        this.writer.u8(OPCODE.str_ins);
        this.encodeArray(strInsOp.path as unknown[]);
        this.encodeNumber(strInsOp.pos);
        this.encodeString(strInsOp.str);
        break;
      }

      case OPCODE.str_del: {
        const strDelOp = op as OpStrDel;
        const hasStr = typeof strDelOp.str === 'string';
        this.encodeArrayHeader(hasStr ? 4 : 5);
        this.writer.u8(OPCODE.str_del);
        this.encodeArray(strDelOp.path as unknown[]);
        this.encodeNumber(strDelOp.pos);
        if (hasStr) {
          this.encodeString(strDelOp.str as string);
        } else {
          this.writer.u8(0);
          this.encodeNumber(strDelOp.len!);
        }
        break;
      }

      case OPCODE.flip: {
        const flipOp = op as OpFlip;
        this.encodeArrayHeader(2);
        this.writer.u8(OPCODE.flip);
        this.encodeArray(flipOp.path as unknown[]);
        break;
      }

      case OPCODE.inc: {
        const incOp = op as OpInc;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.inc);
        this.encodeArray(incOp.path as unknown[]);
        this.encodeNumber(incOp.inc);
        break;
      }

      case OPCODE.split: {
        const splitOp = op as OpSplit;
        this.encodeArrayHeader(splitOp.props ? 4 : 3);
        this.writer.u8(OPCODE.split);
        this.encodeArray(splitOp.path as unknown[]);
        this.encodeNumber(splitOp.pos);
        if (splitOp.props) this.encodeObject(splitOp.props as Record<string, unknown>);
        break;
      }

      case OPCODE.merge: {
        const mergeOp = op as OpMerge;
        this.encodeArrayHeader(mergeOp.props ? 4 : 3);
        this.writer.u8(OPCODE.merge);
        this.encodeArray(mergeOp.path as unknown[]);
        this.encodeNumber(mergeOp.pos);
        if (mergeOp.props) this.encodeAny(mergeOp.props);
        break;
      }

      case OPCODE.extend: {
        const extendOp = op as OpExtend;
        const {deleteNull} = extendOp;
        this.encodeArrayHeader(deleteNull ? 4 : 3);
        this.writer.u8(OPCODE.extend);
        this.encodeArray(extendOp.path as unknown[]);
        this.encodeObject(extendOp.props);
        if (deleteNull) this.writer.u8(1);
        break;
      }

      case OPCODE.contains: {
        const containsOp = op as OpContains;
        const ignoreCase = containsOp.ignore_case;
        this.encodeArrayHeader(ignoreCase ? 4 : 3);
        this.writer.u8(OPCODE.contains);
        this.encodeArray(parent ? containsOp.path.slice(parent.path.length) : (containsOp.path as unknown[]));
        this.encodeString(containsOp.value);
        if (ignoreCase) this.writer.u8(1);
        break;
      }

      case OPCODE.defined: {
        const definedOp = op as OpDefined;
        this.encodeArrayHeader(2);
        this.writer.u8(OPCODE.defined);
        this.encodeArray(parent ? definedOp.path.slice(parent.path.length) : (definedOp.path as unknown[]));
        break;
      }

      case OPCODE.ends: {
        const endsOp = op as OpEnds;
        const ignoreCase = endsOp.ignore_case;
        this.encodeArrayHeader(ignoreCase ? 4 : 3);
        this.writer.u8(OPCODE.ends);
        this.encodeArray(parent ? endsOp.path.slice(parent.path.length) : (endsOp.path as unknown[]));
        this.encodeString(endsOp.value);
        if (ignoreCase) this.writer.u8(1);
        break;
      }

      case OPCODE.in: {
        const inOp = op as OpIn;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.in);
        this.encodeArray(parent ? inOp.path.slice(parent.path.length) : (inOp.path as unknown[]));
        this.encodeArray(inOp.value);
        break;
      }

      case OPCODE.less: {
        const lessOp = op as OpLess;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.less);
        this.encodeArray(parent ? lessOp.path.slice(parent.path.length) : (lessOp.path as unknown[]));
        this.encodeNumber(lessOp.value);
        break;
      }

      case OPCODE.matches: {
        const matchesOp = op as OpMatches;
        const ignoreCase = matchesOp.ignore_case;
        this.encodeArrayHeader(ignoreCase ? 4 : 3);
        this.writer.u8(OPCODE.matches);
        this.encodeArray(parent ? matchesOp.path.slice(parent.path.length) : (matchesOp.path as unknown[]));
        this.encodeString(matchesOp.value);
        if (ignoreCase) this.writer.u8(1);
        break;
      }

      case OPCODE.more: {
        const moreOp = op as OpMore;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.more);
        this.encodeArray(parent ? moreOp.path.slice(parent.path.length) : (moreOp.path as unknown[]));
        this.encodeNumber(moreOp.value);
        break;
      }

      case OPCODE.starts: {
        const startsOp = op as OpStarts;
        const ignoreCase = startsOp.ignore_case;
        this.encodeArrayHeader(ignoreCase ? 4 : 3);
        this.writer.u8(OPCODE.starts);
        this.encodeArray(parent ? startsOp.path.slice(parent.path.length) : (startsOp.path as unknown[]));
        this.encodeString(startsOp.value);
        if (ignoreCase) this.writer.u8(1);
        break;
      }

      case OPCODE.test_type: {
        const testTypeOp = op as OpTestType;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.test_type);
        this.encodeArray(parent ? testTypeOp.path.slice(parent.path.length) : (testTypeOp.path as unknown[]));
        this.encodeArray(testTypeOp.type);
        break;
      }

      case OPCODE.test_string: {
        const testStringOp = op as OpTestString;
        this.encodeArrayHeader(testStringOp.not ? 5 : 4);
        this.writer.u8(OPCODE.test_string);
        this.encodeArray(parent ? testStringOp.path.slice(parent.path.length) : (testStringOp.path as unknown[]));
        this.encodeNumber(testStringOp.pos);
        this.encodeString(testStringOp.str);
        if (testStringOp.not) this.writer.u8(1);
        break;
      }

      case OPCODE.test_string_len: {
        const testStringLenOp = op as OpTestStringLen;
        this.encodeArrayHeader(testStringLenOp.not ? 4 : 3);
        this.writer.u8(OPCODE.test_string_len);
        this.encodeArray(parent ? testStringLenOp.path.slice(parent.path.length) : (testStringLenOp.path as unknown[]));
        this.encodeNumber(testStringLenOp.len);
        if (testStringLenOp.not) this.writer.u8(1);
        break;
      }

      case OPCODE.type: {
        const typeOp = op as OpType;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.type);
        this.encodeArray(parent ? typeOp.path.slice(parent.path.length) : (typeOp.path as unknown[]));
        this.encodeString(typeOp.value);
        break;
      }

      case OPCODE.undefined: {
        const undefinedOp = op as OpUndefined;
        this.encodeArrayHeader(2);
        this.writer.u8(OPCODE.undefined);
        this.encodeArray(parent ? undefinedOp.path.slice(parent.path.length) : (undefinedOp.path as unknown[]));
        break;
      }

      case OPCODE.and: {
        const andOp = op as OpAnd;
        const path = parent ? andOp.path.slice(parent.path.length) : andOp.path;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.and);
        this.encodeArray(path as unknown[]);
        const length = andOp.ops.length;
        this.encodeArrayHeader(length);
        for (let i = 0; i < length; i++) this.encodeOp(andOp.ops[i], andOp);
        break;
      }

      case OPCODE.not: {
        const notOp = op as OpNot;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.not);
        this.encodeArray(parent ? notOp.path.slice(parent.path.length) : (notOp.path as unknown[]));
        const length = notOp.ops.length;
        this.encodeArrayHeader(length);
        for (let i = 0; i < length; i++) this.encodeOp(notOp.ops[i], notOp);
        break;
      }

      case OPCODE.or: {
        const orOp = op as OpOr;
        this.encodeArrayHeader(3);
        this.writer.u8(OPCODE.or);
        this.encodeArray(parent ? orOp.path.slice(parent.path.length) : (orOp.path as unknown[]));
        const length = orOp.ops.length;
        this.encodeArrayHeader(length);
        for (let i = 0; i < length; i++) this.encodeOp(orOp.ops[i], orOp);
        break;
      }

      default:
        throw new Error(`Unknown operation code: ${op.code()}`);
    }
  }
}
