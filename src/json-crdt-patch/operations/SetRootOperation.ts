import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../../json-crdt/clock';

export class SetRootOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly after: LogicalTimestamp, public readonly value: LogicalTimestamp) {}

  public getSpan(): number {
    return 1;
  }
}
