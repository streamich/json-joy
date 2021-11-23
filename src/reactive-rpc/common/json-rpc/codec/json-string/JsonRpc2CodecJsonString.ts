import {asString} from 'json-schema-serializer';
import {json_string, JSON} from '../../../../../json-brand';
import type {
  JsonRpc2Error,
  JsonRpc2ErrorMessage,
  JsonRpc2Id,
  JsonRpc2IncomingMessage,
  JsonRpc2ResponseMessage,
} from '../../types';
import type {JsonRpc2Codec} from '../types';

const KEY_ID = '{"jsonrpc":"2.0","id":';
const KEY_RESULT = ',"result":';
const KEY_ERROR = ',"error":';
const KEY_CODE = '{"code":';
const KEY_MESSAGE = ',"message":';
const KEY_DATA = ',"data":';
const BRACKET1_CLOSE = '}';
const BRACKET1_CLOSE_TWICE = '}}';
const BRACKET2_OPEN = '[';
const BRACKET2_CLOSE = ']';
const ERROR_PARSE = '{"jsonrpc":"2.0","id":null,"error":{"code":-32700,"message":"Parse error"}}';
const ERROR_INVALID_REQUEST = ',"error":{"code":-32600,"message":"Invalid Request"}}';
const ERROR_METHOD_NOT_FOUND = ',"error":{"code":-32601,"message":"Method not found"}}';
const ERROR_INVALID_PARAMS = ',"error":{"code":-32602,"message":"Invalid params"}}';
const ERROR_INTERNAL = ',"error":{"code":-32603,"message":"Internal error"}}';

export class JsonRpc2CodecJsonString implements JsonRpc2Codec {
  public decode(data: json_string<JsonRpc2IncomingMessage | JsonRpc2IncomingMessage[]>): JsonRpc2IncomingMessage[] {
    const messages = JSON.parse(data);
    return Array.isArray(messages) ? messages : [messages];
  }

  public encodeError(error: JsonRpc2Error, id: JsonRpc2Id): json_string<JsonRpc2ErrorMessage> {
    const errorJson =
      KEY_CODE +
      (error.code || 0) +
      KEY_MESSAGE +
      asString(String(error.message)) +
      (error.data !== undefined ? KEY_DATA + JSON.stringify(error.data) : '');
    return (KEY_ID + JSON.stringify(id) + KEY_ERROR + errorJson + BRACKET1_CLOSE_TWICE) as json_string<
      JsonRpc2ErrorMessage
    >;
  }

  public encodeParseError(): json_string<JsonRpc2ErrorMessage> {
    return ERROR_PARSE as json_string<JsonRpc2ErrorMessage>;
  }

  public encodeInvalidRequestError(id: JsonRpc2Id): unknown {
    return (KEY_ID + JSON.stringify(id) + ERROR_INVALID_REQUEST) as json_string<JsonRpc2ErrorMessage>;
  }

  public encodeMethodNotFoundError(id: JsonRpc2Id): unknown {
    return (KEY_ID + JSON.stringify(id) + ERROR_METHOD_NOT_FOUND) as json_string<JsonRpc2ErrorMessage>;
  }

  public encodeInvalidParamsError(id: JsonRpc2Id): unknown {
    return (KEY_ID + JSON.stringify(id) + ERROR_INVALID_PARAMS) as json_string<JsonRpc2ErrorMessage>;
  }

  public encodeInternalError(id: JsonRpc2Id): unknown {
    return (KEY_ID + JSON.stringify(id) + ERROR_INTERNAL) as json_string<JsonRpc2ErrorMessage>;
  }

  public encodeResponse(id: JsonRpc2Id, result: unknown): json_string<JsonRpc2ResponseMessage> {
    return (KEY_ID + JSON.stringify(id) + KEY_RESULT + JSON.stringify(result) + BRACKET1_CLOSE) as json_string<
      JsonRpc2ResponseMessage
    >;
  }

  public encodeBatch(messages: json_string<JsonRpc2ResponseMessage>[]): json_string<JsonRpc2ResponseMessage[]> {
    return (BRACKET2_OPEN + messages.join(',') + BRACKET2_CLOSE) as json_string<JsonRpc2ResponseMessage[]>;
  }
}
