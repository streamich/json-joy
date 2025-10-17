import type {
  Operation,
  OperationAdd,
  OperationRemove,
  OperationReplace,
  OperationCopy,
  OperationMove,
  OperationTest,
  OperationTestType,
  OperationTestString,
  OperationTestStringLen,
  OperationInc,
  OperationStrIns,
  OperationStrDel,
  OperationExtend,
  OperationMerge,
  OperationSplit,
  PredicateOperation,
  OperationContains,
  OperationEnds,
  OperationStarts,
  OperationMatches,
  JsonPatchTypes,
} from './types';
import {validateJsonPointer} from '@jsonjoy.com/json-pointer/lib/validate';
import {hasOwnProperty as hasOwnProp} from '@jsonjoy.com/util/lib/hasOwnProperty';

export const validateOperations = (ops: Operation[], allowMatchesOp: boolean = false) => {
  if (!Array.isArray(ops)) throw new Error('Not a array.');
  if (!ops.length) throw new Error('Empty operation patch.');
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    try {
      validateOperation(op, allowMatchesOp);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error in operation [index = ${i}] (${message}).`);
    }
  }
};

export const validateOperation = (op: Operation, allowMatchesOp: boolean) => {
  if (!op || typeof op !== 'object') throw new Error('OP_INVALID');
  const path = op.path;
  if (typeof path !== 'string') throw new Error('OP_PATH_INVALID');
  validateJsonPointer(path);
  switch (op.op) {
    case 'add':
      validateOperationAdd(op);
      break;
    case 'remove':
      validateOperationRemove(op);
      break;
    case 'replace':
      validateOperationReplace(op);
      break;
    case 'copy':
      validateOperationCopy(op);
      break;
    case 'move':
      validateOperationMove(op);
      break;
    case 'flip':
      break;
    case 'inc':
      validateOperationInc(op);
      break;
    case 'str_ins':
      validateOperationInsertText(op);
      break;
    case 'str_del':
      validateOperationRemoveText(op);
      break;
    case 'extend':
      validateOperationExtend(op);
      break;
    case 'merge':
      validateOperationMerge(op);
      break;
    case 'split':
      validateOperationSplit(op);
      break;
    default:
      validatePredicateOperation(op, allowMatchesOp);
  }
};

export const validatePredicateOperation = (op: PredicateOperation, allowMatchesOp: boolean) => {
  if (!op || typeof op !== 'object') throw new Error('OP_INVALID');
  validateJsonPointer(op.path);
  switch (op.op) {
    case 'test':
      validateOperationTest(op);
      break;
    case 'test_type':
      validateOperationTestType(op);
      break;
    case 'test_string':
      validateOperationTestString(op);
      break;
    case 'test_string_len':
      validateOperationTestStringLen(op);
      break;
    case 'matches':
      if (!allowMatchesOp) throw new Error('"matches" operation not allowed.');
      validateOperationPredicateWithValueAndCase(op);
      break;
    case 'contains':
    case 'ends':
    case 'starts':
      validateOperationPredicateWithValueAndCase(op);
      break;
    case 'in':
      if (!Array.isArray(op.value)) throw new Error('"in" operation "value" must be an array.');
      break;
    case 'more':
    case 'less':
      if (typeof op.value !== 'number') throw new Error('Value must be a number.');
      break;
    case 'type':
      validateValueString(op.value);
      validateTestType(op.value);
      break;
    case 'defined':
    case 'undefined':
      break;
    case 'and':
    case 'or':
    case 'not':
      if (!Array.isArray(op.apply)) throw new Error(`"${op.op}" predicate operators must be an array.`);
      if (!op.apply.length) throw new Error('Predicate list is empty.');
      for (const predicate of op.apply) validatePredicateOperation(predicate, allowMatchesOp);
      break;
    default:
      throw new Error('OP_UNKNOWN');
  }
};

const validateOperationAdd = (op: OperationAdd) => {
  validateValue(op.value);
};

const validateOperationRemove = (op: OperationRemove) => {
  if (hasOwnProp(op, 'oldValue') && op.oldValue === undefined) throw new Error('Invalid oldValue.');
};

const validateOperationReplace = (op: OperationReplace) => {
  if (hasOwnProp(op, 'oldValue') && op.oldValue === undefined) throw new Error('Invalid oldValue.');
};

const validateOperationCopy = (op: OperationCopy) => {
  const from = op.from;
  if (typeof from !== 'string') throw new Error('OP_FROM_INVALID');
  validateJsonPointer(from);
};

const validateOperationMove = (op: OperationMove) => {
  const from = op.from;
  if (typeof from !== 'string') throw new Error('OP_FROM_INVALID');
  validateJsonPointer(from);
  const {path} = op;
  if (path.indexOf(from + '/') === 0) throw new Error('Cannot move into own children.');
};

const validateOperationTest = (op: OperationTest) => {
  validateValue(op.value);
  validateNot(op.not);
};

const validateOperationTestType = (op: OperationTestType) => {
  if (!Array.isArray(op.type)) throw new Error('Invalid "type" field.');
  if (op.type.length < 1) throw new Error('Empty type list.');
  for (const type of op.type) validateTestType(type);
};

const validTypes = new Set(['string', 'number', 'boolean', 'object', 'integer', 'array', 'null']);
const validateTestType = (type: JsonPatchTypes) => {
  if (!validTypes.has(type)) throw new Error('Invalid type.');
};

const validateOperationTestString = (op: OperationTestString) => {
  validateNot(op.not);
  validateNonNegativeInteger(op.pos);
  if (typeof op.str !== 'string') throw new Error('Value must be a string.');
};

const validateOperationTestStringLen = (op: OperationTestStringLen) => {
  validateNot(op.not);
  validateNonNegativeInteger(op.len);
};

const validateOperationInc = (op: OperationInc) => {
  if (typeof op.inc !== 'number') throw new Error('Invalid "inc" value.');
};

const validateOperationInsertText = (op: OperationStrIns) => {
  validateNonNegativeInteger(op.pos);
  if (typeof op.str !== 'string') throw new Error('Expected a string "text" field.');
};

const validateOperationRemoveText = (op: OperationStrDel) => {
  validateNonNegativeInteger(op.pos);
  if (op.str === undefined && op.len === undefined) throw new Error('Either "text" or "pos" need to be set.');
  if (op.str !== undefined) {
    if (typeof op.str !== 'string') throw new Error('Expected a string "text" field.');
  } else {
    validateNonNegativeInteger(op.len!);
  }
};

const validateOperationExtend = (op: OperationExtend) => {
  if (!op.props || typeof op.props !== 'object') throw new Error('Invalid "props" field.');
  if (op.deleteNull !== undefined)
    if (typeof op.deleteNull !== 'boolean') throw new Error('Expected "deleteNull" field to be boolean.');
};

const validateOperationMerge = (op: OperationMerge) => {
  validateInteger(op.pos);
  if (op.pos < 1) throw new Error('Expected "pos" field to be greater than 0.');
  if (op.props) if (typeof op.props !== 'object') throw new Error('Invalid "props" field.');
};

const validateOperationSplit = (op: OperationSplit) => {
  validateInteger(op.pos);
  if (op.props) if (typeof op.props !== 'object') throw new Error('Invalid "props" field.');
};

const validateOperationPredicateWithValueAndCase = (
  op: OperationContains | OperationEnds | OperationStarts | OperationMatches,
) => {
  validateValueString(op.value);
  validateIgnoreCase(op.ignore_case);
};

const validateValue = (value: unknown) => {
  if (value === undefined) throw new Error('OP_VALUE_MISSING');
};

const validateValueString = (value: string) => {
  if (typeof value !== 'string') throw new Error('Expected "value" to be string.');
  if (value.length > 20_000) throw new Error('Value too long.');
};

const validateIgnoreCase = (ignore: boolean | undefined) => {
  if (ignore === undefined) return;
  if (typeof ignore !== 'boolean') throw new Error('Expected "ignore_case" to be a boolean.');
};

const validateNot = (not?: boolean) => {
  if (not !== undefined) if (typeof not !== 'boolean') throw new Error('Invalid "not" modifier.');
};

const validateInteger = (num: number) => {
  if (typeof num !== 'number' || num !== Math.round(num)) throw new Error('Not an integer.');
};

const validateNonNegativeInteger = (num: number) => {
  validateInteger(num);
  if (num < 0) throw new Error('Number is negative.');
};
