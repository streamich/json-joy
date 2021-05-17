import {MessageCode} from './constants';
import {writeHeader} from './header';
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

/**
 * @category Codec
 */
export class Encoder {
  private uint8: Uint8Array = new Uint8Array(0);
  private offset: number = 0;

  public encode(messages: ReactiveRpcBinaryMessage[]): Uint8Array {
    let size = 0;
    const length = messages.length;
    for (let i = 0; i < length; i++) size += messages[i].size();
    this.uint8 = new Uint8Array(size);
    this.offset = 0;
    for (let i = 0; i < length; i++) {
      const message = messages[i];
      if (message instanceof BinaryNotificationMessage) this.notif(message);
      else if (message instanceof BinaryRequestDataMessage)
        this.msgWithIdAndMethod(MessageCode.RequestData, message.id, message.method, message.data);
      else if (message instanceof BinaryRequestCompleteMessage)
        this.msgWithIdAndMethod(MessageCode.RequestComplete, message.id, message.method, message.data);
      else if (message instanceof BinaryRequestErrorMessage)
        this.msgWithIdAndMethod(MessageCode.RequestError, message.id, message.method, message.data);
      else if (message instanceof BinaryRequestUnsubscribeMessage) this.reqUnsub(message);
      else if (message instanceof BinaryResponseDataMessage) this.resData(message);
      else if (message instanceof BinaryResponseCompleteMessage) this.resComp(message);
      else if (message instanceof BinaryResponseErrorMessage) this.resErr(message);
      else if (message instanceof BinaryResponseUnsubscribeMessage) this.resUnsub(message);
    }
    return this.uint8;
  }

  private notif(message: BinaryNotificationMessage) {
    const {method, data} = message;
    const length = data ? data.byteLength : 0;
    this.header(MessageCode.Notification, length);
    this.method(method);
    if (length) {
      this.uint8.set(data!, this.offset);
      this.offset += length;
    }
  }

  private reqUnsub(message: BinaryRequestUnsubscribeMessage) {
    this.uint8[this.offset++] = MessageCode.RequestUnsubscribe;
    this.id(message.id);
  }

  private resData(message: BinaryResponseDataMessage) {
    this.msgWithId(MessageCode.ResponseData, message.id, message.data);
  }

  private resComp(message: BinaryResponseCompleteMessage) {
    this.msgWithId(MessageCode.ResponseComplete, message.id, message.data);
  }

  private resErr(message: BinaryResponseErrorMessage) {
    this.msgWithId(MessageCode.ResponseError, message.id, message.data);
  }

  private resUnsub(message: BinaryResponseUnsubscribeMessage) {
    this.uint8[this.offset++] = MessageCode.ResponseUnsubscribe;
    this.id(message.id);
  }

  private msgWithIdAndMethod(code: MessageCode, id: number, method: string, data: undefined | Uint8Array) {
    const length = data ? data.byteLength : 0;
    this.header(code, length);
    this.id(id);
    this.method(method);
    if (length) {
      this.uint8.set(data!, this.offset);
      this.offset += length;
    }
  }

  private msgWithId(code: MessageCode, id: number, data: undefined | Uint8Array) {
    const length = data ? data.byteLength : 0;
    this.header(code, length);
    this.id(id);
    if (length) {
      this.uint8.set(data!, this.offset);
      this.offset += length;
    }
  }

  private header(code: MessageCode, length: number) {
    this.offset = writeHeader(this.uint8, this.offset, code, length);
  }

  private id(id: number) {
    this.uint8[this.offset++] = id >>> 8;
    this.uint8[this.offset++] = id & 0xff;
  }

  private method(method: string) {
    const uint8 = this.uint8;
    const length = method.length;
    let offset = this.offset;
    uint8[offset++] = length;
    for (let i = 0; i < length; i++) uint8[offset++] = method.charCodeAt(i);
    this.offset = offset;
  }
}
