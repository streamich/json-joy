import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../../json-crdt/clock';

export class InsertStringSubstringOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly after: LogicalTimestamp, public readonly substring: string) {}

  public getSpan(): number {
    return this.substring.length;
  }
}
