import {CborDecoder} from '../../json-pack/cbor/CborDecoder';
import {CborEncoder} from '../../json-pack/cbor/CborEncoder';
import type {Writer} from '../../util/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecCbor implements CliCodec<'cbor'> {
  public readonly id = 'cbor';
  public readonly description = 'CBOR codec';
  protected readonly encoder: CborEncoder;
  protected readonly decoder: CborDecoder;

  constructor(protected readonly writer: Writer) {
    this.encoder = new CborEncoder(writer);
    this.decoder = new CborDecoder();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}
