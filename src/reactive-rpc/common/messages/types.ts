import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type * as msg from './messages';

/**
 * Messages that client can send.
 */
export type ReactiveRpcClientMessage =
  | msg.NotificationMessage
  | msg.RequestDataMessage
  | msg.RequestCompleteMessage
  | msg.RequestErrorMessage
  | msg.ResponseUnsubscribeMessage;

/**
 * Messages with which server can respond.
 */
export type ReactiveRpcServerMessage =
  | msg.ResponseDataMessage
  | msg.ResponseCompleteMessage
  | msg.ResponseErrorMessage
  | msg.RequestUnsubscribeMessage;

/**
 * All Reactive RPC messages.
 */
export type ReactiveRpcMessage = ReactiveRpcClientMessage | ReactiveRpcServerMessage;

export interface Message<P = unknown> {
  value?: undefined | unknown;
  validate(): void;
  toCompact(): P;
  encodeCompact(codec: JsonValueCodec): void;
  encodeBinary(codec: JsonValueCodec): void;
}
