import {RpcMessageFormat} from '../constants';
import {RpcError} from '../../rpc/caller/error';
import {RpcValue} from '../../messages/Value';
import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import {TlvBinaryJsonEncoder} from '@jsonjoy.com/json-pack/lib/types';
import {JsonJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/json';
import * as msg from '../../messages';
import * as schema from './schema';
import type {RpcMessageCodec} from '../types';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';

export class JsonRpc2RpcMessageCodec implements RpcMessageCodec {
  id = 'json2.verbose';
  format = RpcMessageFormat.JsonRpc2;

  public encodeMessage(jsonCodec: JsonValueCodec, message: msg.ReactiveRpcMessage): void {
    if (message instanceof msg.ResponseCompleteMessage || message instanceof msg.ResponseDataMessage) {
      const pojo: schema.JsonRpc2ResponseMessage = {
        id: message.id,
        result: message.value,
      } as schema.JsonRpc2ResponseMessage;
      schema.JsonRpc2Response.encoder(jsonCodec.format)(pojo, jsonCodec.encoder);
    } else if (message instanceof msg.ResponseErrorMessage) {
      const error = message.value.data;
      if (error instanceof RpcError) {
        const pojo: schema.JsonRpc2ErrorMessage = {
          id: message.id,
          error: {
            message: error.message,
            code: error.errno,
            data: error.toJson(),
          },
        } as schema.JsonRpc2ErrorMessage;
        schema.JsonRpc2Error.encoder(jsonCodec.format)(pojo, jsonCodec.encoder);
      } else {
        const pojo: schema.JsonRpc2ErrorMessage = {
          id: message.id,
          error: {
            message: 'Unknown error',
            code: 0,
            data: error,
          },
        } as schema.JsonRpc2ErrorMessage;
        schema.JsonRpc2Error.encoder(jsonCodec.format)(pojo, jsonCodec.encoder);
      }
    } else if (message instanceof msg.NotificationMessage) {
      const pojo: schema.JsonRpc2NotificationMessage = {
        method: message.method,
        params: message.value,
      } as schema.JsonRpc2NotificationMessage;
      // console.log(schema.JsonRpc2Notification.compileJsonEncoder({}) + '');
      schema.JsonRpc2Notification.encoder(jsonCodec.format)(pojo, jsonCodec.encoder);
    } else if (
      message instanceof msg.RequestCompleteMessage ||
      message instanceof msg.RequestDataMessage ||
      message instanceof msg.RequestErrorMessage
    ) {
      const pojo: schema.JsonRpc2RequestMessage = {
        jsonrpc: '2.0',
        id: message.id,
        method: message.method,
        params: message.value,
      };
      schema.JsonRpc2Request.encoder(jsonCodec.format)(pojo, jsonCodec.encoder);
    }
  }

  public encodeBatch(jsonCodec: JsonValueCodec, batch: msg.ReactiveRpcMessage[]): void {
    const length = batch.length;
    if (length === 1) {
      this.encodeMessage(jsonCodec, batch[0]);
    } else {
      switch (jsonCodec.format) {
        case EncodingFormat.Cbor:
        case EncodingFormat.MsgPack: {
          const encoder = jsonCodec.encoder as unknown as TlvBinaryJsonEncoder;
          encoder.writeArrHdr(length);
          for (let i = 0; i < length; i++) {
            this.encodeMessage(jsonCodec, batch[i]);
          }
          break;
        }
        case EncodingFormat.Json: {
          const encoder = (jsonCodec as JsonJsonValueCodec).encoder;
          encoder.writeStartArr();
          const last = length - 1;
          for (let i = 0; i < last; i++) {
            this.encodeMessage(jsonCodec, batch[i]);
            encoder.writeArrSeparator();
          }
          if (length > 0) this.encodeMessage(jsonCodec, batch[last]);
          encoder.writeEndArr();
          break;
        }
      }
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
    try {
      let jsonRpcMessages = jsonCodec.decoder.read(uint8) as unknown as schema.JsonRpc2Message[];
      if (!Array.isArray(jsonRpcMessages)) jsonRpcMessages = [jsonRpcMessages];
      const messages: msg.ReactiveRpcMessage[] = [];
      const length = jsonRpcMessages.length;
      for (let i = 0; i < length; i++) messages.push(this.fromJson(jsonRpcMessages[i]));
      return messages;
    } catch (error) {
      if (error instanceof RpcError) throw error;
      throw RpcError.badRequest();
    }
  }

  public fromJson(message: schema.JsonRpc2Message): msg.ReactiveRpcMessage {
    if (!message || typeof message !== 'object') throw RpcError.badRequest();
    if ((message as any).id === undefined) {
      const notification = message as schema.JsonRpc2NotificationMessage;
      const data = notification.params;
      const value = new RpcValue(data, undefined);
      return new msg.NotificationMessage(notification.method, value);
    }
    if (typeof (message as schema.JsonRpc2RequestMessage).method === 'string') {
      const request = message as schema.JsonRpc2RequestMessage;
      const data = request.params;
      const value = data === undefined ? undefined : new RpcValue(request.params, undefined);
      if (typeof request.id !== 'number') throw RpcError.badRequest();
      return new msg.RequestCompleteMessage(request.id, request.method, value);
    }
    if ((message as schema.JsonRpc2ResponseMessage).result !== undefined) {
      const response = message as schema.JsonRpc2ResponseMessage;
      if (typeof response.id !== 'number') throw RpcError.badRequest();
      const data = response.result;
      const value = data === undefined ? undefined : new RpcValue(response.result, undefined);
      return new msg.ResponseCompleteMessage(response.id, value);
    }
    if ((message as schema.JsonRpc2ErrorMessage).error !== undefined) {
      const response = message as schema.JsonRpc2ErrorMessage;
      const value = new RpcValue(response.error.data, undefined);
      if (typeof response.id !== 'number') throw RpcError.badRequest();
      return new msg.ResponseErrorMessage(response.id, value);
    }
    throw RpcError.badRequest();
  }
}
