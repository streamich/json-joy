import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../clock';

export class InsertArrayElementsOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly after: LogicalTimestamp, public readonly elements: LogicalTimestamp[]) {}

  public getSpan(): number {
    return this.elements.length;
  }

  public getMnemonic(): string {
    return 'arr_ins';
  }
}
