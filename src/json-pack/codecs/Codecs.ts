import {Writer} from '../../util/buffers/Writer';
import {CborJsonValueCodec} from './cbor';
import {JsonJsonValueCodec} from './json';
import {MsgPackJsonValueCodec} from './msgpack';

export class Codecs {
  public readonly cbor: CborJsonValueCodec;
  public readonly msgpack: MsgPackJsonValueCodec;
  public readonly json: JsonJsonValueCodec;

  constructor(public readonly writer: Writer) {
    this.cbor = new CborJsonValueCodec(this.writer);
    this.msgpack = new MsgPackJsonValueCodec(this.writer);
    this.json = new JsonJsonValueCodec(this.writer);
  }
}
