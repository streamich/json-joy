import type {json_string} from 'ts-brand-json';
import type {ClockCodec} from './codec/compact/ClockCodec';
import {LogicalTimestamp} from '../json-crdt-patch/clock';
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from '../json-crdt-patch/constants';
import {JsonNode} from './types';

export class ConstantType implements JsonNode {
  constructor (public readonly id: LogicalTimestamp, public readonly value: unknown, private readonly comp: json_string<unknown[]>) {}

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

  public compact(codec: ClockCodec): json_string<unknown[]> {
    return this.comp;
  }
}

export const NULL = new ConstantType(NULL_ID, null, '[4]' as json_string<unknown[]>);
export const TRUE = new ConstantType(TRUE_ID, true, '[5]' as json_string<unknown[]>);
export const FALSE = new ConstantType(FALSE_ID, false, '[6]' as json_string<unknown[]>);
export const UNDEFINED = new ConstantType(UNDEFINED_ID, undefined, '[-1]' as json_string<unknown[]>);
