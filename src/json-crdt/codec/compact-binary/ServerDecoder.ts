import {ServerDecoder as CompactDecoder} from '../compact/ServerDecoder';
import {decoder} from '../../../json-pack/util';
import {Model} from '../../model';

export class ServerDecoder {
  protected decoder = new CompactDecoder();

  public decode(uint8: Uint8Array): Model {
    const json = decoder.decode(uint8);
    const doc = this.decoder.decode(json as unknown[]);
    return doc;
  }
}
