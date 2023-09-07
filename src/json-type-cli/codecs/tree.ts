import {toTree} from '../../json-text/toTree';
import type {CliCodec} from '../types';

export class CliCodecTree implements CliCodec<'tree'> {
  public readonly id = 'tree';

  encode(value: unknown): Uint8Array {
    const str = toTree(value);
    return new TextEncoder().encode(str + '\n');
  }

  decode(bytes: Uint8Array): unknown {
    throw new Error('Not implemented');
  }
}
