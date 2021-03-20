import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../../json-crdt/clock';

export class InsertArrayElementsOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly after: LogicalTimestamp, public readonly elements: LogicalTimestamp[]) {}

  public getSpan(): number {
    return this.elements.length;
  }
}
