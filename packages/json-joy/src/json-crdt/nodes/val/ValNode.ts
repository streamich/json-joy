import {compare, type ITimestampStruct, printTs} from '../../../json-crdt-patch/clock';
import {SESSION} from '../../../json-crdt-patch/constants';
import {printTree} from 'tree-dump/lib/printTree';
import {UNDEFINED} from '../../model/Model';
import type {JsonNode, JsonNodeView} from '..';
import type {Model} from '../../model';
import type {Printable} from 'tree-dump/lib/types';

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
    return this.val.sid === SESSION.SYSTEM ? <any>UNDEFINED : this.child();
  }

  // ----------------------------------------------------------------- JsonNode

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

  /**
   * @ignore
   */
  public api: undefined | unknown = undefined;

  public name(): string {
    return 'val';
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const node = this.node();
    const header = this.name() + ' ' + printTs(this.id);
    return header + printTree(tab, [(tab) => (node ? node.toString(tab) : printTs(this.val))]);
  }
}
