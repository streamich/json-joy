import type {CompactResponseErrorMessage} from '../../codec/compact/types';
import type {Message} from './types';

/**
 * @category Message
 */
export class ResponseErrorMessage<D = unknown> implements Message {
  constructor(public readonly id: number, public readonly data: D) {}

  public toCompact(): CompactResponseErrorMessage {
    return [-2, this.id, this.data];
  }
}
