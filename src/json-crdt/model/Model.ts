import type {JsonNode} from '../types/types';
import {FALSE, NULL, TRUE, UNDEFINED} from '../constants';
import {LogicalNodeIndex, NodeIndex, ServerNodeIndex} from './nodes';
import {randomSessionId} from './util';
import {JsonCrdtPatchOperation, Patch} from '../../json-crdt-patch/Patch';
import {SetRootOperation} from '../../json-crdt-patch/operations/SetRootOperation';
import {ITimestamp, IVectorClock, LogicalVectorClock, ServerVectorClock} from '../../json-crdt-patch/clock';
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
import {ModelApi} from './api/ModelApi';
import {MakeValueOperation} from '../../json-crdt-patch/operations/MakeValueOperation';
import {ValueType} from '../types/lww-value/ValueType';
import {SetValueOperation} from '../../json-crdt-patch/operations/SetValueOperation';

/**
 * In instance of Model class represents the underlying data structure,
 * i.e. model, of the JSON CRDT document. The `.toJson()` can be called to
 * compute the "view" of the model.
 */
export class Model {
  /**
   * Create a CRDT model which uses logical clock. Logical clock assigns a
   * logical timestamp to every node and operation. Logical timestamp consists
   * of a session ID and sequence number 2-tuple. Logical clock allows to
   * sync peer-to-peer.
   * 
   * @param clock Logical clock to use.
   * @returns CRDT model.
   */
  public static withLogicalClock(clock?: LogicalVectorClock): Model {
    clock = clock || new LogicalVectorClock(randomSessionId(), 0);
    const nodes = new LogicalNodeIndex<JsonNode>();
    return new Model(clock, nodes);
  }

  /**
   * Create a CRDT model which uses server clock. In this model a central server
   * timestamps each operation with a sequence number. Each timestamp consists
   * simply of a sequence number, which was assigned by a server. In this model
   * all operations are approved, persisted and re-distributed to all clients by
   * a central server.
   * 
   * @param time Latest known server sequence number.
   * @returns CRDT model.
   */
  public static withServerClock(time?: number): Model {
    const clock = new ServerVectorClock(time || 0);
    const nodes = new ServerNodeIndex<JsonNode>();
    return new Model(clock, nodes);
  }

  /**
   * Root of the JSON document is implemented as Last Write Wins Register,
   * so that the JSON document does not necessarily need to be an object. The
   * JSON document can be any JSON value.
   */
  public root: DocRootType = new DocRootType(this, ORIGIN, null);

  /**
   * Clock that keeps track of logical timestamps of the current editing session
   * and logical clocks of all known peers.
   */
  public clock: IVectorClock;

  /**
   * Index of all known node objects (objects, array, strings, values) in this document.
   */
  public nodes: NodeIndex<JsonNode>;

  /**
   * API for applying changes to the current document.
   */
  public api: ModelApi;

  public constructor(clock: IVectorClock, nodes: NodeIndex<JsonNode>) {
    this.clock = clock;
    this.nodes = nodes;
    this.api = new ModelApi(this);
  }

  /** Returns an indexed node, if any. */
  public node(id: ITimestamp): JsonNode | undefined {
    if (id.getSessionId() === 0) {
      switch(id.time) {
        case 1: return NULL;
        case 2: return TRUE;
        case 3: return FALSE;
        case 4: return UNDEFINED;
      }
    }
    return this.nodes.get(id);
  }

  /**
   * Applies a single patch to the document. All mutations to the model must go
   * through this method.
   */
  public applyPatch(patch: Patch) {
    const ops = patch.ops;
    const {length} = ops;
    for (let i = 0; i < length; i++) this.applyOperation(ops[i]);
  }

  /**
   * Applies a single operation to the model. All mutations to the model must go
   * through this method.
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
      if (obj instanceof ObjectType) obj.insert(op);
    } else if (op instanceof SetValueOperation) {
      const obj = this.nodes.get(op.obj);
      if (obj instanceof ValueType) obj.insert(op);
    } else if (op instanceof InsertArrayElementsOperation) {
      const arr = this.nodes.get(op.arr);
      if (arr instanceof ArrayType) arr.insert(op);
    } else if (op instanceof InsertStringSubstringOperation) {
      const arr = this.nodes.get(op.obj);
      if (arr instanceof StringType) arr.onInsert(op);
    } else if (op instanceof DeleteOperation) {
      const node = this.nodes.get(op.obj);
      if (node instanceof ArrayType) node.delete(op);
      else if (node instanceof StringType) node.onDelete(op);
    }
  }

  /**
   * Recursively deletes a tree of nodes. Used when root node is overwritten or
   * when object contents of container node (object or array) is removed.
   */
  private deleteNodeTree(value: ITimestamp) {
    const isSystemNode = value.getSessionId() < 1;
    if (isSystemNode) return;
    const node = this.nodes.get(value);
    if (!node) return;
    for (const child of node.children()) this.deleteNodeTree(child);
    this.nodes.delete(value);
  }

  /** Creates a copy of this model with the same session ID. */
  public clone(): Model {
    const model = this.clock instanceof LogicalVectorClock
      ? Model.withLogicalClock(this.clock.clone())
      : Model.withServerClock(this.clock.time);
    model.root = this.root.clone(model);
    return model;
  }

  /** Creates a copy of this model with a new session ID. */
  public fork(sessionId: number = randomSessionId()): Model {
    const model = this.clock instanceof LogicalVectorClock
      ? Model.withLogicalClock(this.clock.fork(sessionId))
      : Model.withServerClock(this.clock.time);
    model.root = this.root.clone(model);
    return model;
  }

  /** @returns Returns JSON view of the model. */
  public toJson(): unknown {
    return this.root.toJson();
  }

  /** @returns Returns human-readable text for debugging. */
  public toString(tab?: string): string {
    return this.root.toString(tab);
  }
}
