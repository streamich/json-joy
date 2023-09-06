import type {CliCodec} from '../types';

export class CliCodecTree implements CliCodec<'tree'> {
  public readonly id = 'tree';

  encode(value: unknown): Uint8Array {
    throw new Error('Not implemented');
  }

  decode(bytes: Uint8Array): unknown {
    throw new Error('Not implemented');
  }
}
