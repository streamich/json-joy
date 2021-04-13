import type {IJsonCrdtPatchOperation} from './types';
import type {Timestamp} from '../clock';

export class SetRootOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: Timestamp, public readonly value: Timestamp) {}

  public span(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'root';
  }
}
