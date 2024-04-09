import type {RpcSpecifier} from '../rpc';
import type {ReactiveRpcMessage} from '../messages';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {RpcMessageCodec} from './types';

export class RpcCodec {
  constructor(
    public readonly msg: RpcMessageCodec,
    public readonly req: JsonValueCodec,
    public readonly res: JsonValueCodec,
  ) {}

  public specifier(): RpcSpecifier {
    const specifier = `rpc.${this.msg.id}.${this.req.id}` + (this.req.id !== this.res.id ? `-${this.res.id}` : '');
    return specifier as RpcSpecifier;
  }

  public encode(messages: ReactiveRpcMessage[], valueCodec: JsonValueCodec): Uint8Array {
    const encoder = valueCodec.encoder;
    const writer = encoder.writer;
    writer.reset();
    this.msg.encodeBatch(valueCodec, messages);
    return writer.flush();
  }

  public decode(data: Uint8Array, valueCodec: JsonValueCodec): ReactiveRpcMessage[] {
    const decoder = valueCodec.decoder;
    const reader = decoder.reader;
    reader.reset(data);
    return this.msg.decodeBatch(valueCodec, data);
  }
}
