import type {JsonMessage} from './types';
import type {CompactRequestCompleteMessage} from '../../codec/compact';
import {RequestCompleteMessage} from '../nominal';
import {json_string} from '../../../../json-brand';

/**
 * @category Message
 */
export class JsonRequestCompleteMessage<Data = unknown> extends RequestCompleteMessage<json_string<Data>> implements JsonMessage<Data> {
  public toValue(): Data | undefined {
    return this.data ? JSON.parse(this.data) : undefined;
  }

  public toCompact(): CompactRequestCompleteMessage<Data> {
    const value = this.toValue();
    return value === undefined ? [this.id, this.method] : [this.id, this.method, value];
  }

  public toCompactJson(): json_string<CompactRequestCompleteMessage<Data>> {
    if (this.data) return '[' + this.id + ',"' + this.method + '",' + this.data + ']' as json_string<CompactRequestCompleteMessage<Data>>;
    return '[' + this.id + ',"' + this.method + '"]' as json_string<CompactRequestCompleteMessage<Data>>;
  }
}
