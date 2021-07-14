import type {CompactNotificationMessage} from '../../codec/compact/types';
import type {Message} from './types';

/**
 * @category Message
 */
export class NotificationMessage<D = unknown> implements Message {
  constructor(public readonly method: string, public readonly data: undefined | D) {}

  public toCompact(): CompactNotificationMessage {
    return this.data === undefined ? [this.method] : [this.method, this.data];
  }
}
