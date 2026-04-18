import {compare, type IClockVector, type ITimestampStruct, printTs} from '../../../json-crdt-patch/clock';
import {ORIGIN, SESSION} from '../../../json-crdt-patch/constants';
import {printTree} from 'tree-dump/lib/printTree';
import {UNDEFINED} from '../../model/Model';
import {InsValOp, NewValOp} from '../../../json-crdt-patch';
import type {JsonNode, JsonNodeView} from '..';
import type {Model} from '../../model';
import type {Printable} from 'tree-dump/lib/types';
import type {DeltaMutator} from '../../delta/Delta';

/**
 * Represents a `val` JSON CRDT node, which is a Last-write-wins (LWW) register.
 * The `val` node holds a single value, which is a reference to another JSON
 * CRDT node.
 *
 * @category CRDT Node
 */
export class ValNode<Value extends JsonNode = JsonNode> implements JsonNode<JsonNodeView<Value>>, Printable {
  constructor(
    /**
     * @ignore
     */
    public readonly doc: Model<any>,
    public readonly id: ITimestampStruct,
    /**
     * The current value of the node, which is a reference to another JSON CRDT
     * node.
     */
    public val: ITimestampStruct,
  ) {}

  /**
   * @ignore
   */
  public set(val: ITimestampStruct): ITimestampStruct | undefined {
    if (compare(val, this.val) <= 0 && this.val.sid !== SESSION.SYSTEM) return;
    if (compare(val, this.id) <= 0) return;
    const oldVal = this.val;
    this.val = val;
    return oldVal;
  }

  /**
   * Returns the latest value of the node, the JSON CRDT node that `val` points
   * to.
   *
   * @returns The latest value of the node.
   */
  public node(): Value {
    // `UNDEFINED` is a shared singleton marker. Return a fresh wrapper so
    // per-node UI state and cached APIs cannot leak across independent models.
    // If two models share nodes, such as `UNDEFINED`, the UI, which renders
    // the models, might cache the `UNDEFINED` node, but then it does not know
    // **to which model** the cached `UNDEFINED` belongs. Or the caching layer
    // would need to cache tuples (model, node), instead of just nodes.
    return this.val.sid === SESSION.SYSTEM ? (UNDEFINED as any).clone() : this.child();
  }

  // ----------------------------------------------------------------- JsonNode

  public name(): string {
    return 'val';
  }

  public view(): JsonNodeView<Value> {
    return this.node()?.view() as JsonNodeView<Value>;
  }

  /**
   * @ignore
   */
  public children(callback: (node: Value) => void) {
    callback(this.node());
  }

  /**
   * @ignore
   */
  public child(): Value {
    return this.doc.index.get(this.val)! as Value;
  }

  /**
   * @ignore
   */
  public container(): JsonNode | undefined {
    const child = this.node();
    return child ? child.container() : undefined;
  }

  /** @ignore */
  public clone(doc: Model<any>): ValNode<Value> {
    return new ValNode(doc, this.id, this.val);
  }

  /** @ignore */
  public delta(model: Model, cc: IClockVector, ops: DeltaMutator[]): void {
    const {id, val} = this;
    if (id.sid !== SESSION.SYSTEM && !cc.has(id)) ops.push(new NewValOp(id));
    this.child()?.delta(model, cc, ops);
    if (!cc.has(val)) ops.push(new InsValOp(ORIGIN, id, val));
  }

  /**
   * @ignore
   */
  public api: undefined | unknown = undefined;

  /** @ignore */
  public parent: JsonNode | undefined = undefined;

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const node = this.node();
    const header = this.name() + ' ' + printTs(this.id);
    return header + printTree(tab, [(tab) => (node ? node.toString(tab) : printTs(this.val))]);
  }
}
