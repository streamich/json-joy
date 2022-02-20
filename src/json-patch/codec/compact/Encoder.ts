import {Op} from '../../op';
import {encode} from './encode';
import {CompactOp, EncoderOptions} from './types';

export class Encoder {
  constructor(public readonly options?: EncoderOptions) {}

  public encode(patch: Op[]): CompactOp[] {
    return encode(patch, this.options);
  }
}
