import type {JsonNode} from '../../types';
import type {Document} from '../../document';
import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {SetValueOperation} from '../../../json-crdt-patch/operations/SetValueOperation';
import {json_string} from 'ts-brand-json';
import {ClockCodec} from '../../codec/compact/ClockCodec';

/**
 * LWW register for any JSON value.
 */
export class ValueType implements JsonNode {
  constructor(public readonly id: LogicalTimestamp, public writeId: LogicalTimestamp, public value: unknown) {}

  public insert(op: SetValueOperation) {
    if (op.id.compare(this.writeId) <= 0) return;
    this.writeId = op.id;
    this.value = op.value;
  }

  public toJson(): unknown {
    return this.value;
  }

  public toString(tab: string = ''): string {
    return `${tab}num(${this.id.toString()}) { ${this.toJson()} }`;
  }

  public clone(doc: Document): ValueType {
    const num = new ValueType(this.id, this.writeId, this.value);
    return num;
  }

  public *children(): IterableIterator<LogicalTimestamp> {}

  public encodeCompact(codec: ClockCodec): json_string<unknown[]> {
    throw new Error('Not implemented');
  }
}
