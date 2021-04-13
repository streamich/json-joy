import type {IJsonCrdtPatchOperation} from './types';
import type {Timestamp} from '../clock';

export class MakeObjectOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: Timestamp) {}

  public span(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'obj';
  }
}
