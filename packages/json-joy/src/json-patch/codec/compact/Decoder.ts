import type {JsonPatchOptions} from '../../types';
import type {CompactOp} from './types';
import type {Op} from '../../op';
import {decode} from './decode';

export class Decoder {
  constructor(private readonly options: JsonPatchOptions) {}

  public decode(patch: CompactOp[]): Op[] {
    return decode(patch, this.options);
  }
}
