import {LogicalEncoder as CompactEncoder} from '../compact/LogicalEncoder';
import {Encoder as MessagePackEncoder} from '../../../json-pack/Encoder';
import {Model} from '../../model';

export class LogicalEncoder {
  protected encoder = new CompactEncoder();
  protected msgPack = new MessagePackEncoder();

  public encode(doc: Model): Uint8Array {
    const json = this.encoder.encode(doc);
    const uint8 = this.msgPack.encode(json);
    return uint8;
  }
}
