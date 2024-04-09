import {MsgPackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';
import {MsgPackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackDecoder';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecMsgpack implements CliCodec<'msgpack'> {
  public readonly id = 'msgpack';
  public readonly description = 'MessagePack codec';
  protected readonly encoder: MsgPackEncoder;
  protected readonly decoder: MsgPackDecoder;

  constructor(protected readonly writer: Writer) {
    this.encoder = new MsgPackEncoder(writer);
    this.decoder = new MsgPackDecoder();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}
