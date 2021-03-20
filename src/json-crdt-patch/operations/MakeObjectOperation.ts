import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../../json-crdt/clock';

export class MakeObjectOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp) {}

  public getSpan(): number {
    return 1;
  }
}
