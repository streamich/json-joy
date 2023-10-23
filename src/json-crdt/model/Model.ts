// TODO: perf: try namespace import
import {
  NewConOp,
  NewObjOp,
  NewValOp,
  NewVecOp,
  NewStrOp,
  NewBinOp,
  NewArrOp,
  InsValOp,
  InsObjOp,
  InsVecOp,
  InsStrOp,
  InsBinOp,
  InsArrOp,
  DelOp,
} from '../../json-crdt-patch/operations';
import {ArrayRga} from '../types/rga-array/ArrayRga';
import {BinaryRga} from '../types/rga-binary/BinaryRga';
import {Const} from '../types/const/Const';
import {encoder, decoder} from '../codec/structural/binary/shared';
import {ITimestampStruct, Timestamp, IVectorClock, VectorClock, ServerVectorClock} from '../../json-crdt-patch/clock';
import {JsonCrdtPatchOperation, Patch} from '../../json-crdt-patch/Patch';
import {ModelApi} from './api/ModelApi';
import {NodeIndex} from './NodeIndex';
import {ObjectLww} from '../types/lww-object/ObjectLww';
import {ORIGIN, SESSION, SYSTEM_SESSION_TIME} from '../../json-crdt-patch/constants';
import {randomSessionId} from './util';
import {RootLww} from '../types/lww-root/RootLww';
import {StringRga} from '../types/rga-string/StringRga';
import {ValueLww} from '../types/lww-value/ValueLww';
import {ArrayLww} from '../types/lww-array/ArrayLww';
import {printTree} from '../../util/print/printTree';
import {Extensions} from '../extensions/Extensions';
import type {JsonNode, JsonNodeView} from '../types/types';
import type {Printable} from '../../util/print/types';

export const UNDEFINED = new Const(ORIGIN, undefined);

/**
 * In instance of Model class represents the underlying data structure,
 * i.e. model, of the JSON CRDT document. The `.toJson()` can be called to
 * compute the "view" of the model.
 */
export class Model<RootJsonNode extends JsonNode = JsonNode> implements Printable {
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
   * Un-serializes a model from "binary" structural encoding.
   * @param data Binary blob of a model encoded using "binary" structural
   *        encoding.
   * @returns An instance of a model.
   */
  public static fromBinary(data: Uint8Array): Model {
    return decoder.decode(data);
  }

  /**
   * Root of the JSON document is implemented as Last Write Wins Register,
   * so that the JSON document does not necessarily need to be an object. The
   * JSON document can be any JSON value.
   */
  public root: RootLww<RootJsonNode> = new RootLww<RootJsonNode>(this, ORIGIN);

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

  /**
   * Extensions to the JSON CRDT protocol. Extensions are used to implement
   * custom data types on top of the JSON CRDT protocol.
   */
  public ext: Extensions = new Extensions();

  public constructor(clock: IVectorClock) {
    this.clock = clock;
    if (!clock.time) clock.time = 1;
  }

  private _api?: ModelApi<RootJsonNode>;

  /**
   * API for applying changes to the current document.
   */
  public get api(): ModelApi<RootJsonNode> {
    if (!this._api) this._api = new ModelApi<RootJsonNode>(this);
    return this._api;
  }

  /**
   * @private
   * Experimental node retrieval API using proxy objects.
   */
  public get find() {
    return this.api.r.proxy();
  }

  /** Tracks number of times the `applyPatch` was called. */
  public tick: number = 0;

  public onchange: undefined | (() => void) = undefined;

  public applyBatch(patches: Patch[]) {
    const length = patches.length;
    for (let i = 0; i < length; i++) this.applyPatch(patches[i]);
  }

  /**
   * Applies a single patch to the document. All mutations to the model must go
   * through this method.
   */
  public applyPatch(patch: Patch) {
    const ops = patch.ops;
    const {length} = ops;
    for (let i = 0; i < length; i++) this.applyOperation(ops[i]);
    this.tick++;
    this.onchange?.();
  }

  /**
   * Applies a single operation to the model. All mutations to the model must go
   * through this method.
   *
   * For advanced use only, better use `applyPatch` instead. You MUST increment
   * the `tick` property and call `onchange` after calling this method.
   *
   * @param op Any JSON CRDT Patch operation
   */
  public applyOperation(op: JsonCrdtPatchOperation): void {
    this.clock.observe(op.id, op.span());
    const index = this.index;
    // TODO: Use switch statement here? And rearrange cases by frequency of use?
    if (op instanceof InsStrOp) {
      const node = index.get(op.obj);
      if (node instanceof StringRga) node.ins(op.ref, op.id, op.data);
    } else if (op instanceof NewObjOp) {
      if (!index.get(op.id)) index.set(new ObjectLww(this, op.id));
    } else if (op instanceof NewArrOp) {
      if (!index.get(op.id)) index.set(new ArrayRga(this, op.id));
    } else if (op instanceof NewStrOp) {
      if (!index.get(op.id)) index.set(new StringRga(op.id));
    } else if (op instanceof NewValOp) {
      if (!index.get(op.id)) {
        const val = index.get(op.val);
        if (val) index.set(new ValueLww(this, op.id, op.val));
      }
    } else if (op instanceof NewConOp) {
      if (!index.get(op.id)) index.set(new Const(op.id, op.val));
    } else if (op instanceof InsObjOp) {
      const node = index.get(op.obj);
      const tuples = op.data;
      const length = tuples.length;
      if (node instanceof ObjectLww) {
        for (let i = 0; i < length; i++) {
          const tuple = tuples[i];
          const valueNode = index.get(tuple[1]);
          if (!valueNode) continue;
          if (node.id.time >= tuple[1].time) continue;
          const old = node.put(tuple[0] + '', valueNode.id);
          if (old) this.deleteNodeTree(old);
        }
      }
    } else if (op instanceof InsVecOp) {
      const node = index.get(op.obj);
      const tuples = op.data;
      const length = tuples.length;
      if (node instanceof ArrayLww) {
        for (let i = 0; i < length; i++) {
          const tuple = tuples[i];
          const valueNode = index.get(tuple[1]);
          if (!valueNode) continue;
          if (node.id.time >= tuple[1].time) continue;
          const old = node.put(Number(tuple[0]), valueNode.id);
          if (old) this.deleteNodeTree(old);
        }
      }
    } else if (op instanceof InsValOp) {
      const obj = op.obj;
      const node = obj.sid === SESSION.SYSTEM && obj.time === SYSTEM_SESSION_TIME.ORIGIN ? this.root : index.get(obj);
      if (node instanceof ValueLww) {
        const newValue = index.get(op.val);
        if (newValue) {
          const old = node.set(op.val);
          if (old) this.deleteNodeTree(old);
        }
      }
    } else if (op instanceof InsArrOp) {
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
    } else if (op instanceof DelOp) {
      const node = index.get(op.obj);
      if (node instanceof ArrayRga) {
        const length = op.what.length;
        for (let i = 0; i < length; i++) {
          const span = op.what[i];
          for (let j = 0; j < span.span; j++) {
            const id = node.getById(new Timestamp(span.sid, span.time + j));
            if (id) this.deleteNodeTree(id);
          }
        }
        node.delete(op.what);
      } else if (node instanceof StringRga) node.delete(op.what);
      else if (node instanceof BinaryRga) node.delete(op.what);
    } else if (op instanceof NewBinOp) {
      if (!index.get(op.id)) index.set(new BinaryRga(op.id));
    } else if (op instanceof InsBinOp) {
      const node = index.get(op.obj);
      if (node instanceof BinaryRga) node.ins(op.ref, op.id, op.data);
    } else if (op instanceof NewVecOp) {
      if (!index.get(op.id)) index.set(new ArrayLww(this, op.id));
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
    const copy = Model.fromBinary(this.toBinary());
    if (copy.clock.sid !== sessionId && copy.clock instanceof VectorClock) copy.clock = copy.clock.fork(sessionId);
    copy.ext = this.ext;
    return copy;
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
  public view(): Readonly<JsonNodeView<RootJsonNode>> {
    return this.root.view();
  }

  /**
   * @returns Returns human-readable text for debugging.
   */
  public toString(tab: string = ''): string {
    const nl = () => '';
    const hasExtensions = this.ext.size() > 0;
    return (
      this.constructor.name +
      printTree(tab, [
        (tab) => this.root.toString(tab),
        nl,
        (tab) => this.index.toString(tab),
        nl,
        (tab) => this.clock.toString(tab),
        hasExtensions ? nl : null,
        hasExtensions ? (tab) => this.ext.toString(tab) : null,
      ])
    );
  }

  /**
   * Serialize this model using "binary" structural encoding.
   * @returns This model encoded in octets.
   */
  public toBinary(): Uint8Array {
    return encoder.encode(this);
  }
}
