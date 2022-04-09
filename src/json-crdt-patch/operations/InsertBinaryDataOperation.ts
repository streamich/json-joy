import type {IJsonCrdtPatchOperation} from './types';
import type {ITimestamp} from '../clock';

export class InsertBinaryDataOperation implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: ITimestamp,
    public readonly obj: ITimestamp,
    public readonly after: ITimestamp,
    public readonly data: Uint8Array,
  ) {}

  public span(): number {
    return this.data.length;
  }

  public getMnemonic(): string {
    return 'bin_ins';
  }
}
