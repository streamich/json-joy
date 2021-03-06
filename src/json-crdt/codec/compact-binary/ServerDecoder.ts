import {ServerDecoder as CompactDecoder} from '../compact/ServerDecoder';
import {Decoder as MessagePackDecoder} from '../../../json-pack/Decoder';
import {Model} from '../../model';

export class ServerDecoder {
  protected decoder = new CompactDecoder();
  protected msgPack = new MessagePackDecoder();

  public decode(uint8: Uint8Array): Model {
    const json = this.msgPack.decode(uint8);
    const doc = this.decoder.decode(json as unknown[]);
    return doc;
  }
}
