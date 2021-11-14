import {json_string, JSON} from "ts-brand-json";
import type {JsonRpc2Error, JsonRpc2ErrorMessage, JsonRpc2ResponseMessage} from "../../types";
import type {JsonRpc2Encoder} from "../types";

export class JsonRpc2EncoderJsonString implements JsonRpc2Encoder {
  public encodeError(strict: boolean, error: JsonRpc2Error, id: null | string | number, pretty: boolean): json_string<JsonRpc2ErrorMessage> {
    if (pretty) {
      const message: JsonRpc2ErrorMessage = {
        id,
        error,
      };
      if (strict) message.jsonrpc = '2.0';
      return JSON.stringify(message, null, 4) as json_string<JsonRpc2ErrorMessage>;
    }
    return '{' + (strict ? '"jsonrpc":"2.0"' : '') + '"id":' + JSON.stringify(id) + ',"error":' + JSON.stringify(error) + '}' as json_string<JsonRpc2ErrorMessage>;
  }

  encodeResponse(strict: boolean, id: null | string | number, result: unknown, pretty: boolean): json_string<JsonRpc2ResponseMessage> {
    if (pretty) {
      const message: JsonRpc2ResponseMessage = {
        id,
        result,
      };
      if (strict) message.jsonrpc = '2.0';
      return JSON.stringify(message, null, 4) as json_string<JsonRpc2ResponseMessage>;
    }
    return '{' + (strict ? '"jsonrpc":"2.0"' : '') + '"id":' + JSON.stringify(id) + ',"result":' + JSON.stringify(result) + '}' as json_string<JsonRpc2ResponseMessage>;
  }
}
