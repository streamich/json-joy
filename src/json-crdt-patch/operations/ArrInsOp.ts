import type {IJsonCrdtPatchEditOperation} from './types';
import {ITimestampStruct, toDisplayString} from '../clock';

/**
 * Operation which inserts elements into an array.
 */
export class ArrInsOp implements IJsonCrdtPatchEditOperation {
  /**
   * @param id ID if the first operation in this compound operation.
   * @param obj ID of the array where to insert elements. In theory `arr` is
   *        not necessary as it is possible to find the `arr` just using the
   *        `after` property, however to efficiently be able to find `arr` just
   *        by `after` at runtime all operations would need to be indexed and
   *        also they each would need to store a pointer to array type, which
   *        would require additional dozens of bytes of RAM for each array
   *        insert operation.
   * @param ref ID of the element after which to insert elements.
   * @param data The elements to insert.
   */
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public readonly data: ITimestampStruct[],
  ) {}

  public span(): number {
    return this.data.length;
  }

  public name(): string {
    return 'arr_ins';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(
      this.obj,
    )} { ${toDisplayString(this.ref)} ← ${this.data.map(toDisplayString).join(', ')} }`;
  }
}
