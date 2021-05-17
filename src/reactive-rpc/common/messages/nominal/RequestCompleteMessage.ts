import type {CompactRequestCompleteMessage} from '../../codec/compact/types';
import type {Message} from './types';

/**
 * @category Message
 */
export class RequestCompleteMessage<D = unknown> implements Message {
  constructor(public readonly id: number, public readonly method: string, public readonly data: undefined | D) {}

  public toCompact(): CompactRequestCompleteMessage {
    return this.data === undefined ? [this.id, 1, this.method] : [this.id, 1, this.method, this.data];
  }
}
