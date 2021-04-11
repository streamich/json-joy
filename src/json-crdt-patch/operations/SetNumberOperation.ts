import type {IJsonCrdtPatchOperation} from './types';
import type {LogicalTimestamp} from '../clock';

export class SetNumberOperation implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: LogicalTimestamp,
    public readonly num: LogicalTimestamp,
    public readonly value: number,
  ) {}

  public span(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'num_set';
  }
}
