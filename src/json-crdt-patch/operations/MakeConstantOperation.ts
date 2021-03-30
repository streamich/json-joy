import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../clock';

export class MakeConstantOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly value: unknown) {}

  public span(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'const';
  }
}
