import type {IJsonCrdtPatchEditOperation} from './types';
import {ITimestampStruct, toDisplayString} from '../clock';

/**
 * Operation which inserts text into a string object.
 */
export class StrInsOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public readonly data: string,
  ) {}

  public span(): number {
    return this.data.length;
  }

  public name(): string {
    return 'str_ins';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(
      this.obj,
    )} { ${toDisplayString(this.ref)} ← ${JSON.stringify(this.data)} }`;
  }
}
