import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../../json-crdt/clock';

export class SetObjectKeysOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly after: LogicalTimestamp, public readonly tuples: [key: string, value: LogicalTimestamp][]) {}

  public getSpan(): number {
    return this.tuples.length;
  }
}
