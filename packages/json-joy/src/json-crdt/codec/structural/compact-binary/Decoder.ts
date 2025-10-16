import {Decoder as CompactDecoder} from '../compact/Decoder';
import {decoder} from '@jsonjoy.com/json-pack/lib/msgpack/util';
import type {Model} from '../../../model';

export class Decoder {
  protected decoder = new CompactDecoder();

  public decode(uint8: Uint8Array): Model {
    const json = decoder.read(uint8);
    const doc = this.decoder.decode(json as any);
    return doc;
  }
}
