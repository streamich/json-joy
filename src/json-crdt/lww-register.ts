import type {CrdtType, JsonNode} from './types';
import type {Document} from './document';
import type {ObjectType} from './object';
import type {LogicalTimestamp} from './clock';
import {DoublyLinkedList, DoublyLinkedListEntry} from './doubly-linked-list';

type LWWRegisterOperation = ObjectType;

interface LWWRegisterEntry extends DoublyLinkedListEntry<LWWRegisterEntry> {
  op: LWWRegisterOperation;
}

export class LWWRegisterType extends DoublyLinkedList<LWWRegisterEntry> implements JsonNode, CrdtType {
  constructor(private readonly doc: Document, public readonly id: LogicalTimestamp, public readonly dep: LogicalTimestamp) {
    super();
  }

  public update(operation: LWWRegisterOperation): void {
    const entry = {
      left: null,
      right: null,
      op: operation,
    };
    this.append(entry);
  }

  public merge(type: LWWRegisterType): void {}

  public toJson() {
    const {end} = this;
    return end ? end.op.toJson() : null;
  }
}
