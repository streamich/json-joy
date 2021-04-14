import type {IJsonCrdtPatchOperation} from './types';
import type {ITimestamp} from '../clock';

export class NoopOperation implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestamp, public readonly length: number) {}

  public span(): number {
    return this.length;
  }

  public getMnemonic(): string {
    return 'noop';
  }
}
