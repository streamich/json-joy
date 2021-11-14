import type {JsonRpc2Error, JsonRpc2ErrorMessage, JsonRpc2ResponseMessage} from "../../types";
import type {JsonRpc2Encoder} from "../types";

export class JsonRpc2EncoderJson implements JsonRpc2Encoder {
  public encodeError(strict: boolean, error: JsonRpc2Error, id: null | string | number): JsonRpc2ErrorMessage {
    const message: JsonRpc2ErrorMessage = {
      id,
      error,
    };
    if (strict) message.jsonrpc = '2.0';
    return message;
  }

  encodeResponse(strict: boolean, id: null | string | number, result: unknown, pretty: boolean): JsonRpc2ResponseMessage {
    const responseMessage: JsonRpc2ResponseMessage = {
      id,
      result,
    };
    if (strict) responseMessage.jsonrpc = '2.0';
    return responseMessage;
  }
}
