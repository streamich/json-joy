import {
  NotificationMessage,
  RequestCompleteMessage,
  RequestDataMessage,
  RequestErrorMessage,
  RequestUnsubscribeMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
  ReactiveRpcMessage,
} from '../../messages/nominal';
import type {
  CompactMessage,
  CompactNotificationMessage,
  CompactRequestCompleteMessage,
  CompactRequestDataMessage,
  CompactRequestErrorMessage,
  CompactRequestUnsubscribeMessage,
  CompactResponseCompleteMessage,
  CompactResponseDataMessage,
  CompactResponseErrorMessage,
  CompactResponseUnsubscribeMessage,
} from './types';

export function decodeMsg<T = unknown>(message: CompactMessage): ReactiveRpcMessage<T> {
  if (!(message instanceof Array)) {
    throw new Error('Invalid message');
  }
  const length = message.length;
  if (length < 1 || length > 4) {
    throw new Error('Invalid message');
  }
  const first = message[0];
  if (typeof first === 'number') {
    switch (first) {
      case 0: {
        const [, id, data] = message as CompactResponseCompleteMessage<T>;
        return new ResponseCompleteMessage(id, data);
      }
      case -1: {
        const [, id, data] = message as CompactResponseErrorMessage<T>;
        return new ResponseErrorMessage(id, data);
      }
      case -2: {
        const [, id, data] = message as CompactResponseDataMessage<T>;
        return new ResponseDataMessage(id, data);
      }
      case -3: {
        const [, id] = message as CompactResponseUnsubscribeMessage;
        return new ResponseUnsubscribeMessage(id);
      }
      default: {
        const [, second] = message as
          | CompactRequestDataMessage
          | CompactRequestCompleteMessage
          | CompactRequestErrorMessage
          | CompactRequestUnsubscribeMessage;
        switch (second) {
          case 0: {
            const [, , name, data] = message as CompactRequestDataMessage<T>;
            return new RequestDataMessage(first, name, data);
          }
          case 1: {
            const [, , method, data] = message as CompactRequestErrorMessage<T>;
            return new RequestErrorMessage(first, method, data);
          }
          case 2: {
            return new RequestUnsubscribeMessage(first);
          }
          default: {
            const [, name, data] = message as CompactRequestCompleteMessage<T>;
            return new RequestCompleteMessage(first, name, data);
          }
        }
      }
    }
  }
  const [method, data] = message as CompactNotificationMessage<T>;
  return new NotificationMessage(method, data);
}

export function decode<T = unknown>(messages: CompactMessage): ReactiveRpcMessage<T>;
export function decode<T = unknown>(messages: CompactMessage[]): ReactiveRpcMessage<T>[];
export function decode<T = unknown>(
  messages: CompactMessage | CompactMessage[],
): ReactiveRpcMessage<T> | ReactiveRpcMessage<T>[] {
  if (messages[0] instanceof Array) {
    const length = messages.length;
    const out: ReactiveRpcMessage<T>[] = [];
    for (let i = 0; i < length; i++) out.push(decodeMsg<T>((messages as CompactMessage[])[i]));
    return out;
  } else return decodeMsg<T>(messages as CompactMessage);
}
