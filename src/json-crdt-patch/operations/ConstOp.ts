import type {IJsonCrdtPatchOperation} from './types';
import {ITimestampStruct, Timestamp, toDisplayString} from '../clock';

/**
 * Operations which creates a constant value.
 */
export class ConstOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct, public readonly val: unknown | undefined | ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'const';
  }

  public toString(tab: string = ''): string {
    const val = this.val;
    const valFormatted =
      val instanceof Timestamp
        ? `{ ${toDisplayString(val)} }`
        : val instanceof Uint8Array
        ? val.length < 13
          ? `Uint8Array { ${('' + val).replaceAll(',', ', ')} }`
          : `Uint8Array(${val.length})`
        : `{ ${JSON.stringify(val)} }`;
    return `"${this.name()}" ${toDisplayString(this.id)} ${valFormatted}`;
  }
}
