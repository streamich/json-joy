import type {IJsonCrdtPatchEditOperation} from './types';
import {ITimestampStruct, toDisplayString} from '../clock';

/**
 * Operation which sets object keys.
 *
 * @todo Generalize this to tuples and LWW registers. E.g. make it a generic
 * `put` operation instead of `obj_set`.
 */
export class ObjSetOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly data: [key: string | number, value: ITimestampStruct][],
  ) {}

  public span(): number {
    return 0;
  }

  public name(): string {
    return 'obj_set';
  }

  public toString(tab: string = ''): string {
    let out = `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(this.obj)}`;
    for (let i = 0; i < this.data.length; i++) {
      const isLast = i === this.data.length - 1;
      out += `\n${tab}  ${isLast ? '└─' : '├─'} ${JSON.stringify(this.data[i][0])}: ${toDisplayString(
        this.data[i][1],
      )}`;
    }
    return out;
  }
}
