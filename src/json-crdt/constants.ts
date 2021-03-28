import {LogicalTimestamp} from '../json-crdt-patch/clock';
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from '../json-crdt-patch/constants';
import {JsonNode} from './types';

export class ConstantType implements JsonNode {
  constructor (public readonly id: LogicalTimestamp, public readonly value: unknown) {}

  public toJson() {
    return this.value;
  }

  public clone(): ConstantType {
    return this;
  }

  public *children(): IterableIterator<LogicalTimestamp> {}

  public toString(tab: string = ''): string {
    switch (this.value) {
      case null: return tab + 'NULL';
      case true: return tab + 'TRUE';
      case false: return tab + 'FALSE';
      case undefined: return tab + 'UNDEFINED';
    }
    return tab + 'UNKNOWN';
  }
}

export const NULL = new ConstantType(NULL_ID, null);
export const TRUE = new ConstantType(TRUE_ID, true);
export const FALSE = new ConstantType(FALSE_ID, false);
export const UNDEFINED = new ConstantType(UNDEFINED_ID, undefined);
