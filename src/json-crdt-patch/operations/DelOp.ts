import {toDisplayString} from '../clock';
import type {ITimespanStruct, ITimestampStruct} from '../clock';
import type {IJsonCrdtPatchEditOperation} from './types';

/**
 * Operation which deletes one or more ranges of values in some object.
 * The object could be a string, an array, or a binary.
 */
export class DelOp implements IJsonCrdtPatchEditOperation {
  /**
   * @param id ID of this operation.
   * @param obj Object in which to delete something.
   * @param what ID of the first operation to be deleted.
   */
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly what: ITimespanStruct[],
  ) {}

  public span(): number {
    return 0;
  }

  public name(): string {
    return 'del';
  }

  public toString(): string {
    const spans = this.what.map((span) => toDisplayString(span) + '!' + span.span).join(', ');
    return `"${this.name()}" ${toDisplayString(this.id)}, obj = ${toDisplayString(this.obj)} { ${spans} }`;
  }
}
