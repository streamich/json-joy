import type {BinaryMessage} from './types';
import {RequestUnsubscribeMessage} from '../nominal';
import type {Encoder} from '../../../../json-pack';

/**
 * @category Message
 */
export class BinaryRequestUnsubscribeMessage extends RequestUnsubscribeMessage implements BinaryMessage {
  public size(): number {
    return 3;
  }

  public writeCompact(encoder: Encoder): void {
    encoder.encodeArrayHeader(2);
    encoder.encodeUnsignedInteger(this.id);
    encoder.u8(2);
  }
}
