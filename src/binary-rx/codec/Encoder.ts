import {MessageCode} from "./constants";
import {writeHeader} from "./header";
import {DataMessage} from "../messages/DataMessage";
import {NotificationMessage} from "../messages/NotificationMessage";
import {SubscribeMessage} from "../messages/SubscribeMessage";
import {BinaryRxMessage} from '../messages/types';
import {CompleteMessage} from "../messages/CompleteMessage";
import {ErrorMessage} from "../messages/ErrorMessage";
import {UnsubscribeMessage} from "../messages/UnsubscribeMessage";

export class Encoder {
  private uint8: Uint8Array = new Uint8Array(0);
  private offset: number = 0;

  public encode(messages: BinaryRxMessage[]): Uint8Array {
    let maxSize = 0;
    const messageCount = messages.length;
    for (let i = 0; i < messageCount; i++) maxSize = messages[i].maxLength();
    this.uint8 = new Uint8Array(maxSize);
    this.offset = 0;
    for (let i = 0; i < messageCount; i++) {
      const message = messages[i];
      if (message instanceof NotificationMessage) this.writeNotifMsg(message);
      else if (message instanceof SubscribeMessage) this.writeSubMsg(message);
      else if (message instanceof DataMessage) this.writeDataMsg(message);
      else if (message instanceof CompleteMessage) this.writeCompMsg(message);
      else if (message instanceof ErrorMessage) this.writeErrMsg(message);
      else if (message instanceof UnsubscribeMessage) this.writeUnsubMsg(message);
    }
    return this.uint8.subarray(0, this.offset);
  }

  private writeNotifMsg(message: NotificationMessage) {
    const {method, data} = message;
    const length = data ? data.byteLength : 0;
    this.writeHeader(MessageCode.Notification, length);
    this.writeMethod(method);
    if (length) {
      this.uint8.set(data!, this.offset);
      this.offset += length;
    }
  }

  private writeSubMsg(message: SubscribeMessage) {
    const {id, method, data} = message;
    const length = data ? data.byteLength : 0;
    this.writeHeader(MessageCode.Subscribe, length);
    this.writeId(id);
    this.writeMethod(method);
    if (length) {
      this.uint8.set(data!, this.offset);
      this.offset += length;
    }
  }

  private writeDataMsg(message: DataMessage) {
    this.writeMsgWithId(MessageCode.Data, message.id, message.data);
  }

  private writeCompMsg(message: CompleteMessage) {
    this.writeMsgWithId(MessageCode.Complete, message.id, message.data);
  }

  private writeErrMsg(message: ErrorMessage) {
    this.writeMsgWithId(MessageCode.Error, message.id, message.data);
  }

  private writeUnsubMsg(message: UnsubscribeMessage) {
    this.uint8[this.offset++] = 0b10000000;
    this.writeId(message.id);
  }

  private writeMsgWithId(code: MessageCode, id: number, data?: Uint8Array) {
    const length = data ? data.byteLength : 0;
    this.writeHeader(code, length);
    this.writeId(id);
    if (length) {
      this.uint8.set(data!, this.offset);
      this.offset += length;
    }
  }

  private writeHeader(code: MessageCode, length: number) {
    this.offset = writeHeader(this.uint8, this.offset, code, length);
  }

  private writeId(id: number) {
    this.uint8[this.offset++] = id >>> 8;
    this.uint8[this.offset++] = id & 0xFF;
  }

  private writeMethod(method: string) {
    const uint8 = this.uint8;
    const length = method.length;
    let offset = this.offset;
    uint8[offset++] = length;
    for (let i = 0; i < length; i++) uint8[offset++] = method.charCodeAt(i);
    this.offset = offset;
  }
}
