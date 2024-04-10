import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {bufferToUint8Array} from '@jsonjoy.com/util/lib/buffers/bufferToUint8Array';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

/**
 * JSON codec with 2 space pretty-printing.
 */
export class CliCodecJson2 implements CliCodec<'json2'> {
  public readonly id = 'json2';
  public readonly description = 'JSON codec with 2 space pretty-printing';
  protected readonly encoder: JsonEncoder;
  protected readonly decoder: JsonDecoder;

  constructor(protected readonly writer: Writer) {
    this.encoder = new JsonEncoder(writer);
    this.decoder = new JsonDecoder();
  }

  encode(value: unknown): Uint8Array {
    const uint8 = this.encoder.encode(value);
    const pojo = JSON.parse(Buffer.from(uint8).toString('utf8'));
    const json = JSON.stringify(pojo, null, 2) + '\n';
    return bufferToUint8Array(Buffer.from(json, 'utf8'));
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}
