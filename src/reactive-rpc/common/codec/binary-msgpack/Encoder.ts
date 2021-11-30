import {
  ReactiveRpcBinaryMessage,
  BinaryNotificationMessage,
  BinaryRequestDataMessage,
  BinaryRequestCompleteMessage,
  BinaryRequestErrorMessage,
  BinaryRequestUnsubscribeMessage,
  BinaryResponseDataMessage,
  BinaryResponseCompleteMessage,
  BinaryResponseErrorMessage,
  BinaryResponseUnsubscribeMessage,
} from '../../messages/binary';
import {
  ReactiveRpcMessage,
  RequestDataMessage,
  RequestCompleteMessage,
  RequestErrorMessage,
  RequestUnsubscribeMessage,
  ResponseDataMessage,
  ResponseCompleteMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
} from '../../messages/nominal';
import {Encoder as EncoderBinary} from '../binary/Encoder';
import {encoderFull} from '../../../../json-pack/util';

const EMPTY = new Uint8Array([]);

/**
 * @category Codec
 */
export class Encoder {
  protected readonly binary = new EncoderBinary();
  protected readonly msgpack = encoderFull;

  protected encodeData(data: undefined | unknown): Uint8Array {
    if (data === undefined) return EMPTY;
    return this.msgpack.encode(data);
  }

  protected convertMessage(message: ReactiveRpcMessage): ReactiveRpcBinaryMessage {
    if (message instanceof ResponseDataMessage)
      return new BinaryResponseDataMessage(message.id, this.encodeData(message.data));
    else if (message instanceof ResponseCompleteMessage)
      return new BinaryResponseCompleteMessage(message.id, this.encodeData(message.data));
    else if (message instanceof ResponseErrorMessage)
      return new BinaryResponseErrorMessage(message.id, this.encodeData(message.data));
    else if (message instanceof ResponseUnsubscribeMessage) return new BinaryResponseUnsubscribeMessage(message.id);
    else if (message instanceof RequestDataMessage)
      return new BinaryRequestDataMessage(message.id, message.method, this.encodeData(message.data));
    else if (message instanceof RequestCompleteMessage)
      return new BinaryRequestCompleteMessage(message.id, message.method, this.encodeData(message.data));
    else if (message instanceof RequestErrorMessage)
      return new BinaryRequestErrorMessage(message.id, message.method, this.encodeData(message.data));
    else if (message instanceof RequestUnsubscribeMessage) return new BinaryRequestUnsubscribeMessage(message.id);
    // else if (message instanceof NotificationMessage) return new BinaryNotificationMessage(message.method, this.encodeData(message.data));
    return new BinaryNotificationMessage(message.method, this.encodeData(message.data));
  }

  public encode(messages: ReactiveRpcMessage[]): Uint8Array {
    const binaryMessages: ReactiveRpcBinaryMessage[] = [];
    const length = messages.length;
    for (let i = 0; i < length; i++) binaryMessages.push(this.convertMessage(messages[i]));
    return this.binary.encode(binaryMessages);
  }
}
