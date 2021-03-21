import type {JsonNode} from './types';
import {FALSE, NULL, ORIGIN, TRUE} from './constants';
import {IdentifiableIndex} from './IdentifiableIndex';
import {random40BitInt} from './util';
import {LWWRegisterType} from './lww-register/LWWRegisterType';
import {Patch} from '../json-crdt-patch/Patch';
import {SetRootOperation} from '../json-crdt-patch/operations/SetRootOperation';
import {LWWRegisterWriteOp} from './lww-register/LWWRegisterWriteOp';
import {LogicalClock} from '../json-crdt-patch/clock';

export class Document {
  /**
   * Root of the JSON document is implemented as Last Write Wins Register,
   * so that the JSON document does not necessarily need to be an object. The
   * JSON document can be any JSON value.
   */
  public root = new LWWRegisterType(ORIGIN);

  /**
   * Clock that keeps track of logical timestamps of the current editing session.
   */
  public clock: LogicalClock;

  /**
   * Index of all known operations in this document.
   */
  public nodes = new IdentifiableIndex<JsonNode>();

  constructor(sessionId: number = random40BitInt()) {
    this.clock = new LogicalClock(sessionId, 0);
    this.nodes.index(NULL);
    this.nodes.index(TRUE);
    this.nodes.index(FALSE);
  }

  public applyPatch(patch: Patch) {
    for (const op of patch.ops) {
      if (op instanceof SetRootOperation) {
        const rootOp = new LWWRegisterWriteOp(op.id, op.value);
        this.root.insert(rootOp);
        continue;
      }
    }
  }

  // public patch(): PatchBuilder {
  //   return new PatchBuilder(this);    
  // }

  public toJson(): unknown {
    const value = this.root.toValue();
    const op = this.nodes.get(value);
    if (!op) return undefined;
    return op.toJson();
  }

  // public insertOperation(op: ICrdtOperation) {
  //   // Do nothing if operation is already known, this is idempotency property.
  //   if (!!this.ops.get(op.id)) return;
    
  //   this.ops.index(op);
  //   if (op instanceof CrdtLWWRegisterWriteOperation) {
  //     const {after} = op;
  //     const afterOp = this.ops.get(after);
  //     if (afterOp instanceof CrdtLWWRegisterWriteOperation) afterOp.type!.insert(op, afterOp);
  //     else if (afterOp instanceof CrdtLWWRegisterType) afterOp.insert(op);
  //     else throw new Error('Expected dependency to by LWW-Register.');
  //   }
  // }

  // public makeLWWRegister(): LWWRegisterType {
  //   const id = this.clock.tick(1);
  //   const type = new CrdtLWWRegisterType(this, id);
  //   this.ops.index(type);
  //   return type;
  // }
}

// export class PatchBuilder {
//   public readonly ops: ICrdtOperation[] = [];

//   constructor(public readonly doc: Document) {}

//   public makeObject(): ObjectType {
//     const {doc} = this;
//     const id = doc.clock.tick(1);
//     const operation = new ObjectType(doc, id, undefined);
//     this.ops.push(operation);
//     doc.ops.index(operation);
//     return operation;
//   }

//   public insertRoot(value: LogicalTimestamp) {
//     const {doc} = this;
//     const {root} = doc;
//     const id = doc.clock.tick(1);
//     const after = root.end ? root.end.id : root.id;
//     const op = new CrdtLWWRegisterWriteOperation(id, after, value);
//     root.insert(op);
//   }
// }
