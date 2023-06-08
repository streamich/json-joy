import type {IJsonCrdtPatchOperation} from './types';
import {ITimestampStruct, toDisplayString} from '../clock';

/**
 * Operation which creates a new binary object.
 */
export class BinOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'bin';
  }

  public toString(tab: string = ''): string {
    return `"${this.name()}" ${toDisplayString(this.id)}`;
  }
}
