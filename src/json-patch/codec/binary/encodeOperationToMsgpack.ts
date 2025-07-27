import type {IMessagePackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';
import type {AbstractOp} from '../../op/AbstractOp';
import {OPCODE} from '../../constants';

/**
 * Standalone function to encode operations to MessagePack format.
 * This replaces the instance method approach with a centralized switch statement.
 */
export function encodeOperationToMsgpack(op: AbstractOp, encoder: IMessagePackEncoder, parent?: AbstractOp): void {
  switch (op.code()) {
    case OPCODE.add: {
      const addOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.add);
      encoder.encodeArray(addOp.path as unknown[]);
      encoder.encodeAny(addOp.value);
      break;
    }

    case OPCODE.remove: {
      const removeOp = op as any;
      const hasOldValue = removeOp.oldValue !== undefined;
      encoder.encodeArrayHeader(hasOldValue ? 3 : 2);
      encoder.writer.u8(OPCODE.remove);
      encoder.encodeArray(removeOp.path as unknown[]);
      if (hasOldValue) encoder.encodeAny(removeOp.oldValue);
      break;
    }

    case OPCODE.replace: {
      const replaceOp = op as any;
      const hasOldValue = replaceOp.oldValue !== undefined;
      encoder.encodeArrayHeader(hasOldValue ? 4 : 3);
      encoder.writer.u8(OPCODE.replace);
      encoder.encodeArray(replaceOp.path as unknown[]);
      encoder.encodeAny(replaceOp.value);
      if (hasOldValue) encoder.encodeAny(replaceOp.oldValue);
      break;
    }

    case OPCODE.copy: {
      const copyOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.copy);
      encoder.encodeArray(copyOp.path as unknown[]);
      encoder.encodeArray(copyOp.from as unknown[]);
      break;
    }

    case OPCODE.move: {
      const moveOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.move);
      encoder.encodeArray(moveOp.path as unknown[]);
      encoder.encodeArray(moveOp.from as unknown[]);
      break;
    }

    case OPCODE.test: {
      const testOp = op as any;
      encoder.encodeArrayHeader(testOp.not ? 4 : 3);
      encoder.writer.u8(OPCODE.test);
      encoder.encodeArray(parent ? testOp.path.slice(parent.path.length) : (testOp.path as unknown[]));
      encoder.encodeAny(testOp.value);
      if (testOp.not) encoder.writer.u8(1);
      break;
    }

    case OPCODE.str_ins: {
      const strInsOp = op as any;
      encoder.encodeArrayHeader(4);
      encoder.writer.u8(OPCODE.str_ins);
      encoder.encodeArray(strInsOp.path as unknown[]);
      encoder.encodeNumber(strInsOp.pos);
      encoder.encodeString(strInsOp.str);
      break;
    }

    case OPCODE.str_del: {
      const strDelOp = op as any;
      const hasStr = typeof strDelOp.str === 'string';
      encoder.encodeArrayHeader(hasStr ? 4 : 5);
      encoder.writer.u8(OPCODE.str_del);
      encoder.encodeArray(strDelOp.path as unknown[]);
      encoder.encodeNumber(strDelOp.pos);
      if (hasStr) {
        encoder.encodeString(strDelOp.str as string);
      } else {
        encoder.writer.u8(0);
        encoder.encodeNumber(strDelOp.len!);
      }
      break;
    }

    case OPCODE.flip: {
      const flipOp = op as any;
      encoder.encodeArrayHeader(2);
      encoder.writer.u8(OPCODE.flip);
      encoder.encodeArray(flipOp.path as unknown[]);
      break;
    }

    case OPCODE.inc: {
      const incOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.inc);
      encoder.encodeArray(incOp.path as unknown[]);
      encoder.encodeNumber(incOp.inc);
      break;
    }

    case OPCODE.split: {
      const splitOp = op as any;
      encoder.encodeArrayHeader(splitOp.props ? 4 : 3);
      encoder.writer.u8(OPCODE.split);
      encoder.encodeArray(splitOp.path as unknown[]);
      encoder.encodeNumber(splitOp.pos);
      if (splitOp.props) encoder.encodeObject(splitOp.props as Record<string, unknown>);
      break;
    }

    case OPCODE.merge: {
      const mergeOp = op as any;
      encoder.encodeArrayHeader(mergeOp.props ? 4 : 3);
      encoder.writer.u8(OPCODE.merge);
      encoder.encodeArray(mergeOp.path as unknown[]);
      encoder.encodeNumber(mergeOp.pos);
      if (mergeOp.props) encoder.encodeAny(mergeOp.props);
      break;
    }

    case OPCODE.extend: {
      const extendOp = op as any;
      const {deleteNull} = extendOp;
      encoder.encodeArrayHeader(deleteNull ? 4 : 3);
      encoder.writer.u8(OPCODE.extend);
      encoder.encodeArray(extendOp.path as unknown[]);
      encoder.encodeObject(extendOp.props);
      if (deleteNull) encoder.writer.u8(1);
      break;
    }

    case OPCODE.contains: {
      const containsOp = op as any;
      const ignoreCase = containsOp.ignore_case;
      encoder.encodeArrayHeader(ignoreCase ? 4 : 3);
      encoder.writer.u8(OPCODE.contains);
      encoder.encodeArray(parent ? containsOp.path.slice(parent.path.length) : (containsOp.path as unknown[]));
      encoder.encodeString(containsOp.value);
      if (ignoreCase) encoder.writer.u8(1);
      break;
    }

    case OPCODE.defined: {
      const definedOp = op as any;
      encoder.encodeArrayHeader(2);
      encoder.writer.u8(OPCODE.defined);
      encoder.encodeArray(parent ? definedOp.path.slice(parent.path.length) : (definedOp.path as unknown[]));
      break;
    }

    case OPCODE.ends: {
      const endsOp = op as any;
      const ignoreCase = endsOp.ignore_case;
      encoder.encodeArrayHeader(ignoreCase ? 4 : 3);
      encoder.writer.u8(OPCODE.ends);
      encoder.encodeArray(parent ? endsOp.path.slice(parent.path.length) : (endsOp.path as unknown[]));
      encoder.encodeString(endsOp.value);
      if (ignoreCase) encoder.writer.u8(1);
      break;
    }

    case OPCODE.in: {
      const inOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.in);
      encoder.encodeArray(parent ? inOp.path.slice(parent.path.length) : (inOp.path as unknown[]));
      encoder.encodeArray(inOp.value);
      break;
    }

    case OPCODE.less: {
      const lessOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.less);
      encoder.encodeArray(parent ? lessOp.path.slice(parent.path.length) : (lessOp.path as unknown[]));
      encoder.encodeNumber(lessOp.value);
      break;
    }

    case OPCODE.matches: {
      const matchesOp = op as any;
      const ignoreCase = matchesOp.ignore_case;
      encoder.encodeArrayHeader(ignoreCase ? 4 : 3);
      encoder.writer.u8(OPCODE.matches);
      encoder.encodeArray(parent ? matchesOp.path.slice(parent.path.length) : (matchesOp.path as unknown[]));
      encoder.encodeString(matchesOp.value);
      if (ignoreCase) encoder.writer.u8(1);
      break;
    }

    case OPCODE.more: {
      const moreOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.more);
      encoder.encodeArray(parent ? moreOp.path.slice(parent.path.length) : (moreOp.path as unknown[]));
      encoder.encodeNumber(moreOp.value);
      break;
    }

    case OPCODE.starts: {
      const startsOp = op as any;
      const ignoreCase = startsOp.ignore_case;
      encoder.encodeArrayHeader(ignoreCase ? 4 : 3);
      encoder.writer.u8(OPCODE.starts);
      encoder.encodeArray(parent ? startsOp.path.slice(parent.path.length) : (startsOp.path as unknown[]));
      encoder.encodeString(startsOp.value);
      if (ignoreCase) encoder.writer.u8(1);
      break;
    }

    case OPCODE.test_type: {
      const testTypeOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.test_type);
      encoder.encodeArray(parent ? testTypeOp.path.slice(parent.path.length) : (testTypeOp.path as unknown[]));
      encoder.encodeArray(testTypeOp.type);
      break;
    }

    case OPCODE.test_string: {
      const testStringOp = op as any;
      encoder.encodeArrayHeader(testStringOp.not ? 5 : 4);
      encoder.writer.u8(OPCODE.test_string);
      encoder.encodeArray(parent ? testStringOp.path.slice(parent.path.length) : (testStringOp.path as unknown[]));
      encoder.encodeNumber(testStringOp.pos);
      encoder.encodeString(testStringOp.str);
      if (testStringOp.not) encoder.writer.u8(1);
      break;
    }

    case OPCODE.test_string_len: {
      const testStringLenOp = op as any;
      encoder.encodeArrayHeader(testStringLenOp.not ? 4 : 3);
      encoder.writer.u8(OPCODE.test_string_len);
      encoder.encodeArray(
        parent ? testStringLenOp.path.slice(parent.path.length) : (testStringLenOp.path as unknown[]),
      );
      encoder.encodeNumber(testStringLenOp.len);
      if (testStringLenOp.not) encoder.writer.u8(1);
      break;
    }

    case OPCODE.type: {
      const typeOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.type);
      encoder.encodeArray(parent ? typeOp.path.slice(parent.path.length) : (typeOp.path as unknown[]));
      encoder.encodeString(typeOp.value);
      break;
    }

    case OPCODE.undefined: {
      const undefinedOp = op as any;
      encoder.encodeArrayHeader(2);
      encoder.writer.u8(OPCODE.undefined);
      encoder.encodeArray(parent ? undefinedOp.path.slice(parent.path.length) : (undefinedOp.path as unknown[]));
      break;
    }

    case OPCODE.and: {
      const andOp = op as any;
      const path = parent ? andOp.path.slice(parent.path.length) : andOp.path;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.and);
      encoder.encodeArray(path as unknown[]);
      const length = andOp.ops.length;
      encoder.encodeArrayHeader(length);
      for (let i = 0; i < length; i++) encodeOperationToMsgpack(andOp.ops[i], encoder, andOp);
      break;
    }

    case OPCODE.not: {
      const notOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.not);
      encoder.encodeArray(parent ? notOp.path.slice(parent.path.length) : (notOp.path as unknown[]));
      const length = notOp.ops.length;
      encoder.encodeArrayHeader(length);
      for (let i = 0; i < length; i++) encodeOperationToMsgpack(notOp.ops[i], encoder, notOp);
      break;
    }

    case OPCODE.or: {
      const orOp = op as any;
      encoder.encodeArrayHeader(3);
      encoder.writer.u8(OPCODE.or);
      encoder.encodeArray(parent ? orOp.path.slice(parent.path.length) : (orOp.path as unknown[]));
      const length = orOp.ops.length;
      encoder.encodeArrayHeader(length);
      for (let i = 0; i < length; i++) encodeOperationToMsgpack(orOp.ops[i], encoder, orOp);
      break;
    }

    default:
      throw new Error(`Unknown operation code: ${op.code()}`);
  }
}
