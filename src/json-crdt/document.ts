import type {JsonNode} from './types';
import {FALSE, NULL, ORIGIN, TRUE} from './constants';
import {IdentifiableIndex} from './IdentifiableIndex';
import {random40BitInt} from './util';
import {Patch} from '../json-crdt-patch/Patch';
import {SetRootOperation} from '../json-crdt-patch/operations/SetRootOperation';
import {LogicalClock} from '../json-crdt-patch/clock';
import {DocRootType} from './lww-register-doc-root/DocRootType';
import {MakeObjectOperation} from '../json-crdt-patch/operations/MakeObjectOperation';
import {LWWObjectType} from './lww-object/LWWObjectType';
import {SetObjectKeysOperation} from '../json-crdt-patch/operations/SetObjectKeysOperation';
import {MakeNumberOperation} from '../json-crdt-patch/operations/MakeNumberOperation';
import {LWWNumberType} from './lww-number/LWWNumberType';
import {SetNumberOperation} from '../json-crdt-patch/operations/SetNumberOperation';
import {MakeArrayOperation} from '../json-crdt-patch/operations/MakeArrayOperation';
import {ArrayType} from './rga-array/ArrayType';
import {InsertArrayElementsOperation} from '../json-crdt-patch/operations/InsertArrayElementsOperation';

export class Document {
  /**
   * Root of the JSON document is implemented as Last Write Wins Register,
   * so that the JSON document does not necessarily need to be an object. The
   * JSON document can be any JSON value.
   */
  public root = new DocRootType(ORIGIN);

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
      if (op instanceof MakeObjectOperation) {
        const exists = !!this.nodes.get(op.id);
        if (exists) return; // We can return, because all remaining ops in the patch will already exist, too.
        const obj = new LWWObjectType(this, op.id);
        this.nodes.index(obj);
        continue;
      }
      if (op instanceof MakeArrayOperation) {
        const exists = !!this.nodes.get(op.id);
        if (exists) return;
        const obj = new ArrayType(this, op.id);
        this.nodes.index(obj);
        continue;
      }
      if (op instanceof MakeNumberOperation) {
        const exists = !!this.nodes.get(op.id);
        if (exists) return;
        const num = new LWWNumberType(op.id, 0);
        this.nodes.index(num);
        continue;
      }
      if (op instanceof SetRootOperation) {
        this.root.insert(op);
        continue;
      }
      if (op instanceof SetObjectKeysOperation) {
        const obj = this.nodes.get(op.object);
        if (!(obj instanceof LWWObjectType)) continue;
        obj.insert(op);
        continue;
      }
      if (op instanceof SetNumberOperation) {
        const num = this.nodes.get(op.num);
        if (!(num instanceof LWWNumberType)) continue;
        num.insert(op);
        continue;
      }
      if (op instanceof InsertArrayElementsOperation) {
        const arr = this.nodes.get(op.arr);
        if (!(arr instanceof ArrayType)) continue;
        arr.insert(op);
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
