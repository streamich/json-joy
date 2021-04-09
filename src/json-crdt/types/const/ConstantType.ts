import type {json_string} from 'ts-brand-json';
import type {ClockCodec} from '../../codec/compact/ClockCodec';
import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';

/**
 * Constant type represents an immutable JSON value. It can be any JSON value
 * including deeply nested objects and arrays. The constant value cannot be
 * edited.
 */
export class ConstantType implements JsonNode {
  constructor (public readonly id: LogicalTimestamp, public readonly value: unknown) {}

  public toJson() {
    return this.value;
  }

  public clone(): ConstantType {
    return new ConstantType(this.id, this.value);
  }

  public *children(): IterableIterator<LogicalTimestamp> {}

  public toString(tab: string = ''): string {
    return `${tab}ConstantType(${this.id.toDisplayString()})`;
  }

  public encodeCompact(codec: ClockCodec): json_string<unknown> {
    throw new Error('Not implemented');
  }
}
