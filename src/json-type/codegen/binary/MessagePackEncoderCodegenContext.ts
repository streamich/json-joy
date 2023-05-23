import type {MsgPackEncoder} from '../../../json-pack/msgpack/MsgPackEncoder';
import {BinaryEncoderCodegenContext, type BinaryEncoderCodegenContextOptions} from './BinaryEncoderCodegenContext';

export interface MessagePackEncoderCodegenContextOptions extends BinaryEncoderCodegenContextOptions<MsgPackEncoder> {}
export class MessagePackEncoderCodegenContext extends BinaryEncoderCodegenContext<MsgPackEncoder> {}
