import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../clock';

export class MakeArrayOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp) {}

  public getSpan(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'arr';
  }
}
