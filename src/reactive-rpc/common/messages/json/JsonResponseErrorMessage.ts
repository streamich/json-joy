import type {JsonMessage} from './types';
import type {CompactResponseErrorMessage} from '../../codec/compact';
import {ResponseErrorMessage} from '../nominal';
import {json_string} from '../../../../json-brand';

/**
 * @category Message
 */
export class JsonResponseErrorMessage<Data = unknown>
  extends ResponseErrorMessage<json_string<Data>>
  implements JsonMessage<Data>
{
  public toValue(): Data {
    return JSON.parse(this.data);
  }

  public toCompact(): CompactResponseErrorMessage<Data> {
    const value = this.toValue();
    return [-1, this.id, value];
  }

  public toCompactJson(): json_string<CompactResponseErrorMessage<Data>> {
    return ('[-1,' + this.id + ',' + this.data + ']') as json_string<CompactResponseErrorMessage<Data>>;
  }
}
