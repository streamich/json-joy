import type {IJsonCrdtPatchOperation} from './types';
import type {Timestamp} from '../clock';

export class SetObjectKeysOperation implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: Timestamp,
    public readonly object: Timestamp,
    public readonly tuples: [key: string, value: Timestamp][],
  ) {}

  public span(): number {
    return this.tuples.length;
  }

  public getMnemonic(): string {
    return 'obj_set';
  }
}
