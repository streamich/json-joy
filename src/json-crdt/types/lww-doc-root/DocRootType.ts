import type {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {SetRootOperation} from '../../../json-crdt-patch/operations/SetRootOperation';
import {UNDEFINED_ID} from '../../../json-crdt-patch/constants';
import {JsonNode} from '../../types';
import {Document} from '../../document';
import {ClockCodec} from '../../codec/compact/ClockCodec';
import {json_string} from 'ts-brand-json';

export class DocRootType implements JsonNode {
  /**
   * @param doc Reference to document model.
   * @param id ID of the last write operation, if any.
   * @param node Latest value of the document root.
   */
  constructor(public readonly doc: Document, public id: LogicalTimestamp, public node: null | JsonNode) {}

  /**
   * @returns ID of the previous root node, if any.
   */
  public insert(op: SetRootOperation): null | LogicalTimestamp {
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

  public set(id: LogicalTimestamp, value: LogicalTimestamp): void {
    const node = this.doc.nodes.get(value);
    if (!node) return;
    this.id = id;
    this.node = node;
  }

  public toValue(): LogicalTimestamp {
    return this.node ? this.node.id : UNDEFINED_ID;
  }

  public toJson(): unknown {
    return !this.node ? undefined : this.node.toJson();
  }

  public clone(doc: Document): DocRootType {
    return new DocRootType(doc, this.id, this.node ? this.node.clone(doc) : null);
  }
  
  public *children(): IterableIterator<LogicalTimestamp> {
    if (this.node) yield this.node.id;
  }

  public encodeCompact(codec: ClockCodec): json_string<unknown> {
    throw new Error('Not implemented');
  }
}
