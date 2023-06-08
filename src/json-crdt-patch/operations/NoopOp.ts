import type {IJsonCrdtPatchOperation} from './types';
import {ITimestampStruct, toDisplayString} from '../clock';

/**
 * Operation which does nothing. Useful for skipping clock cycles, so that
 * operations with a gap in clock can be included in the same patch.
 */
export class NoopOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct, public readonly len: number) {}

  public span(): number {
    return this.len;
  }

  public name(): string {
    return 'noop';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.len}`;
  }
}
