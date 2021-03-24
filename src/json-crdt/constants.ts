import {LogicalTimestamp} from '../json-crdt-patch/clock';
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from '../json-crdt-patch/constants';
import {JsonNode} from './types';

export class ConstantType implements JsonNode {
  constructor (public readonly id: LogicalTimestamp, public readonly value: unknown) {}

  public toJson() {
    return this.value;
  }

  public toString(): string {
    switch (this.value) {
      case null: return 'NULL';
      case true: return 'TRUE';
      case false: return 'FALSE';
      case undefined: return 'UNDEFINED';
    }
    return 'UNKNOWN';
  }
}

export const NULL = new ConstantType(NULL_ID, null);
export const TRUE = new ConstantType(TRUE_ID, true);
export const FALSE = new ConstantType(FALSE_ID, false);
export const UNDEFINED = new ConstantType(UNDEFINED_ID, false);
