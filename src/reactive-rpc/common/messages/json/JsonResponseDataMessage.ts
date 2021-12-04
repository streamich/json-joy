import type {JsonMessage} from './types';
import type {CompactResponseDataMessage} from '../../codec/compact';
import {ResponseDataMessage} from '../nominal';
import {json_string} from '../../../../json-brand';

/**
 * @category Message
 */
export class JsonResponseDataMessage<Data = unknown> extends ResponseDataMessage<json_string<Data>> implements JsonMessage<Data> {
  public toValue(): Data {
    return JSON.parse(this.data);
  }

  public toCompact(): CompactResponseDataMessage<Data> {
    const value = this.toValue();
    return [-2, this.id, value];
  }

  public toCompactJson(): json_string<CompactResponseDataMessage<Data>> {
    return '[-2,' + this.id + ',' + this.data + ']' as json_string<CompactResponseDataMessage<Data>>;
  }
}
