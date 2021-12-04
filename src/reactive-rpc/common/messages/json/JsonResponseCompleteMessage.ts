import type {JsonMessage} from './types';
import type {CompactResponseCompleteMessage} from '../../codec/compact';
import {ResponseCompleteMessage} from '../nominal';
import {json_string} from '../../../../json-brand';

/**
 * @category Message
 */
export class JsonResponseCompleteMessage<Data = unknown>
  extends ResponseCompleteMessage<json_string<Data>>
  implements JsonMessage<Data>
{
  public toValue(): Data | undefined {
    return this.data !== undefined ? JSON.parse(this.data) : undefined;
  }

  public toCompact(): CompactResponseCompleteMessage<Data> {
    const value = this.toValue();
    return value === undefined ? [0, this.id] : [0, this.id, value];
  }

  public toCompactJson(): json_string<CompactResponseCompleteMessage<Data>> {
    const data = this.data;
    if (data) return ('[0,' + this.id + ',' + data + ']') as json_string<CompactResponseCompleteMessage<Data>>;
    return ('[0,' + this.id + ']') as json_string<CompactResponseCompleteMessage<Data>>;
  }
}
