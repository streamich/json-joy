import type {BinaryMessage} from './types';
import {ResponseUnsubscribeMessage} from '../nominal';
import type {Encoder} from '../../../../json-pack';

/**
 * @category Message
 */
export class BinaryResponseUnsubscribeMessage extends ResponseUnsubscribeMessage implements BinaryMessage {
  public size(): number {
    return 3;
  }

  public writeCompact(encoder: Encoder): void {
    encoder.encodeArrayHeader(2);
    encoder.encodeUnsignedInteger(-3);
    encoder.encodeUnsignedInteger(this.id);
  }
}
