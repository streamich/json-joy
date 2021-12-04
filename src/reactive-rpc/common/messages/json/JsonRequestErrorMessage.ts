import type {JsonMessage} from './types';
import type {CompactRequestErrorMessage} from '../../codec/compact';
import {RequestErrorMessage} from '../nominal';
import {json_string} from '../../../../json-brand';

/**
 * @category Message
 */
export class JsonRequestErrorMessage<Data = unknown> extends RequestErrorMessage<json_string<Data>> implements JsonMessage<Data> {
  public toValue(): Data {
    return JSON.parse(this.data);
  }

  public toCompact(): CompactRequestErrorMessage<Data> {
    const value = this.toValue();
    return [this.id, 1, this.method, value];
  }

  public toCompactJson(): json_string<CompactRequestErrorMessage<Data>> {
    return '[' + this.id + ',1,"' + this.method + '",' + this.data + ']' as json_string<CompactRequestErrorMessage<Data>>;
  }
}
