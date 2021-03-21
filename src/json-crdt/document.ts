import {LogicalClock, LogicalTimestamp} from './clock';
import {ObjectType} from './object';
import {FALSE, NULL, ORIGIN, TRUE} from './constants';
import {OperationIndex} from './OperationIndex';
import {random40BitInt} from './util';
import {CrdtLWWRegisterType} from './lww-register/CrdtLWWRegisterType';
import {ICrdtOperation} from './operations/types';
import {CrdtLWWRegisterWriteOperation} from './lww-register/CrdtLWWRegisterWriteOperation';

export class Document {
  /**
   * Root of the JSON document is implemented as Last Write Wins Register,
   * so that the JSON document does not necessarily need to be an object. The
   * JSON document can be any JSON value.
   */
  public root = new CrdtLWWRegisterType(ORIGIN);

  /**
   * Clock that keeps track of logical timestamps of the current editing session.
   */
  public clock: LogicalClock;

  /**
   * Index of all known operations in this document.
   */
  public ops = new OperationIndex();

  constructor(sessionId: number = random40BitInt()) {
    this.clock = new LogicalClock(sessionId, 0);
    this.ops.index(this.root);
    this.ops.index(NULL);
    this.ops.index(TRUE);
    this.ops.index(FALSE);
  }

  // public applyPatch(patch: CrdtPatchCompact) {
  //   const [sessionId, time, ops] = patch;
  //   const clock = new LogicalClock(sessionId, time);
  //   for (const op of ops) {
  //     if (typeof op === 'number') {
        
  //       return;
  //     }
  //     const opcode = op[0];
  //     switch(opcode) {
  //       case 0: {
  //         const id = clock.tick(1);
  //         const [, depSessionId, depTime] = op as CrdtCreateObjectOperationCompactFull;
  //         const dep = new LogicalTimestamp(depSessionId, depTime);
  //         this.insertObject(id, dep);
  //         continue;
  //       }
  //       case 1: {
  //         const id = clock.tick(1);
  //         const [, depSessionId, depTime, key] = op as CrdtSetObjectFieldOperationCompact;
  //         const dep = new LogicalTimestamp(depSessionId, depTime);
  //         this.applyObjectInsertKeyOperation(id, dep, key);
  //         continue;
  //       }
  //     }
  //   }
  // }

  public patch(): PatchBuilder {
    return new PatchBuilder(this);    
  }

  public toJson() {
    return this.root.toJson();
  }

  public insertOperation(op: ICrdtOperation) {
    // Do nothing if operation is already known, this is idempotency property.
    if (!!this.ops.get(op.id)) return;
    
    this.ops.index(op);
    if (op instanceof CrdtLWWRegisterWriteOperation) {
      const {after} = op;
      const afterOp = this.ops.get(after);
      if (afterOp instanceof CrdtLWWRegisterWriteOperation) afterOp.type!.insert(op, afterOp);
      else if (afterOp instanceof CrdtLWWRegisterType) afterOp.insert(op);
      else throw new Error('Expected dependency to by LWW-Register.');
    }
  }

  public makeLWWRegister(): LWWRegisterType {
    const id = this.clock.tick(1);
    const type = new CrdtLWWRegisterType(this, id);
    this.ops.index(type);
    return type;
  }
}

export class PatchBuilder {
  public readonly ops: ICrdtOperation[] = [];

  constructor(public readonly doc: Document) {}

  public makeObject(): ObjectType {
    const {doc} = this;
    const id = doc.clock.tick(1);
    const operation = new ObjectType(doc, id, undefined);
    this.ops.push(operation);
    doc.ops.index(operation);
    return operation;
  }

  public insertRoot(value: LogicalTimestamp) {
    const {doc} = this;
    const {root} = doc;
    const id = doc.clock.tick(1);
    const after = root.end ? root.end.id : root.id;
    const op = new CrdtLWWRegisterWriteOperation(id, after, value);
    root.insert(op);
  }
}
