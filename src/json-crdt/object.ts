import type {Document} from './document';
import {LogicalTimestamp} from './clock';
import {CrdtType, CrdtOperation, JsonNode} from './types';
import {DoublyLinkedList, DoublyLinkedListEntry} from './doubly-linked-list';

type ListItem = ObjectType | InsertObjectKeyOperation;

interface ObjectTypeOperation extends CrdtOperation, DoublyLinkedListEntry<ObjectTypeOperation> {
  /**
   * Object on which this key was set.
   */
  type?: ObjectType;
}

export class InsertObjectKeyOperation implements ObjectTypeOperation {
  /**
   * Whether this object key was already deleted or overwritten by a subsequent operation.
   */
  public deleted = false;

  public left: DoublyLinkedListEntry<ListItem> | null = null;
  public right: DoublyLinkedListEntry<ListItem> | null = null;

  constructor(private readonly doc: Document, public readonly id: LogicalTimestamp, public readonly dep: LogicalTimestamp, public readonly key: string) {}
}

export class ObjectType extends DoublyLinkedList<ListItem> implements JsonNode, CrdtType, ObjectTypeOperation {
  public type: ObjectType = this;

  /**
   * Latest JSON value of this JSON object.
   */
  public value: Record<string, unknown> = {};

  public left: DoublyLinkedListEntry<ListItem> | null = null;
  public right: DoublyLinkedListEntry<ListItem> | null = null;

  constructor(private readonly doc: Document, public readonly id: LogicalTimestamp, public readonly dep: LogicalTimestamp) {
    super();
    this.append(this);
  }

  update(operation: InsertObjectKeyOperation) {
    if (operation instanceof InsertObjectKeyOperation) this.value[operation.key] = null;
    this.append(operation);
  }

  merge() {}

  public toJson() {
    return this.value;
  }
}
