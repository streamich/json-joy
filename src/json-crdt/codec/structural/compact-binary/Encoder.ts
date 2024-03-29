import {Encoder as CompactEncoder} from '../compact/Encoder';
import {encoderFull} from '../../../../json-pack/msgpack/util';
import {Model} from '../../../model';

export class Encoder {
  protected encoder = new CompactEncoder();

  public encode(doc: Model): Uint8Array {
    const json = this.encoder.encode(doc);
    const uint8 = encoderFull.encode(json);
    return uint8;
  }
}
