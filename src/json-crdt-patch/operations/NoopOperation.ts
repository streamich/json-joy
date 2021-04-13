import type {IJsonCrdtPatchOperation} from './types';
import type {Timestamp} from '../clock';

export class NoopOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: Timestamp, public readonly length: number) {}

  public span(): number {
    return this.length;
  }

  public getMnemonic(): string {
    return 'noop';
  }
}
