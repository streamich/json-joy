import type {JsonMessage} from './types';
import type {CompactResponseUnsubscribeMessage} from '../../codec/compact';
import {ResponseUnsubscribeMessage} from '../nominal';
import {json_string} from '../../../../json-brand';

/**
 * @category Message
 */
export class JsonResponseUnsubscribeMessage extends ResponseUnsubscribeMessage implements JsonMessage {
  public toCompactJson(): json_string<CompactResponseUnsubscribeMessage> {
    return '[-3,' + this.id + ']' as json_string<CompactResponseUnsubscribeMessage>;
  }
}
