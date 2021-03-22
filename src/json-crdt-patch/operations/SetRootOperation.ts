import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../clock';

export class SetRootOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly value: LogicalTimestamp) {}

  public span(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'root';
  }
}
