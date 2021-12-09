import type {json_string} from '../../../../json-brand';
import type {CompactMessage} from '../../codec/compact/types';
import type {JsonNotificationMessage} from './JsonNotificationMessage';
import type {JsonRequestCompleteMessage} from './JsonRequestCompleteMessage';
import type {JsonResponseUnsubscribeMessage} from './JsonResponseUnsubscribeMessage';
import type {JsonResponseErrorMessage} from './JsonResponseErrorMessage';
import type {JsonResponseDataMessage} from './JsonResponseDataMessage';
import type {JsonResponseCompleteMessage} from './JsonResponseCompleteMessage';
import type {JsonRequestUnsubscribeMessage} from './JsonRequestUnsubscribeMessage';
import type {JsonRequestErrorMessage} from './JsonRequestErrorMessage';
import type {JsonRequestDataMessage} from './JsonRequestDataMessage';

export type ReactiveRpcJsonMessage<Data = unknown> =
  | JsonNotificationMessage<Data>
  | JsonRequestCompleteMessage<Data>
  | JsonResponseUnsubscribeMessage
  | JsonResponseErrorMessage
  | JsonResponseDataMessage
  | JsonResponseCompleteMessage
  | JsonRequestUnsubscribeMessage
  | JsonRequestErrorMessage
  | JsonRequestDataMessage;

export interface JsonMessage<Data = unknown> {
  toCompactJson(): json_string<CompactMessage<Data>>;
}
