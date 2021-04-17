import type {IJsonCrdtPatchOperation} from './types';
import type {ITimestamp} from '../clock';

export class SetRootOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestamp, public readonly value: ITimestamp) {}

  public span(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'root';
  }
}
