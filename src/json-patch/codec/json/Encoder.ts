import type {Op} from '../../op';
import {encode} from './encode';
import type {Operation} from './types';

export class Encoder {
  public encode(patch: Op[]): Operation[] {
    return encode(patch);
  }
}
