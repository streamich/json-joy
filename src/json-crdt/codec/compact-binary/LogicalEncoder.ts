import {LogicalEncoder as CompactEncoder} from '../compact/LogicalEncoder';
import {encoderFull} from '../../../json-pack/util';
import {Model} from '../../model';

export class LogicalEncoder {
  protected encoder = new CompactEncoder();

  public encode(doc: Model): Uint8Array {
    const json = this.encoder.encode(doc);
    const uint8 = encoderFull.encode(json);
    return uint8;
  }
}
