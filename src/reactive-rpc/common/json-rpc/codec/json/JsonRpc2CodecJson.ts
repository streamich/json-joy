import type {JsonRpc2Error, JsonRpc2ErrorMessage, JsonRpc2Id, JsonRpc2IncomingMessage, JsonRpc2ResponseMessage} from "../../types";
import type {JsonRpc2Codec} from "../types";

export class JsonRpc2CodecJson implements JsonRpc2Codec {
  public decode(data: JsonRpc2IncomingMessage | JsonRpc2IncomingMessage[]): JsonRpc2IncomingMessage[] {
    return Array.isArray(data) ? data : [data];
  }

  public encodeError(error: JsonRpc2Error, id: JsonRpc2Id): JsonRpc2ErrorMessage {
    const message: JsonRpc2ErrorMessage = {
      jsonrpc: '2.0',
      id,
      error,
    };
    return message;
  }

  public encodeParseError(): JsonRpc2ErrorMessage {
    return this.encodeError({
      code: -32700,
      message: 'Parse error',
    }, null);
  }

  public encodeInvalidRequestError(id: JsonRpc2Id): JsonRpc2ErrorMessage {
    return this.encodeError({
      code: -32600,
      message: 'Invalid Request',
    }, id);
  }

  public encodeMethodNotFoundError(id: JsonRpc2Id): JsonRpc2ErrorMessage {
    return this.encodeError({
      code: -32601,
      message: 'Method not found',
    }, id);
  }

  public encodeInvalidParamsError(id: JsonRpc2Id): JsonRpc2ErrorMessage {
    return this.encodeError({
      code: -32602,
      message: 'Invalid params',
    }, id);
  }

  public encodeInternalError(id: JsonRpc2Id): JsonRpc2ErrorMessage {
    return this.encodeError({
      code: -32603,
      message: 'Internal error',
    }, id);
  }

  public encodeResponse(id: JsonRpc2Id, result: unknown): JsonRpc2ResponseMessage {
    const responseMessage: JsonRpc2ResponseMessage = {
      jsonrpc: '2.0',
      id,
      result,
    };
    return responseMessage;
  }

  public encodeBatch(messages: unknown[]): unknown {
    return messages;
  }
}
