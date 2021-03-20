import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../../json-crdt/clock';

export class SetNumberOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly after: LogicalTimestamp, public readonly value: number) {}

  public getSpan(): number {
    return 1;
  }
}
