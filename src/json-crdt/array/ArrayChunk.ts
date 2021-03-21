import type {JsonChunk} from '../types';
import type {ArrayType} from './ArrayType';
import type {LogicalTimestamp} from '../../json-crdt-patch/clock';

export class ArrayChunk implements JsonChunk {
  constructor(public readonly type: ArrayType, public readonly id: LogicalTimestamp, public readonly values: LogicalTimestamp) {}

  public getSpan(): number {
    return 1;
  }
}
