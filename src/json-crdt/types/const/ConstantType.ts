import type {json_string} from 'ts-brand-json';
import type {ClockCodec} from '../../codec/compact/ClockCodec';
import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';

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
    return '[4,' + codec.encodeTs(this.id) + ',' + JSON.stringify(this.value) + ']' as json_string<unknown[]>;
  }
}
