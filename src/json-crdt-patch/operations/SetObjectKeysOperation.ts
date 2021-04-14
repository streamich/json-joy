import type {IJsonCrdtPatchOperation} from './types';
import type {ITimestamp} from '../clock';

export class SetObjectKeysOperation implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: ITimestamp,
    public readonly object: ITimestamp,
    public readonly tuples: [key: string, value: ITimestamp][],
  ) {}

  public span(): number {
    return this.tuples.length;
  }

  public getMnemonic(): string {
    return 'obj_set';
  }
}
