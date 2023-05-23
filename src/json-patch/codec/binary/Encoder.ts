import {MsgPackEncoderFast as EncoderMessagePack} from '../../../json-pack/msgpack/MsgPackEncoderFast';
import {Op} from '../../op';

export class Encoder extends EncoderMessagePack {
  public encode(patch: Op[]): Uint8Array {
    this.writer.reset();
    this.encodeArrayHeader(patch.length);
    const length = patch.length;
    for (let i = 0; i < length; i++) patch[i].encode(this);
    return this.writer.flush();
  }
}
