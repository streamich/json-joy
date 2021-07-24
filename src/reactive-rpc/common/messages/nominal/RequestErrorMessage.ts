import type {CompactRequestErrorMessage} from '../../codec/compact/types';
import type {Message} from './types';

/**
 * @category Message
 */
export class RequestErrorMessage<D = unknown> implements Message {
  constructor(public readonly id: number, public method: string, public readonly data: D) {}

  public toCompact(): CompactRequestErrorMessage {
    return [this.id, 1, this.method, this.data];
  }
}
