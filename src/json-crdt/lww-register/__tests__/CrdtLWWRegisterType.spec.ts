import {LogicalTimestamp} from '../../clock';
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from '../../constants';
import {Document} from '../../document';
import {CrdtLWWRegisterType} from '../CrdtLWWRegisterType';
import {CrdtLWWRegisterWriteOperation} from '../CrdtLWWRegisterWriteOperation';

describe('CrdtLWWRegisterType', () => {
  test('can create', () => {
    const document = new Document();
    const type = document.makeLWWRegister();
    expect(type).toBeInstanceOf(CrdtLWWRegisterType);
  });

  test('default value is undefined', () => {
    const document = new Document();
    const type = document.makeLWWRegister();
    expect(type.toJson()).toBe(undefined);
  });

  test('can set initial value', () => {
    const document = new Document();
    const type = document.makeLWWRegister();
    const op = type.makeWriteOperation(TRUE_ID);
    document.insertOperation(op);
    expect(type.toJson()).toBe(true);
  });

  test('can overwrite value', () => {
    const document = new Document();
    const type = document.makeLWWRegister();
    const op1 = type.makeWriteOperation(TRUE_ID);
    document.insertOperation(op1);
    const op2 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op2);
    expect(type.toJson()).toBe(false);
  });

  test('can overwrite value twice', () => {
    const document = new Document();
    const type = document.makeLWWRegister();
    const op1 = type.makeWriteOperation(TRUE_ID);
    document.insertOperation(op1);
    const op2 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op2);
    const op3 = type.makeWriteOperation(NULL_ID);
    document.insertOperation(op3);
    expect(type.toJson()).toBe(null);
  });

  test('operation of with greater session ID wins, when same clock op inserted at list end', () => {
    const user1SessionId = 1;
    const user2SessionId = 2;
    const document = new Document(user1SessionId);
    const type = document.makeLWWRegister();
    const op1 = type.makeWriteOperation(TRUE_ID);
    document.insertOperation(op1);
    const op2 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op2);
    const op2x = new CrdtLWWRegisterWriteOperation(new LogicalTimestamp(user2SessionId, op2.id.time), op2.after, NULL_ID);
    document.insertOperation(op2x);
    expect(type.length()).toBe(3);
    expect(type.toJson()).toBe(null);
  });

  test('operation of with greater session ID wins, when same clock op inserted at list end - 2', () => {
    const user1SessionId = 2;
    const user2SessionId = 1;
    const document = new Document(user1SessionId);
    const type = document.makeLWWRegister();
    const op1 = type.makeWriteOperation(TRUE_ID);
    document.insertOperation(op1);
    const op2 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op2);
    const op2x = new CrdtLWWRegisterWriteOperation(new LogicalTimestamp(user2SessionId, op2.id.time), op2.after, NULL_ID);
    document.insertOperation(op2x);
    expect(type.length()).toBe(3);
    expect(type.toJson()).toBe(false);
  });

  test('operation with highest clock time wins, when inserted at the beginning of list', () => {
    const user1SessionId = 1;
    const user2SessionId = 2;
    const document = new Document(user1SessionId);
    const type = document.makeLWWRegister();
    const op1 = type.makeWriteOperation(TRUE_ID);
    document.insertOperation(op1);
    const op2 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op2);
    const op3 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op3);
    const op2x = new CrdtLWWRegisterWriteOperation(new LogicalTimestamp(user2SessionId, op2.id.time + 5), op2.after, NULL_ID);
    document.insertOperation(op2x);
    expect(type.length()).toBe(4);
    expect(type.toJson()).toBe(null);
  });

  test('operation with highest clock time wins, when inserted at the beginning of list - 2', () => {
    const user1SessionId = 2;
    const user2SessionId = 1;
    const document = new Document(user1SessionId);
    const type = document.makeLWWRegister();
    const op1 = type.makeWriteOperation(TRUE_ID);
    document.insertOperation(op1);
    const op2 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op2);
    const op3 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op3);
    const op2x = new CrdtLWWRegisterWriteOperation(new LogicalTimestamp(user2SessionId, op2.id.time + 5), op2.after, NULL_ID);
    document.insertOperation(op2x);
    expect(type.length()).toBe(4);
    expect(type.toJson()).toBe(null);
  });

  test('operation with highest clock time and session ID (as a tie breaker) wins, when inserted at the beginning of list', () => {
    const user1SessionId = 1;
    const user2SessionId = 2;
    const document = new Document(user1SessionId);
    const type = document.makeLWWRegister();
    const op1 = type.makeWriteOperation(TRUE_ID);
    document.insertOperation(op1);
    const op2 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op2);
    const op3 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op3);
    const op2x = new CrdtLWWRegisterWriteOperation(new LogicalTimestamp(user2SessionId, op3.id.time), op2.after, NULL_ID);
    document.insertOperation(op2x);
    expect(type.length()).toBe(4);
    expect(type.toJson()).toBe(null);
  });

  test('can insert undefined value (deletion operation)', () => {
    const user1SessionId = 1;
    const user2SessionId = 2;
    const document = new Document(user1SessionId);
    const type = document.makeLWWRegister();
    const op1 = type.makeWriteOperation(TRUE_ID);
    document.insertOperation(op1);
    const op2 = type.makeWriteOperation(FALSE_ID);
    document.insertOperation(op2);
    const op3 = type.makeWriteOperation(UNDEFINED_ID);
    document.insertOperation(op3);
    expect(type.length()).toBe(3);
    expect(type.toJson()).toBe(undefined);
  });
});
