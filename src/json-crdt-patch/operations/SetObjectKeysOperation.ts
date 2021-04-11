import type {IJsonCrdtPatchOperation} from './types';
import type {LogicalTimestamp} from '../clock';

export class SetObjectKeysOperation implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: LogicalTimestamp,
    public readonly object: LogicalTimestamp,
    public readonly tuples: [key: string, value: LogicalTimestamp][],
  ) {}

  public span(): number {
    return this.tuples.length;
  }

  public getMnemonic(): string {
    return 'obj_set';
  }
}
