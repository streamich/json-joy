import {Op} from '../../op';
import {encode} from './encode';
import {CompactOp, EncoderOptions} from './types';

export class Encoder {
  public encode(patch: Op[], options?: EncoderOptions): CompactOp[] {
    return encode(patch, options);
  }
}
