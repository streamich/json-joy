import type {IJsonCrdtPatchEditOperation} from './types';
import {ITimestampStruct, toDisplayString} from '../clock';

/**
 * Operation which writes a new value to a value object.
 */
export class ValSetOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly val: ITimestampStruct,
  ) {}

  public span(): number {
    return 0;
  }

  public name(): string {
    return 'val_set';
  }

  public toString(tab: string = ''): string {
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(
      this.obj,
    )}, val = ${toDisplayString(this.val)}`;
  }
}
