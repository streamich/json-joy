import type {IJsonCrdtPatchOperation} from './types';
import type {ITimestamp} from '../clock';

export class SetNumberOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestamp, public readonly num: ITimestamp, public readonly value: number) {}

  public span(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'num_set';
  }
}
