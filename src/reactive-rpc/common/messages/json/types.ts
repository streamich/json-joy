import type {json_string} from '../../../../json-brand';
import type {CompactMessage} from '../../codec/compact/types';
import type {JsonNotificationMessage} from './JsonNotificationMessage';
import type {JsonRequestCompleteMessage} from './JsonRequestCompleteMessage';
import type {JsonResponseUnsubscribeMessage} from './JsonResponseUnsubscribeMessage';
import type {JsonResponseErrorMessage} from './JsonResponseErrorMessage';

import {BinaryRequestDataMessage} from './BinaryRequestDataMessage';
import {BinaryRequestErrorMessage} from './BinaryRequestErrorMessage';
import {BinaryRequestUnsubscribeMessage} from './BinaryRequestUnsubscribeMessage';
import {BinaryResponseCompleteMessage} from './BinaryResponseCompleteMessage';
import {BinaryResponseDataMessage} from './BinaryResponseDataMessage';

export type ReactiveRpcJsonMessage<Data = unknown> =
  | JsonNotificationMessage<Data>
  | JsonRequestCompleteMessage<Data>
  | JsonResponseUnsubscribeMessage
  | JsonResponseErrorMessage

  | BinaryRequestDataMessage
  | BinaryRequestErrorMessage
  | BinaryRequestUnsubscribeMessage
  | BinaryResponseDataMessage
  | BinaryResponseCompleteMessage;

export interface JsonMessage<Data = unknown> {
  toCompactJson(): json_string<CompactMessage<Data>>;
}
