import type {CliCodec} from '../types';

export class CliCodecRaw implements CliCodec<'raw'> {
  public readonly id = 'raw';
  public readonly description = 'Raw data, useful for strings and binary data';

  encode(value: unknown): Uint8Array {
    if (value instanceof Uint8Array) return value;
    const str = String(value);
    return new TextEncoder().encode(str);
  }

  decode(bytes: Uint8Array): unknown {
    throw new Error('Not available');
  }
}
