import {CborDecoder} from '../cbor/CborDecoder';
import {CborEncoder} from '../cbor/CborEncoder';
import {EncodingFormat} from '../constants';
import type {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValueCodec} from './types';

export class CborJsonValueCodec implements JsonValueCodec {
  public readonly id = 'cbor';
  public readonly format = EncodingFormat.Cbor;
  public readonly encoder: CborEncoder;
  public readonly decoder: CborDecoder;

  constructor(writer: Writer) {
    this.encoder = new CborEncoder(writer);
    this.decoder = new CborDecoder();
  }
}
