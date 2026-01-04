import {ORIGIN} from '../../../json-crdt-patch/constants';
import {ValNode} from '../val/ValNode';
import type {Model} from '../../model/Model';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {JsonNode} from '../types';

/**
 * The root of a JSON CRDT document. {@link RootNode} is a {@link ValNode} with
 * a special `0.0` ID, which is always the same. It is used to represent the
 * root of a document.
 *
 * @category CRDT Node
 */
export class RootNode<Value extends JsonNode = JsonNode> extends ValNode<Value> {
  /**
   * @param val Latest value of the document root.
   */
  constructor(doc: Model<any>, val: ITimestampStruct) {
    super(doc, ORIGIN, val);
  }

  public name(): string {
    return 'root';
  }

  /** @ignore */
  public clone(doc: Model<any>): RootNode<Value> {
    return new RootNode(doc, this.val);
  }
}
