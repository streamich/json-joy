import {EncodingFormat} from '../constants';
import {JsonEncoder} from '../json/JsonEncoder';
import {JsonDecoder} from '../json/JsonDecoder';
import type {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValueCodec} from './types';

export class JsonJsonValueCodec implements JsonValueCodec {
  public readonly id = 'json';
  public readonly format = EncodingFormat.Json;
  public readonly encoder: JsonEncoder;
  public readonly decoder: JsonDecoder;

  constructor(writer: Writer) {
    this.encoder = new JsonEncoder(writer);
    this.decoder = new JsonDecoder();
  }
}
