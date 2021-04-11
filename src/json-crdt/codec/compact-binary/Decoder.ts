import {Decoder as CompactDecoder} from '../compact/Decoder';
import {Decoder as MessagePackDecoder} from '../../../json-pack/Decoder';
import {Document} from '../../document';

export class Decoder {
  protected decoder = new CompactDecoder();
  protected msgPack = new MessagePackDecoder();

  public decode(uint8: Uint8Array): Document {
    const json = this.msgPack.decode(uint8);
    const doc = this.decoder.decode(json as unknown[]);
    return doc;
  }
}
