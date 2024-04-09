import {Uint8ArrayCut} from '@jsonjoy.com/util/lib/buffers/Uint8ArrayCut';
import {
  NotificationMessage,
  ReactiveRpcMessage,
  RequestCompleteMessage,
  RequestDataMessage,
  RequestErrorMessage,
  RequestUnsubscribeMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
} from '../../messages';
import {RpcValue} from '../../messages/Value';
import {BinaryMessageType} from './constants';
import type {Reader} from '@jsonjoy.com/util/lib/buffers/Reader';

export const decode = (reader: Reader): ReactiveRpcMessage => {
  const word = reader.u32();
  const type = word >>> 29;
  switch (type) {
    case BinaryMessageType.Notification: {
      const z = word & 0xff;
      const x = word >>> 8;
      const name = reader.ascii(z);
      const cut = new Uint8ArrayCut(reader.uint8, reader.x, x);
      const value = new RpcValue(cut, undefined);
      reader.skip(x);
      return new NotificationMessage(name, value);
    }
    case BinaryMessageType.RequestData:
    case BinaryMessageType.RequestComplete:
    case BinaryMessageType.RequestError: {
      const z = reader.u8();
      const name = reader.ascii(z);
      const cutStart = reader.x;
      let x = 0,
        y = 0;
      if (word & 0b1_0000_00000000_00000000_00000000) {
        if (word & 0b10000000_00000000) {
          x = ((0b1111_11111111 & (word >>> 16)) << 15) | (word & 0b1111111_11111111);
          reader.skip(x);
          y = reader.u16();
        } else {
          x = ((0b1111_11111111 & (word >>> 16)) << 7) | ((word >>> 8) & 0x7f);
          reader.skip(x);
          y = ((word & 0xff) << 8) | reader.u8();
        }
      } else {
        x = (word >>> 16) & 0b1111_11111111;
        y = word & 0xffff;
        reader.skip(x);
      }
      const cut = new Uint8ArrayCut(reader.uint8, cutStart, x);
      const value = new RpcValue(cut, undefined);
      switch (type) {
        case BinaryMessageType.RequestData:
          return new RequestDataMessage(y, name, value);
        case BinaryMessageType.RequestComplete:
          return new RequestCompleteMessage(y, name, value);
        case BinaryMessageType.RequestError:
          return new RequestErrorMessage(y, name, value);
      }
      break;
    }
    case BinaryMessageType.ResponseData:
    case BinaryMessageType.ResponseComplete:
    case BinaryMessageType.ResponseError: {
      const cutStart = reader.x;
      let x = 0,
        y = 0;
      if (word & 0b1_0000_00000000_00000000_00000000) {
        if (word & 0b10000000_00000000) {
          x = ((0b1111_11111111 & (word >>> 16)) << 15) | (word & 0b1111111_11111111);
          reader.skip(x);
          y = reader.u16();
        } else {
          x = ((0b1111_11111111 & (word >>> 16)) << 7) | ((word >>> 8) & 0x7f);
          reader.skip(x);
          y = ((word & 0xff) << 8) | reader.u8();
        }
      } else {
        x = (word >>> 16) & 0b1111_11111111;
        y = word & 0xffff;
        reader.skip(x);
      }
      const cut = new Uint8ArrayCut(reader.uint8, cutStart, x);
      const value = new RpcValue(cut, undefined);
      switch (type) {
        case BinaryMessageType.ResponseData:
          return new ResponseDataMessage(y, value);
        case BinaryMessageType.ResponseComplete:
          return new ResponseCompleteMessage(y, value);
        case BinaryMessageType.ResponseError:
          return new ResponseErrorMessage(y, value);
      }
      break;
    }
    case BinaryMessageType.Control: {
      const isResponse = word & 0b1_00000000_00000000;
      const id = word & 0xffff;
      return isResponse ? new ResponseUnsubscribeMessage(id) : new RequestUnsubscribeMessage(id);
    }
  }
  throw new Error('UNKNOWN_MSG');
};
