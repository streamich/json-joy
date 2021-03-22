import type {LogicalTimestamp} from '../../json-crdt-patch/clock';
import {ArrayChunk} from './ArrayChunk';

/**
 * The very first chunk in an array, which represents array creation, is always
 * empty, has always span of 1.
 */
export class ArrayOriginChunk extends ArrayChunk {
  constructor(public readonly id: LogicalTimestamp) {
    super(id, []);
  }

  public getSpan(): number {
    return 1;
  }
}
