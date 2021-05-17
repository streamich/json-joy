import {BinaryNotificationMessage} from './BinaryNotificationMessage';
import {BinaryRequestCompleteMessage} from './BinaryRequestCompleteMessage';
import {BinaryRequestDataMessage} from './BinaryRequestDataMessage';
import {BinaryRequestErrorMessage} from './BinaryRequestErrorMessage';
import {BinaryRequestUnsubscribeMessage} from './BinaryRequestUnsubscribeMessage';
import {BinaryResponseCompleteMessage} from './BinaryResponseCompleteMessage';
import {BinaryResponseDataMessage} from './BinaryResponseDataMessage';
import {BinaryResponseErrorMessage} from './BinaryResponseErrorMessage';
import {BinaryResponseUnsubscribeMessage} from './BinaryResponseUnsubscribeMessage';

export type ReactiveRpcBinaryMessage =
  | BinaryNotificationMessage
  | BinaryRequestDataMessage
  | BinaryRequestCompleteMessage
  | BinaryRequestErrorMessage
  | BinaryRequestUnsubscribeMessage
  | BinaryResponseDataMessage
  | BinaryResponseCompleteMessage
  | BinaryResponseErrorMessage
  | BinaryResponseUnsubscribeMessage;

export interface BinaryMessage {
  size(): number;
}
