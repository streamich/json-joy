import {CompleteMessage} from "../messages/CompleteMessage";
import {DataMessage} from "../messages/DataMessage";
import {ErrorMessage} from "../messages/ErrorMessage";
import {NotificationMessage} from "../messages/NotificationMessage";
import {SubscribeMessage} from "../messages/SubscribeMessage";
import {BinaryRxMessage} from "../messages/types";
import {UnsubscribeMessage} from "../messages/UnsubscribeMessage";
import {MessageCode} from "./constants";
import {readHeader} from "./header";

const readMethod = (arr: Uint8Array, offset: number): [method: string, offset: number] => {
  const size = arr[offset++];
  let str = '';
  for (let i = 0; i < size; i++) str += String.fromCharCode(arr[offset++]);
  return [str, offset];
};

/**
 * Decodes a single message from Uint8Array. The array buffer must contain at
 * least one complete message starting from the offset.
 * 
 * Use this method with sockets that already combine packets into messages, like
 * WebSocket. Do not use this method with TCP/IP socket.
 * 
 * @param arr Array buffer from which to decode a message
 * @param offset Starting position from where to start decoding
 * 
 * @category Codec
 */
export const decodeFullMessage = (arr: Uint8Array, offset: number): [message: BinaryRxMessage, offset: number] => {
  const byte1 = arr[offset++];
  const code = byte1 >>> 5;
  switch(code) {
    case MessageCode.Notification: {
      const [length, off1] = readHeader(byte1, arr, offset);
      const [method, off2] = readMethod(arr, off1);
      const data: Uint8Array = arr.subarray(off2, off2 + length);
      return [new NotificationMessage(method, data), off2 + length];
    }
    case MessageCode.Subscribe: {
      const [length, off1] = readHeader(byte1, arr, offset);
      const o1 = arr[off1];
      const o2 = arr[off1 + 1];
      const id = (o1 << 8) | o2;
      const [method, off2] = readMethod(arr, off1 + 2);
      const data: Uint8Array = arr.subarray(off2, off2 + length);
      return [new SubscribeMessage(id, method, data), off2 + length];
    }
    case MessageCode.Data:
    case MessageCode.Complete:
    case MessageCode.Error: {
      const [length, off1] = readHeader(byte1, arr, offset);
      const o1 = arr[off1];
      const o2 = arr[off1 + 1];
      const id = (o1 << 8) | o2;
      offset = off1 + 2;
      const data: Uint8Array = arr.subarray(offset, offset + length);
      const message = code === MessageCode.Data
        ? new DataMessage(id, data)
        : code === MessageCode.Complete
          ? new CompleteMessage(id, data)
          : new ErrorMessage(id, data);
      return [message, offset + length];
    }
    case MessageCode.Unsubscribe: {
      const o1 = arr[offset++];
      const o2 = arr[offset++];
      const id = (o1 << 8) | o2;
      return [new UnsubscribeMessage(id), offset];
    }
  }
  throw new Error('UNKNOWN_MESSAGE');
};

/**
 * Decodes multiple Binary-Rx messages.
 * 
 * @param arr Uint8Array containing multiple Binary-Rx messages.
 * @param offset Byte offset from which to start decoding.
 * @returns An array of decoded Binary-Rx messages.
 * 
 * @category Codec
 */
export const decodeFullMessages = (arr: Uint8Array, offset: number): BinaryRxMessage[]=> {
  const messages: BinaryRxMessage[] = [];
  const length = arr.length;
  while (offset < length) {
    const [message, off] = decodeFullMessage(arr, offset)
    offset = off;
    messages.push(message);
  }
  return messages;
};
