import type {JsonPatchOptions} from '../../types';
import {Op} from '../../op';
import {decode} from './decode';
import {Operation} from './types';

export class Decoder {
  constructor(private readonly options: JsonPatchOptions) {}

  public decode(patch: Operation[]): Op[] {
    return decode(patch, this.options);
  }
}
