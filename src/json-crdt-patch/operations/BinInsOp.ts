import type {IJsonCrdtPatchEditOperation} from './types';
import {ITimestampStruct, toDisplayString} from '../clock';

/**
 * Operations which inserts binary data into a binary object.
 */
export class BinInsOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public readonly data: Uint8Array,
  ) {}

  public span(): number {
    return this.data.length;
  }

  public name(): string {
    return 'bin_ins';
  }

  public toString(tab: string = ''): string {
    const ref = toDisplayString(this.ref);
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(
      this.obj,
    )} { ${ref} ← ${this.data} }`;
  }
}
