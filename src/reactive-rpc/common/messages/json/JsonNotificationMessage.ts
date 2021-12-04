import type {JsonMessage} from './types';
import type {CompactNotificationMessage} from '../../codec/compact';
import {NotificationMessage} from '../nominal';
import {JSON, json_string} from '../../../../json-brand';

/**
 * @category Message
 */
export class JsonNotificationMessage<Data = unknown>
  extends NotificationMessage<json_string<Data>>
  implements JsonMessage<Data>
{
  public toValue(): Data | undefined {
    return this.data ? JSON.parse(this.data) : undefined;
  }

  public toCompact(): CompactNotificationMessage<Data> {
    const value = this.toValue();
    return value === undefined ? [this.method] : ([this.method, value] as CompactNotificationMessage<Data>);
  }

  public toCompactJson(): json_string<CompactNotificationMessage<Data>> {
    if (this.data)
      return ('["' + this.method + '",' + this.data + ']') as json_string<CompactNotificationMessage<Data>>;
    return ('["' + this.method + '"]') as json_string<CompactNotificationMessage<Data>>;
  }
}
