import type {BinaryMessage} from './types';
import {ResponseUnsubscribeMessage} from '../nominal';

/**
 * @category Message
 */
export class BinaryResponseUnsubscribeMessage extends ResponseUnsubscribeMessage implements BinaryMessage {
  public size(): number {
    return 3;
  }
}
