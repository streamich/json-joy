import type {CompactResponseDataMessage} from '../../codec/compact/types';
import type {Message} from './types';

/**
 * @category Message
 */
export class ResponseDataMessage<D = unknown> implements Message {
  constructor(public readonly id: number, public readonly data: D) {}

  public toCompact(): CompactResponseDataMessage {
    return [0, this.id, this.data];
  }
}
