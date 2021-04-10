import {Encoder as CompactEncoder} from '../compact/Encoder';
import {Encoder as MessagePackEncoder} from '../../../json-pack/Encoder';
import {Document} from '../../document';

export class Encoder {
  protected encoder = new CompactEncoder();
  protected msgPack = new MessagePackEncoder();

  public encode(doc: Document): Uint8Array {
    const json = this.encoder.encode(doc);
    const uint8 = this.msgPack.encode(json);
    return uint8;
  }
}
