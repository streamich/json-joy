import {UbjsonDecoder} from '@jsonjoy.com/json-pack/lib/ubjson/UbjsonDecoder';
import {UbjsonEncoder} from '@jsonjoy.com/json-pack/lib/ubjson/UbjsonEncoder';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecUbjson implements CliCodec<'ubjson'> {
  public readonly id = 'ubjson';
  public readonly description = 'UBJSON codec';
  protected readonly encoder: UbjsonEncoder;
  protected readonly decoder: UbjsonDecoder;

  constructor(protected readonly writer: Writer) {
    this.encoder = new UbjsonEncoder(writer);
    this.decoder = new UbjsonDecoder();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}
