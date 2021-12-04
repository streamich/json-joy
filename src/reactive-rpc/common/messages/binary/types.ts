import type {Encoder} from '../../../../json-pack';
import type {BinaryNotificationMessage} from './BinaryNotificationMessage';
import type {BinaryRequestCompleteMessage} from './BinaryRequestCompleteMessage';
import type {BinaryRequestDataMessage} from './BinaryRequestDataMessage';
import type {BinaryRequestErrorMessage} from './BinaryRequestErrorMessage';
import type {BinaryRequestUnsubscribeMessage} from './BinaryRequestUnsubscribeMessage';
import type {BinaryResponseCompleteMessage} from './BinaryResponseCompleteMessage';
import type {BinaryResponseDataMessage} from './BinaryResponseDataMessage';
import type {BinaryResponseErrorMessage} from './BinaryResponseErrorMessage';
import type {BinaryResponseUnsubscribeMessage} from './BinaryResponseUnsubscribeMessage';

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
  writeCompact(encoder: Encoder): void;
}
