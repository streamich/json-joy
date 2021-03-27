import type {JsonNode} from './types';
import {FALSE, NULL, TRUE, UNDEFINED} from './constants';
import {IdentifiableIndex} from './IdentifiableIndex';
import {random40BitInt} from './util';
import {JsonCrdtPatchOperation, Patch} from '../json-crdt-patch/Patch';
import {SetRootOperation} from '../json-crdt-patch/operations/SetRootOperation';
import {VectorClock} from '../json-crdt-patch/clock';
import {DocRootType} from './types/lww-register-doc-root/DocRootType';
import {LWWObjectType} from './types/lww-object/LWWObjectType';
import {NumberType} from './types/lww-number/NumberType';
import {ArrayType} from './types/rga-array/ArrayType';
import {StringType} from './types/rga-string/StringType';
import {MakeObjectOperation} from '../json-crdt-patch/operations/MakeObjectOperation';
import {SetObjectKeysOperation} from '../json-crdt-patch/operations/SetObjectKeysOperation';
import {MakeNumberOperation} from '../json-crdt-patch/operations/MakeNumberOperation';
import {SetNumberOperation} from '../json-crdt-patch/operations/SetNumberOperation';
import {MakeArrayOperation} from '../json-crdt-patch/operations/MakeArrayOperation';
import {InsertArrayElementsOperation} from '../json-crdt-patch/operations/InsertArrayElementsOperation';
import {ORIGIN} from '../json-crdt-patch/constants';
import {DeleteOperation} from '../json-crdt-patch/operations/DeleteOperation';
import {MakeStringOperation} from '../json-crdt-patch/operations/MakeStringOperation';
import {InsertStringSubstringOperation} from '../json-crdt-patch/operations/InsertStringSubstringOperation';
import {JsonPatch} from './JsonPatch';
import {Operation, operationToOp} from '../json-patch';
import {Path} from '../json-pointer';
import {DocumentApi} from './api/DocumentApi';

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
  public clock: VectorClock;

  /**
   * Index of all known JSON nodes (objects, array, strings, numbers) in this document.
   */
  public nodes = new IdentifiableIndex<JsonNode>();

  /**
   * API for applying changes to the current document.
   */
  public api: DocumentApi;

  constructor(clock: VectorClock = new VectorClock(random40BitInt(), 0)) {
    this.clock = clock;
    this.nodes.index(NULL);
    this.nodes.index(TRUE);
    this.nodes.index(FALSE);
    this.nodes.index(UNDEFINED);
    this.api = new DocumentApi(this)
  }

  public applyPatch(patch: Patch) {
    const ops = patch.ops;
    const {length} = ops;
    for (let i = 0; i < length; i++) this.applyOperation(ops[i]);
  }

  /**
   * Applies a single operation to the document. All mutations to the document
   * must go through this method.
   * 
   * @param op Any JSON CRDT Patch operation
   */
  public applyOperation(op: JsonCrdtPatchOperation): void {
    this.clock.observe(op.id, op.span());
    if (op instanceof MakeObjectOperation) {
      if (!this.nodes.get(op.id)) this.nodes.index(new LWWObjectType(this, op.id));
    } else if (op instanceof MakeArrayOperation) {
      if (!this.nodes.get(op.id)) this.nodes.index(new ArrayType(this, op.id));
    } else if (op instanceof MakeStringOperation) {
      if (!this.nodes.get(op.id)) this.nodes.index(new StringType(this, op.id));
    } else if (op instanceof MakeNumberOperation) {
      if (!this.nodes.get(op.id)) this.nodes.index(new NumberType(op.id, 0));
    } else if (op instanceof SetRootOperation) {
      this.root.insert(op);
    } else if (op instanceof SetObjectKeysOperation) {
      const obj = this.nodes.get(op.object);
      if (!(obj instanceof LWWObjectType)) return;
      obj.insert(op);
    } else if (op instanceof SetNumberOperation) {
      const num = this.nodes.get(op.num);
      if (!(num instanceof NumberType)) return;
      num.insert(op);
    } else if (op instanceof InsertArrayElementsOperation) {
      const arr = this.nodes.get(op.arr);
      if (!(arr instanceof ArrayType)) return;
      arr.insert(op);
    } else if (op instanceof InsertStringSubstringOperation) {
      const arr = this.nodes.get(op.obj);
      if (!(arr instanceof StringType)) return;
      arr.onInsert(op);
    } else if (op instanceof DeleteOperation) {
      const node = this.nodes.get(op.obj);
      if (node instanceof ArrayType) node.delete(op);
      else if (node instanceof StringType) node.onDelete(op);
    }
  }

  public toJson(): unknown {
    const value = this.root.toValue();
    const op = this.nodes.get(value);
    if (!op) return undefined;
    return op.toJson();
  }

  public clone(): Document {
    const doc = new Document(this.clock.clone());
    for (const node of this.nodes.iterate())
      doc.nodes.index(node.clone(doc));
    if (this.root.last)
      doc.root.insert(new SetRootOperation(this.root.last.id, this.root.last.value));
    return doc;
  }

  public fork(): Document {
    const doc = this.clone();
    doc.clock.sessionId = random40BitInt();
    return doc;
  }

  public toString(): string {
    const value = this.root.toValue();
    const op = this.nodes.get(value);
    if (!op) return 'undefined';
    return op.toString('');
  }

  public find(steps: Path): JsonNode {
    const id = this.root.toValue();
    let node: JsonNode = this.nodes.get(id) || NULL;
    const length = steps.length;
    if (!length) return node;
    let i = 0;
    while (i < length) {
      const step = steps[i++];
      if (node instanceof LWWObjectType) {
        const id = node.get(String(step));
        if (!id) return UNDEFINED;
        const nextNode = this.nodes.get(id);
        if (!nextNode) return UNDEFINED;
        node = nextNode;
        continue;
      }
      if (node instanceof ArrayType) {
        const id = node.findValue(Number(step));
        const nextNode = this.nodes.get(id);
        if (!nextNode) return UNDEFINED;
        node = nextNode;
        continue;
      }
    }
    return node;
  }

  public applyJsonPatch(operations: Operation[]) {
    const ops = operations.map(operationToOp);
    const jsonPatch = new JsonPatch(this);
    const draft = jsonPatch.fromOps(ops);
    const patch = draft.patch(this.clock);
    this.clock.tick(patch.span());
    this.applyPatch(patch);
  }
}
