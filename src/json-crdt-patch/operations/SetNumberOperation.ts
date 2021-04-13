import type {IJsonCrdtPatchOperation} from './types';
import type {Timestamp} from '../clock';

export class SetNumberOperation implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: Timestamp,
    public readonly num: Timestamp,
    public readonly value: number,
  ) {}

  public span(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'num_set';
  }
}
