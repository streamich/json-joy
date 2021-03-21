import {LogicalTimestamp} from '../../json-crdt-patch/clock';
import {SetNumberOperation} from '../../json-crdt-patch/operations/SetNumberOperation';
import {Document} from '../document';
import {JsonNode} from '../types';

export class LWWNumberType implements JsonNode {
  private latestWriteId: LogicalTimestamp;
  private value: number;

  constructor(public readonly id: LogicalTimestamp, value: number) {
    this.latestWriteId = id;
    this.value = value;
  }

  public insert(op: SetNumberOperation) {
    if (op.id.compare(this.latestWriteId) <= 0) return;
    this.latestWriteId = op.id;
    this.value = op.value;
  }

  public toJson(): number {
    return this.value;
  }

  public toString(tab: string = ''): string {
    return `${tab}num(${this.id.toString()}) { ${this.toJson()} }`;
  }
}
