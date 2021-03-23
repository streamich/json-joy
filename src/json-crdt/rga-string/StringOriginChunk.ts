import type {LogicalTimestamp} from '../../json-crdt-patch/clock';
import {StringChunk} from './StringChunk';

/**
 * The very first chunk in the linked list, which represents string creation operation,
 * is always empty, has always span of 1. Essentially it is a placeholder to simplify
 * linked list operations in the string type.
 */
export class StringOriginChunk extends StringChunk {
  constructor(public readonly id: LogicalTimestamp) {
    super(id);
  }

  public span(): number {
    return 1;
  }
}
