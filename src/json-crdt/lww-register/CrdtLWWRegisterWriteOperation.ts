import {DoublyLinkedListEntry} from '../doubly-linked-list';
import type {LogicalTimestamp} from '../clock';
import type {ICrdtOperation} from '../operations/types';
import type {CrdtLWWRegisterType} from './CrdtLWWRegisterType';

/**
 * Writes a value to LWW Register.
 */
export class CrdtLWWRegisterWriteOperation implements ICrdtOperation, DoublyLinkedListEntry<CrdtLWWRegisterWriteOperation> {
  public type?: CrdtLWWRegisterType;
  public left: DoublyLinkedListEntry<CrdtLWWRegisterWriteOperation> | null = null;
  public right: DoublyLinkedListEntry<CrdtLWWRegisterWriteOperation> | null = null;

  constructor(public readonly id: LogicalTimestamp, public readonly after: LogicalTimestamp, public readonly value: LogicalTimestamp) {}
}
