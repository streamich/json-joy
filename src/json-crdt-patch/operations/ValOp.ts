import type {IJsonCrdtPatchOperation} from './types';
import {ITimestampStruct, toDisplayString} from '../clock';

/**
 * Operation which creates a new value object.
 */
export class ValOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct, public readonly val: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'val';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)} { ${toDisplayString(this.val)} }`;
  }
}
