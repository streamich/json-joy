import type {CompactMessage} from '../../codec/compact/types';
import type {NotificationMessage} from './NotificationMessage';
import type {RequestCompleteMessage} from './RequestCompleteMessage';
import type {RequestDataMessage} from './RequestDataMessage';
import type {RequestErrorMessage} from './RequestErrorMessage';
import type {RequestUnsubscribeMessage} from './RequestUnsubscribeMessage';
import type {ResponseCompleteMessage} from './ResponseCompleteMessage';
import type {ResponseDataMessage} from './ResponseDataMessage';
import type {ResponseErrorMessage} from './ResponseErrorMessage';
import type {ResponseUnsubscribeMessage} from './ResponseUnsubscribeMessage';

/**
 * Messages that client can send.
 */
export type ReactiveRpcRequestMessage<D = unknown> =
  | NotificationMessage<D>
  | RequestDataMessage<D>
  | RequestCompleteMessage<D>
  | RequestErrorMessage<D>
  | ResponseUnsubscribeMessage;

/**
 * Messages with which server can respond.
 */
export type ReactiveRpcResponseMessage<D = unknown> =
  | ResponseDataMessage<D>
  | ResponseCompleteMessage<D>
  | ResponseErrorMessage<D>
  | RequestUnsubscribeMessage;

/**
 * All Reactive RPC messages.
 */
export type ReactiveRpcMessage<D = unknown> =
  | ReactiveRpcRequestMessage<D>
  | ReactiveRpcResponseMessage<D>;

export interface Message {
  data?: undefined | unknown;
  toCompact(): CompactMessage;
}
