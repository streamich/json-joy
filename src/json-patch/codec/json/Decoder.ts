import type {JsonPatchOptions} from '../../types';
import type {Op} from '../../op';
import {decode} from './decode';
import type {Operation} from './types';

export class Decoder {
  constructor(private readonly options: JsonPatchOptions) {}

  public decode(patch: Operation[]): Op[] {
    return decode(patch, this.options);
  }
}
