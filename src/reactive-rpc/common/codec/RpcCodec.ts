import type {ReactiveRpcMessage} from '../messages';
import type {JsonValueCodec} from '../../../json-pack/codecs/types';
import type {RpcMessageCodec} from './types';

export class RpcCodec {
  constructor(public readonly valueCodec: JsonValueCodec, public readonly messageCodec: RpcMessageCodec) {}

  public encode(messages: ReactiveRpcMessage[]): Uint8Array {
    const valueCodec = this.valueCodec;
    const encoder = valueCodec.encoder;
    const writer = encoder.writer;
    writer.reset();
    this.messageCodec.encodeBatch(valueCodec, messages);
    return writer.flush();
  }

  public decode(data: Uint8Array): ReactiveRpcMessage[] {
    const valueCodec = this.valueCodec;
    const decoder = valueCodec.decoder;
    const reader = decoder.reader;
    reader.reset(data);
    return this.messageCodec.decodeBatch(valueCodec, data);
  }
}
