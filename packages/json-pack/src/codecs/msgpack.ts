import {EncodingFormat} from '../constants';
import {MsgPackEncoder} from '../msgpack';
import {MsgPackDecoder} from '../msgpack/MsgPackDecoder';
import type {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValueCodec} from './types';

export class MsgPackJsonValueCodec implements JsonValueCodec {
  public readonly id = 'msgpack';
  public readonly format = EncodingFormat.MsgPack;
  public readonly encoder: MsgPackEncoder;
  public readonly decoder: MsgPackDecoder;

  constructor(writer: Writer) {
    this.encoder = new MsgPackEncoder(writer);
    this.decoder = new MsgPackDecoder();
  }
}
