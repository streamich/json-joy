import {Op} from '../../op';
import {encode} from './encode';
import {CompactOp} from './types';

export class Encoder {
  public encode(patch: Op[]): CompactOp[] {
    return encode(patch);
  }
}
