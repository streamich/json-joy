import {CrdtPatchCompact, CrdtCreateObjectOperationCompactFull, CrdtSetObjectFieldOperationCompact} from '../json-crdt-patch/types';
import {LogicalClock, LogicalTimestamp, SINGULARITY} from './clock';
import {CrdtOperation, CrdtType} from './types';
import {LWWRegisterType} from './lww-register';
import {InsertObjectKeyOperation, ObjectType} from './object';

export class Document {
  /**
   * Root of the JSON document is implemented as Last Write Wins Register,
   * so that the JSON document does not necessarily need to be an object. The
   * JSON document can be any JSON value.
   */
  public root = new LWWRegisterType(this, SINGULARITY, SINGULARITY);

  /**
   * An index of all operations in this document accessible by operation ID.
   * 
   *     (sessionId, time) -> operation
   */
  public operations: Map<number, Map<number, CrdtOperation | CrdtType>> = new Map([
    [this.root.id.sessionId, new Map([
      [this.root.id.time, this.root],
    ])],
  ]);

  constructor() {}

  /**
   * Retrieve any known operation in this document by its ID.
   */
  public operation(id: LogicalTimestamp): undefined | CrdtOperation | CrdtType {
    const map1 = this.operations;
    const map2 = map1.get(id.sessionId);
    if (!map2) return undefined;
    return map2.get(id.time);
  }

  /**
   * Index an operation in the global operation index.
   */
  public indexOperation(operation: CrdtOperation) {
    const {sessionId, time} = operation.id;
    let map = this.operations.get(operation.id.sessionId);
    if (!map) {
      map = new Map<number, CrdtOperation | CrdtType>();
      this.operations.set(sessionId, map);
    }
    map.set(time, operation);
  }

  public applyPatch(patch: CrdtPatchCompact) {
    const [sessionId, time, ops] = patch;
    const clock = new LogicalClock(sessionId, time);
    for (const op of ops) {
      if (typeof op === 'number') {
        
        return;
      }
      const opcode = op[0];
      switch(opcode) {
        case 0: {
          const id = clock.tick(1);
          const [, depSessionId, depTime] = op as CrdtCreateObjectOperationCompactFull;
          const dep = new LogicalTimestamp(depSessionId, depTime);
          this.applyNewObjectOperation(id, dep);
          continue;
        }
        case 1: {
          const id = clock.tick(1);
          const [, depSessionId, depTime, key] = op as CrdtSetObjectFieldOperationCompact;
          const dep = new LogicalTimestamp(depSessionId, depTime);
          this.applyObjectInsertKeyOperation(id, dep, key);
          continue;
        }
      }
    }
  }

  private applyNewObjectOperation(id: LogicalTimestamp, dep: LogicalTimestamp) {
    const parent = this.operation(dep) as CrdtType;
    const operation = new ObjectType(this, id, dep);
    parent.update(operation);
    this.indexOperation(operation);
  }

  private applyObjectInsertKeyOperation(id: LogicalTimestamp, dep: LogicalTimestamp, key: string) {
    const dependency = this.operation(dep) as InsertObjectKeyOperation;
    const operation = new InsertObjectKeyOperation(this, id, dep, key);
    dependency.type!.update(operation);
    this.indexOperation(operation);
  }

  public toJson() {
    return this.root.toJson();
  }
}
