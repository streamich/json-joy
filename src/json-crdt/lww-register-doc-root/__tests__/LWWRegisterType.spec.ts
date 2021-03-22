import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {SetRootOperation} from '../../../json-crdt-patch/operations/SetRootOperation';
import {FALSE_ID, NULL_ID, ORIGIN, TRUE_ID, UNDEFINED_ID} from '../../../json-crdt-patch/constants';
import {DocRootType} from '../DocRootType';

describe('LWWRegisterType', () => {
  test('can create', () => {
    const type = new DocRootType(ORIGIN);
    expect(type).toBeInstanceOf(DocRootType);
  });

  test('default value is undefined', () => {
    const type = new DocRootType(ORIGIN);
    expect(type.toValue()).toBe(UNDEFINED_ID);
  });

  test('can set initial value', () => {
    const type = new DocRootType(ORIGIN);
    const op = new SetRootOperation(new LogicalTimestamp(1, 1), TRUE_ID);
    type.insert(op);
    expect(type.toValue()).toBe(TRUE_ID);
  });

  test('can overwrite value', () => {
    const type = new DocRootType(ORIGIN);
    const op1 = new SetRootOperation(new LogicalTimestamp(1, 1), TRUE_ID);
    type.insert(op1);
    const op2 = new SetRootOperation(new LogicalTimestamp(1, 2), FALSE_ID);
    type.insert(op2);
    expect(type.toValue()).toBe(FALSE_ID);
  });

  test('can overwrite value twice', () => {
    const type = new DocRootType(ORIGIN);
    const op1 = new SetRootOperation(new LogicalTimestamp(1, 1), TRUE_ID);
    type.insert(op1);
    const op2 = new SetRootOperation(new LogicalTimestamp(1, 2), FALSE_ID);
    type.insert(op2);
    const op3 = new SetRootOperation(new LogicalTimestamp(1, 3), NULL_ID);
    type.insert(op3);
    expect(type.toValue()).toBe(NULL_ID);
  });

  test('insertions ignore operations with the same ID', () => {
    const type = new DocRootType(ORIGIN);
    const op1 = new SetRootOperation(new LogicalTimestamp(1, 1), TRUE_ID);
    type.insert(op1);
    const op2 = new SetRootOperation(new LogicalTimestamp(1, 2), FALSE_ID);
    type.insert(op2);
    const op3 = new SetRootOperation(new LogicalTimestamp(1, 2), FALSE_ID);
    type.insert(op3);
    expect(type.toValue()).toBe(FALSE_ID);
  });

  test('operation with greater session ID wins', () => {
    const type = new DocRootType(ORIGIN);
    const op1 = new SetRootOperation(new LogicalTimestamp(1, 1), TRUE_ID);
    const op2 = new SetRootOperation(new LogicalTimestamp(2, 1), FALSE_ID);
    type.insert(op1);
    type.insert(op2);
    expect(type.toValue()).toBe(FALSE_ID);
  });

  test('operation with greater session ID wins - 2', () => {
    const type = new DocRootType(ORIGIN);
    const op1 = new SetRootOperation(new LogicalTimestamp(2, 1), TRUE_ID);
    const op2 = new SetRootOperation(new LogicalTimestamp(1, 1), FALSE_ID);
    type.insert(op1);
    type.insert(op2);
    expect(type.toValue()).toBe(TRUE_ID);
  });

  test('operation with greater timestamp wins', () => {
    const type = new DocRootType(ORIGIN);
    const op1 = new SetRootOperation(new LogicalTimestamp(1, 1), TRUE_ID);
    const op2 = new SetRootOperation(new LogicalTimestamp(2, 2), FALSE_ID);
    type.insert(op1);
    type.insert(op2);
    expect(type.toValue()).toBe(FALSE_ID);
  });

  test('operation with greater timestamp wins - 2', () => {
    const type = new DocRootType(ORIGIN);
    const op1 = new SetRootOperation(new LogicalTimestamp(1, 2), TRUE_ID);
    const op2 = new SetRootOperation(new LogicalTimestamp(2, 1), FALSE_ID);
    type.insert(op1);
    type.insert(op2);
    expect(type.toValue()).toBe(TRUE_ID);
  });

  test('operation with greater timestamp wins - 2', () => {
    const type = new DocRootType(ORIGIN);
    const op1 = new SetRootOperation(new LogicalTimestamp(1, 2), TRUE_ID);
    const op2 = new SetRootOperation(new LogicalTimestamp(2, 1), FALSE_ID);
    const op3 = new SetRootOperation(new LogicalTimestamp(2, 5), NULL_ID);
    type.insert(op1);
    type.insert(op2);
    type.insert(op3);
    expect(type.toValue()).toBe(NULL_ID);
  });
});
