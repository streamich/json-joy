import {MessageCode} from './constants';
import {writeHeader} from './header';
import {DataMessage} from '../messages/DataMessage';
import {NotificationMessage} from '../messages/NotificationMessage';
import {SubscribeMessage} from '../messages/SubscribeMessage';
import {BinaryRxMessage} from '../messages/types';
import {CompleteMessage} from '../messages/CompleteMessage';
import {ErrorMessage} from '../messages/ErrorMessage';
import {UnsubscribeMessage} from '../messages/UnsubscribeMessage';

/**
 * @category Codec
 */
export class Encoder {
  private uint8: Uint8Array = new Uint8Array(0);
  private offset: number = 0;

  public encode(messages: BinaryRxMessage[]): Uint8Array {
    let size = 0;
    const length = messages.length;
    for (let i = 0; i < length; i++) size += messages[i].size();
    this.uint8 = new Uint8Array(size);
    this.offset = 0;
    for (let i = 0; i < length; i++) {
      const message = messages[i];
      if (message instanceof NotificationMessage) this.notif(message);
      else if (message instanceof SubscribeMessage) this.sub(message);
      else if (message instanceof DataMessage) this.data(message);
      else if (message instanceof CompleteMessage) this.comp(message);
      else if (message instanceof ErrorMessage) this.err(message);
      else if (message instanceof UnsubscribeMessage) this.unsub(message);
    }
    return this.uint8;
  }

  private notif(message: NotificationMessage) {
    const {method, data} = message;
    const length = data ? data.byteLength : 0;
    this.header(MessageCode.Notification, length);
    this.method(method);
    if (length) {
      this.uint8.set(data!, this.offset);
      this.offset += length;
    }
  }

  private sub(message: SubscribeMessage) {
    const {id, method, data} = message;
    const length = data ? data.byteLength : 0;
    this.header(MessageCode.Subscribe, length);
    this.id(id);
    this.method(method);
    if (length) {
      this.uint8.set(data!, this.offset);
      this.offset += length;
    }
  }

  private data(message: DataMessage) {
    this.msgWithId(MessageCode.Data, message.id, message.data);
  }

  private comp(message: CompleteMessage) {
    this.msgWithId(MessageCode.Complete, message.id, message.data);
  }

  private err(message: ErrorMessage) {
    this.msgWithId(MessageCode.Error, message.id, message.data);
  }

  private unsub(message: UnsubscribeMessage) {
    this.uint8[this.offset++] = MessageCode.Unsubscribe << 5;
    this.id(message.id);
  }

  private msgWithId(code: MessageCode, id: number, data?: Uint8Array) {
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
