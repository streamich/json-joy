import type {BinBatchCodec, RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base';
import type {RpcCodec} from './RpcCodec';

export class RpcBinBatchCodec<Message> implements BinBatchCodec<Message> {
  public readonly id: string;
  public readonly format: RpcMessageFormat;

  constructor(protected readonly codec: RpcCodec<Message>) {
    this.id = codec.specifier();
    this.format = codec.msg.format;
  }

  public toChunk(messages: Message[]): Uint8Array {
    const codec = this.codec;
    return codec.encode(messages, codec.req);
  }

  public fromChunk(chunk: Uint8Array): Message[] {
    const codec = this.codec;
    return codec.decode(chunk, codec.res);
  }
}
