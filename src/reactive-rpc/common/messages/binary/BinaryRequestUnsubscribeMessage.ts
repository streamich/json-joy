import type {BinaryMessage} from './types';
import {RequestUnsubscribeMessage} from '../nominal';

/**
 * @category Message
 */
export class BinaryRequestUnsubscribeMessage extends RequestUnsubscribeMessage implements BinaryMessage {
  public size(): number {
    return 3;
  }
}
