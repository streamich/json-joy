import {RpcMessageFormat} from '../constants';
import {RpcError, RpcErrorCodes} from '../../rpc/caller/error';
import * as msg from '../../messages';
import {CompactMessageType} from './constants';
import {CborEncoder} from '../../../../json-pack/cbor/CborEncoder';
import {MsgPackEncoder} from '../../../../json-pack/msgpack';
import {JsonEncoder} from '../../../../json-pack/json/JsonEncoder';
import {AnyValue} from '../../../../json-type-value/AnyValue';
import type {RpcMessageCodec} from '../types';
import type {JsonValueCodec} from '../../../../json-pack/codecs/types';
import type * as types from './types';

const fromJson = (arr: unknown | unknown[] | types.CompactMessage): msg.ReactiveRpcMessage => {
  if (!(arr instanceof Array)) throw RpcError.fromCode(RpcErrorCodes.BAD_REQUEST);
  const type = arr[0];
  switch (type) {
    case CompactMessageType.RequestComplete: {
      const data = arr[3];
      const value = data === undefined ? data : new AnyValue(data);
      return new msg.RequestCompleteMessage(arr[1], arr[2], value);
    }
    case CompactMessageType.RequestData: {
      const data = arr[3];
      const value = data === undefined ? data : new AnyValue(data);
      return new msg.RequestDataMessage(arr[1], arr[2], value);
    }
    case CompactMessageType.RequestError: {
      return new msg.RequestErrorMessage(arr[1], arr[2], new AnyValue(arr[3]));
    }
    case CompactMessageType.RequestUnsubscribe: {
      return new msg.RequestUnsubscribeMessage(arr[1]);
    }
    case CompactMessageType.ResponseComplete: {
      const data = arr[2];
      const value = data === undefined ? data : new AnyValue(data);
      return new msg.ResponseCompleteMessage(arr[1], value);
    }
    case CompactMessageType.ResponseData: {
      return new msg.ResponseDataMessage(arr[1], new AnyValue(arr[2]));
    }
    case CompactMessageType.ResponseError: {
      return new msg.ResponseErrorMessage(arr[1], new AnyValue(arr[2]));
    }
    case CompactMessageType.ResponseUnsubscribe: {
      return new msg.ResponseUnsubscribeMessage(arr[1]);
    }
    case CompactMessageType.Notification: {
      return new msg.NotificationMessage(arr[1], new AnyValue(arr[2]));
    }
  }
  throw RpcError.value(RpcError.validation('Unknown message type'));
};

export class CompactRpcMessageCodec implements RpcMessageCodec {
  id = 'rx.compact';
  format = RpcMessageFormat.Compact;

  public encodeMessage(jsonCodec: JsonValueCodec, message: msg.ReactiveRpcMessage): void {
    message.encodeCompact(jsonCodec);
  }

  public encodeBatch(jsonCodec: JsonValueCodec, batch: msg.ReactiveRpcMessage[]): void {
    const encoder = jsonCodec.encoder;
    if (encoder instanceof CborEncoder || encoder instanceof MsgPackEncoder) {
      const length = batch.length;
      encoder.writeArrHdr(length);
      for (let i = 0; i < length; i++) batch[i].encodeCompact(jsonCodec);
    } else if (encoder instanceof JsonEncoder) {
      const length = batch.length;
      const last = length - 1;
      encoder.writeStartArr();
      for (let i = 0; i < last; i++) {
        batch[i].encodeCompact(jsonCodec);
        encoder.writeArrSeparator();
      }
      if (length > 0) batch[last].encodeCompact(jsonCodec);
      encoder.writeEndArr();
    } else {
      const jsonMessages: types.CompactMessage[] = [];
      const length = batch.length;
      for (let i = 0; i < length; i++) jsonMessages.push(batch[i].toCompact());
      const encoder = jsonCodec.encoder;
      encoder.writeArr(jsonMessages);
    }
  }

  public encode(jsonCodec: JsonValueCodec, batch: msg.ReactiveRpcMessage[]): Uint8Array {
    const encoder = jsonCodec.encoder;
    const writer = encoder.writer;
    writer.reset();
    this.encodeBatch(jsonCodec, batch);
    return writer.flush();
  }

  public decodeBatch(jsonCodec: JsonValueCodec, uint8: Uint8Array): msg.ReactiveRpcMessage[] {
    const decoder = jsonCodec.decoder;
    const value = decoder.read(uint8);
    if (!(value instanceof Array)) throw RpcError.badRequest();
    if (typeof value[0] === 'number') return [fromJson(value as unknown[])];
    const result: msg.ReactiveRpcMessage[] = [];
    const length = value.length;
    for (let i = 0; i < length; i++) {
      const item = value[i];
      result.push(fromJson(item as unknown));
    }
    return result;
  }

  public fromJson(compact: types.CompactMessage): msg.ReactiveRpcMessage {
    return fromJson(compact);
  }
}
