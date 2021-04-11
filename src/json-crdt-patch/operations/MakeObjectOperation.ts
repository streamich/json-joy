import type {IJsonCrdtPatchOperation} from './types';
import type {LogicalTimestamp} from '../clock';

export class MakeObjectOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp) {}

  public span(): number {
    return 1;
  }

  public getMnemonic(): string {
    return 'obj';
  }
}
