import type {ITimestamp} from '../../../json-crdt-patch/clock';
import {SetRootOperation} from '../../../json-crdt-patch/operations/SetRootOperation';
import {UNDEFINED_ID} from '../../../json-crdt-patch/constants';
import {JsonNode} from '../../types';
import {Model} from '../../model';

export class DocRootType implements JsonNode {
  /**
   * @param doc Reference to document model.
   * @param id ID of the last write operation, if any.
   * @param node Latest value of the document root.
   */
  constructor(public readonly doc: Model, public id: ITimestamp, public node: null | JsonNode) {}

  /**
   * @returns ID of the previous root node, if any.
   */
  public insert(op: SetRootOperation): null | ITimestamp {
    if (!this.node) {
      this.set(op.id, op.value);
      return null;
    } else if (op.id.compare(this.id) > 0) {
      const node = this.node;
      this.set(op.id, op.value);
      return node.id;
    }
    return null;
  }

  public set(id: ITimestamp, value: ITimestamp): void {
    const node = this.doc.node(value);
    if (!node) return;
    this.id = id;
    this.node = node;
  }

  public toValue(): ITimestamp {
    return this.node ? this.node.id : UNDEFINED_ID;
  }

  public toJson(): unknown {
    return !this.node ? undefined : this.node.toJson();
  }

  public toString(tab: string = ''): string {
    return this.node ? this.node.toString(tab) : 'undefined';
  }

  public clone(doc: Model): DocRootType {
    return new DocRootType(doc, this.id, this.node ? this.node.clone(doc) : null);
  }

  public *children(): IterableIterator<ITimestamp> {
    if (this.node) yield this.node.id;
  }
}
