import type {Timestamp} from '../../../json-crdt-patch/clock';
import {ArrayChunk} from './ArrayChunk';

/**
 * The very first chunk in an array, which represents array creation, is always
 * empty, has always span of 1. Essentially it is a placeholder to simplify
 * linked list operations in the array type.
 */
export class ArrayOriginChunk extends ArrayChunk {
  constructor(public readonly id: Timestamp) {
    super(id);
  }

  public span(): number {
    return 1;
  }
}
