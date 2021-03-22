import {LogicalTimestamp} from '../json-crdt-patch/clock';
import {FALSE_ID, NULL_ID, TRUE_ID} from '../json-crdt-patch/constants';
import {JsonNode} from './types';

export class ConstantType implements JsonNode {
  constructor (public readonly id: LogicalTimestamp, public readonly value: unknown) {}

  public toJson() {
    return this.value;
  }
}

export const NULL = new ConstantType(NULL_ID, null);
export const TRUE = new ConstantType(TRUE_ID, true);
export const FALSE = new ConstantType(FALSE_ID, false);
