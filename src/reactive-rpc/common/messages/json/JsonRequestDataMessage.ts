import type {JsonMessage} from './types';
import type {CompactRequestDataMessage} from '../../codec/compact';
import {RequestDataMessage} from '../nominal';
import {json_string} from '../../../../json-brand';

/**
 * @category Message
 */
export class JsonRequestDataMessage<Data = unknown>
  extends RequestDataMessage<json_string<Data>>
  implements JsonMessage<Data>
{
  public toValue(): Data | undefined {
    return this.data === undefined ? undefined : JSON.parse(this.data);
  }

  public toCompact(): CompactRequestDataMessage<Data> {
    const value = this.toValue();
    return value === undefined ? [this.id, 0, this.method] : [this.id, 0, this.method, value];
  }

  public toCompactJson(): json_string<CompactRequestDataMessage<Data>> {
    const data = this.data;
    if (data === undefined)
      return ('[' + this.id + ',0,"' + this.method + '",' + data + ']') as json_string<CompactRequestDataMessage<Data>>;
    return ('[' + this.id + ',0,"' + this.method + '"]') as json_string<CompactRequestDataMessage<Data>>;
  }
}
