import type {IJsonCrdtPatchOperation} from './types';
import type {LogicalTimestamp} from '../clock';

export class InsertStringSubstringOperation implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: LogicalTimestamp,
    public readonly obj: LogicalTimestamp,
    public readonly after: LogicalTimestamp,
    public readonly substring: string,
  ) {}

  public span(): number {
    return this.substring.length;
  }

  public getMnemonic(): string {
    return 'str_ins';
  }
}
