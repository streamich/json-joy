import type {JsonNode} from '../../types';
import type {Document} from '../../document';
import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {SetNumberOperation} from '../../../json-crdt-patch/operations/SetNumberOperation';
import {json_string} from 'ts-brand-json';

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

  public serialize(): json_string<Array<number>> {
    const {id, writeId: latestWriteId} = this;
    return '[3,' + id.sessionId + ',' + id.time + ',' + latestWriteId.sessionId + ',' + latestWriteId.time + ',' + this.value + ']' as json_string<Array<number>>;
  }

  public static deserialize(doc: Document, data: Array<number>): NumberType {
    const [, sessionId, time, writeSessionId, writeTime, value] = data;
    const id = new LogicalTimestamp(sessionId, time);
    const writeId = new LogicalTimestamp(writeSessionId, writeTime);
    const obj = new NumberType(id, writeId, value);
    return obj;
  }
}
