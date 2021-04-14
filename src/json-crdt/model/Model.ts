import type {JsonNode} from '../types';
import type {Path} from '../../json-pointer';
import {FALSE, NULL, TRUE, UNDEFINED} from '../constants';
import {IdentifiableIndex} from './IdentifiableIndex';
import {randomSessionId} from './util';
import {JsonCrdtPatchOperation, Patch} from '../../json-crdt-patch/Patch';
import {SetRootOperation} from '../../json-crdt-patch/operations/SetRootOperation';
import {ITimestamp, VectorClock} from '../../json-crdt-patch/clock';
import {DocRootType} from '../types/lww-doc-root/DocRootType';
import {ObjectType} from '../types/lww-object/ObjectType';
import {ArrayType} from '../types/rga-array/ArrayType';
import {StringType} from '../types/rga-string/StringType';
import {MakeObjectOperation} from '../../json-crdt-patch/operations/MakeObjectOperation';
import {SetObjectKeysOperation} from '../../json-crdt-patch/operations/SetObjectKeysOperation';
import {MakeArrayOperation} from '../../json-crdt-patch/operations/MakeArrayOperation';
import {InsertArrayElementsOperation} from '../../json-crdt-patch/operations/InsertArrayElementsOperation';
import {ORIGIN} from '../../json-crdt-patch/constants';
import {DeleteOperation} from '../../json-crdt-patch/operations/DeleteOperation';
import {MakeStringOperation} from '../../json-crdt-patch/operations/MakeStringOperation';
import {InsertStringSubstringOperation} from '../../json-crdt-patch/operations/InsertStringSubstringOperation';
import {JsonPatch} from '../JsonPatch';
import {Operation, operationToOp} from '../../json-patch';
import {ModelApi} from './api/ModelApi';
import {MakeValueOperation} from '../../json-crdt-patch/operations/MakeValueOperation';
import {ValueType} from '../types/lww-value/ValueType';
import {SetValueOperation} from '../../json-crdt-patch/operations/SetValueOperation';

export class Model {
  /**
   * Root of the JSON document is implemented as Last Write Wins Register,
   * so that the JSON document does not necessarily need to be an object. The
   * JSON document can be any JSON value.
   */
  public root: DocRootType = new DocRootType(this, ORIGIN, null);

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
  public api: ModelApi;

  constructor(clock: VectorClock = new VectorClock(randomSessionId(), 0)) {
    this.clock = clock;
    this.nodes.index(NULL);
    this.nodes.index(TRUE);
    this.nodes.index(FALSE);
    this.nodes.index(UNDEFINED);
    this.api = new ModelApi(this);
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
      if (!this.nodes.get(op.id)) this.nodes.index(new ObjectType(this, op.id));
    } else if (op instanceof MakeArrayOperation) {
      if (!this.nodes.get(op.id)) this.nodes.index(new ArrayType(this, op.id));
    } else if (op instanceof MakeStringOperation) {
      if (!this.nodes.get(op.id)) this.nodes.index(new StringType(this, op.id));
    } else if (op instanceof MakeValueOperation) {
      if (!this.nodes.get(op.id)) this.nodes.index(new ValueType(op.id, op.id, op.value));
    } else if (op instanceof SetRootOperation) {
      const oldValue = this.root.insert(op);
      if (oldValue) this.deleteNodeTree(oldValue);
    } else if (op instanceof SetObjectKeysOperation) {
      const obj = this.nodes.get(op.object);
      if (!(obj instanceof ObjectType)) return;
      obj.insert(op);
    } else if (op instanceof SetValueOperation) {
      const obj = this.nodes.get(op.obj);
      if (!(obj instanceof ValueType)) return;
      obj.insert(op);
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

  private deleteNodeTree(value: ITimestamp) {
    const isSystemNode = value.getSessionId() < 1;
    if (isSystemNode) return;
    const node = this.nodes.get(value);
    if (!node) return;
    for (const child of node.children()) this.deleteNodeTree(child);
    this.nodes.delete(value);
  }

  public toJson(): unknown {
    return this.root.toJson();
  }

  public clone(): Model {
    const doc = new Model(this.clock.clone());
    doc.root = this.root.clone(doc);
    return doc;
  }

  public fork(): Model {
    const sessionId = randomSessionId();
    const doc = new Model(this.clock.fork(sessionId));
    doc.root = this.root.clone(doc);
    return doc;
  }

  public toString(): string {
    const value = this.root.toValue();
    const op = this.nodes.get(value);
    return op ? op.toString('') : 'undefined';
  }

  public find(steps: Path): JsonNode {
    const id = this.root.toValue();
    let node: JsonNode = this.nodes.get(id) || NULL;
    const length = steps.length;
    if (!length) return node;
    let i = 0;
    while (i < length) {
      const step = steps[i++];
      if (node instanceof ObjectType) {
        const id = node.get(String(step));
        if (!id) return UNDEFINED;
        const nextNode = this.nodes.get(id);
        if (!nextNode) return UNDEFINED;
        node = nextNode;
      } else if (node instanceof ArrayType) {
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
