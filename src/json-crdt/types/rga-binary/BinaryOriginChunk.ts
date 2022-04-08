import type {ITimestamp} from '../../../json-crdt-patch/clock';
import {BinaryChunk} from './BinaryChunk';

/**
 * The very first chunk in the linked list, which represents buffer creation operation,
 * is always empty, has always span of 1. Essentially it is a placeholder to simplify
 * linked list operations in the binary type.
 */
export class BinaryOriginChunk extends BinaryChunk {
  constructor(public readonly id: ITimestamp) {
    super(id);
  }

  public span(): number {
    return 1;
  }
}
