import type {IJsonCrdtPatchOperation} from './types';
import type {Timestamp} from '../clock';

export class InsertStringSubstringOperation implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: Timestamp,
    public readonly obj: Timestamp,
    public readonly after: Timestamp,
    public readonly substring: string,
  ) {}

  public span(): number {
    return this.substring.length;
  }

  public getMnemonic(): string {
    return 'str_ins';
  }
}
