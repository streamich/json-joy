import type {JsonNode} from '../../types';
import type {Document} from '../../document';
import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {SetNumberOperation} from '../../../json-crdt-patch/operations/SetNumberOperation';
import {json_string} from 'ts-brand-json';
import {ClockCodec} from '../../codec/compact/ClockCodec';

export class NumberType implements JsonNode {
  constructor(public readonly id: LogicalTimestamp, public writeId: LogicalTimestamp, public value: number) {}

  public insert(op: SetNumberOperation) {
    if (op.id.compare(this.writeId) <= 0) return;
    this.writeId = op.id;
    this.value = op.value;
  }

  public toJson(): number {
    return this.value;
  }

  public toString(tab: string = ''): string {
    return `${tab}num(${this.id.toString()}) { ${this.toJson()} }`;
  }

  public clone(doc: Document): NumberType {
    const num = new NumberType(this.id, this.writeId, this.value);
    return num;
  }

  public *children(): IterableIterator<LogicalTimestamp> {}

  public serialize(codec: ClockCodec): json_string<Array<number>> {
    const {id, writeId} = this;
    return '[3,' + codec.encodeTs(id) + ',' + codec.encodeTs(writeId) + ',' + this.value + ']' as json_string<Array<number>>;
  }

  public static deserialize(codec: ClockCodec, data: Array<number>): NumberType {
    const [, sessionId, time, writeSessionId, writeTime, value] = data;
    const id = codec.decodeTs(sessionId, time);
    const writeId = codec.decodeTs(writeSessionId, writeTime);
    const obj = new NumberType(id, writeId, value);
    return obj;
  }

  public compact(codec: ClockCodec): json_string<unknown[]> {
    const {id, writeId} = this;
    return '[3,' + codec.encodeTs(id) + ',' + codec.encodeTs(writeId) + ',' + this.value + ']' as json_string<number[]>;
  }
}
