import type {JsonMessage} from './types';
import type {CompactRequestUnsubscribeMessage} from '../../codec/compact';
import {RequestUnsubscribeMessage} from '../nominal';
import {json_string} from '../../../../json-brand';

/**
 * @category Message
 */
export class JsonRequestUnsubscribeMessage extends RequestUnsubscribeMessage implements JsonMessage {
  public toCompactJson(): json_string<CompactRequestUnsubscribeMessage> {
    return ('[' + this.id + ',2]') as json_string<CompactRequestUnsubscribeMessage>;
  }
}
