import {Decoder as CompactDecoder} from '../compact/Decoder';
import {decoder} from '../../../json-pack/util';
import {Model} from '../../model';

export class LogicalDecoder {
  protected decoder = new CompactDecoder();

  public decode(uint8: Uint8Array): Model {
    const json = decoder.decode(uint8);
    const doc = this.decoder.decode(json as unknown[]);
    return doc;
  }
}
