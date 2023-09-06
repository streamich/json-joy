import {MsgPackEncoder} from '../../json-pack/msgpack';
import {MsgPackDecoder} from '../../json-pack/msgpack/MsgPackDecoder';
import type {Writer} from '../../util/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecMsgpack implements CliCodec<'msgpack'> {
  public readonly id = 'msgpack';
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
