import type {CompactResponseUnsubscribeMessage} from '../../codec/compact/types';
import type {Message} from './types';

/**
 * @category Message
 */
export class ResponseUnsubscribeMessage implements Message {
  constructor(public readonly id: number) {}

  public toCompact(): CompactResponseUnsubscribeMessage {
    return [-3, this.id];
  }
}
