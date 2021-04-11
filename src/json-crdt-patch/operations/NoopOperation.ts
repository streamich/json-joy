import type {IJsonCrdtPatchOperation} from './types';
import type {LogicalTimestamp} from '../clock';

export class NoopOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly length: number) {}

  public span(): number {
    return this.length;
  }

  public getMnemonic(): string {
    return 'noop';
  }
}
