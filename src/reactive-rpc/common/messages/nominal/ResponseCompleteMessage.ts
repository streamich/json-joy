import type {CompactResponseCompleteMessage} from '../../codec/compact/types';
import type {Message} from './types';

/**
 * @category Message
 */
export class ResponseCompleteMessage<D = unknown> implements Message {
  constructor(public readonly id: number, public readonly data: undefined | D) {}

  public toCompact(): CompactResponseCompleteMessage {
    return this.data === undefined ? [-1, this.id] : [-1, this.id, this.data];
  }
}
