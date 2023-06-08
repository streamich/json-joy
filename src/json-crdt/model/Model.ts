import {ITimestampStruct, IVectorClock, VectorClock, ServerVectorClock} from '../../json-crdt-patch/clock';
import {JsonCrdtPatchOperation, Patch} from '../../json-crdt-patch/Patch';
import {NodeIndex} from './NodeIndex';
import {ORIGIN, SESSION, SYSTEM_SESSION_TIME} from '../../json-crdt-patch/constants';
import {randomSessionId} from './util';
import {printTree} from '../../util/print/printTree';
import {RootLww} from '../types/lww-root/RootLww';
import {Const} from '../types/const/Const';
import {ArrInsOp} from '../../json-crdt-patch/operations/ArrInsOp';
import {ArrayRga} from '../types/rga-array/ArrayRga';
import type {JsonNode} from '../types/types';
import type {Printable} from '../../util/print/types';
import {ValSetOp} from '../../json-crdt-patch/operations/ValSetOp';
import {ValueLww} from '../types/lww-value/ValueLww';
import {ConstOp} from '../../json-crdt-patch/operations/ConstOp';
import {ArrOp} from '../../json-crdt-patch/operations/ArrOp';

export const UNDEFINED = new Const(ORIGIN, undefined);

/**
 * In instance of Model class represents the underlying data structure,
 * i.e. model, of the JSON CRDT document. The `.toJson()` can be called to
 * compute the "view" of the model.
 */
export class Model implements Printable {
  /**
   * Create a CRDT model which uses logical clock. Logical clock assigns a
   * logical timestamp to every node and operation. Logical timestamp consists
   * of a session ID and sequence number 2-tuple. Logical clocks allow to
   * sync peer-to-peer.
   *
   * @param clockOrSessionId Logical clock to use.
   * @returns CRDT model.
   */
  public static withLogicalClock(clockOrSessionId?: VectorClock | number): Model {
    const clock =
      typeof clockOrSessionId === 'number'
        ? new VectorClock(clockOrSessionId, 1)
        : clockOrSessionId || new VectorClock(randomSessionId(), 1);
    return new Model(clock);
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
  public static withServerClock(time: number = 0): Model {
    const clock = new ServerVectorClock(SESSION.SERVER, time);
    return new Model(clock);
  }

  /**
   * Root of the JSON document is implemented as Last Write Wins Register,
   * so that the JSON document does not necessarily need to be an object. The
   * JSON document can be any JSON value.
   */
  public root: RootLww = new RootLww(this, ORIGIN);

  /**
   * Clock that keeps track of logical timestamps of the current editing session
   * and logical clocks of all known peers.
   */
  public clock: IVectorClock;

  /**
   * Index of all known node objects (objects, array, strings, values)
   * in this document.
   */
  public index: NodeIndex<JsonNode> = new NodeIndex<JsonNode>();

  public constructor(clock: IVectorClock) {
    this.clock = clock;
    if (!clock.time) clock.time = 1;
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
    const index = this.index;
    if (op instanceof ConstOp) {
      if (!index.get(op.id)) index.set(new Const(op.id, op.val));
    } else if (op instanceof ValSetOp) {
      const obj = op.obj;
      const node = obj.sid === SESSION.SYSTEM && obj.time === SYSTEM_SESSION_TIME.ORIGIN ? this.root : index.get(obj);
      if (node instanceof ValueLww) {
        const newValue = index.get(op.val);
        if (newValue) {
          const old = node.set(op.val);
          if (old) this.deleteNodeTree(old);
        }
      }
    } else if (op instanceof ArrInsOp) {
      const node = index.get(op.obj);
      if (node instanceof ArrayRga) {
        const nodes: ITimestampStruct[] = [];
        const data = op.data;
        const length = data.length;
        for (let i = 0; i < length; i++) {
          const stamp = data[i];
          const valueNode = index.get(stamp);
          if (!valueNode) continue;
          if (node.id.time >= stamp.time) continue;
          nodes.push(stamp);
        }
        if (nodes.length) node.ins(op.ref, op.id, nodes);
      }
    } else if (op instanceof ArrOp) {
      if (!index.get(op.id)) index.set(new ArrayRga(this, op.id));
    }
  }

  /**
   * Recursively deletes a tree of nodes. Used when root node is overwritten or
   * when object contents of container node (object or array) is removed.
   */
  protected deleteNodeTree(value: ITimestampStruct) {
    const isSystemNode = value.sid === SESSION.SYSTEM;
    if (isSystemNode) return;
    const node = this.index.get(value);
    if (!node) return;
    node.children((child) => this.deleteNodeTree(child.id));
    this.index.delete(value);
  }

  /**
   * Creates a copy of this model with a new session ID.
   */
  public fork(sessionId: number = randomSessionId()): Model {
    throw new Error('Not implemented');
  }

  /**
   * Creates a copy of this model with the same session ID.
   */
  public clone(): Model {
    return this.fork(this.clock.sid);
  }

  /**
   * @returns Returns the view of the model.
   */
  public view(): unknown {
    return this.root.view();
  }

  /**
   * @returns Returns human-readable text for debugging.
   */
  public toString(tab: string = ''): string {
    const nl = () => '';
    return (
      this.constructor.name +
      printTree(tab, [
        (tab) => this.root.toString(tab),
        nl,
        (tab) => this.index.toString(tab),
        nl,
        (tab) => this.clock.toString(tab),
      ])
    );
  }
}
