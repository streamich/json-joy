import {MsgPackEncoderFast as EncoderMessagePack} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackEncoderFast';
import type {Op} from '../../op';
import {encodeOperationToMsgpack} from './encodeOperationToMsgpack';

export class Encoder extends EncoderMessagePack {
  public encode(patch: Op[]): Uint8Array {
    this.writer.reset();
    this.encodeArrayHeader(patch.length);
    const length = patch.length;
    for (let i = 0; i < length; i++) encodeOperationToMsgpack(patch[i], this);
    return this.writer.flush();
  }
}
