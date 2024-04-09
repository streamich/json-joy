import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecJson implements CliCodec<'json'> {
  public readonly id = 'json';
  public readonly description = 'JSON codec, which also supports binary data';
  protected readonly encoder: JsonEncoder;
  protected readonly decoder: JsonDecoder;

  constructor(protected readonly writer: Writer) {
    this.encoder = new JsonEncoder(writer);
    this.decoder = new JsonDecoder();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}
