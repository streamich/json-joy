import type {IJsonCrdtPatchOperation} from './types';
import type {ITimestamp} from '../clock';

export class InsertStringSubstringOperation implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: ITimestamp,
    public readonly obj: ITimestamp,
    public readonly after: ITimestamp,
    public readonly substring: string,
  ) {}

  public span(): number {
    return this.substring.length;
  }

  public getMnemonic(): string {
    return 'str_ins';
  }
}
