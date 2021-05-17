import type {CompactRequestUnsubscribeMessage} from '../../codec/compact/types';
import type {Message} from './types';

/**
 * @category Message
 */
export class RequestUnsubscribeMessage implements Message {
  constructor(public readonly id: number) {}

  public toCompact(): CompactRequestUnsubscribeMessage {
    return [this.id, 3];
  }
}
