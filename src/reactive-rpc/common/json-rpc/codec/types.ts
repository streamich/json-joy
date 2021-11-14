import type {JsonRpc2Error, JsonRpc2Id, JsonRpc2IncomingMessage} from "../types";

export interface JsonRpc2Codec {
  decode(data: unknown): JsonRpc2IncomingMessage[];
  encodeError(error: JsonRpc2Error, id: JsonRpc2Id): unknown;
  encodeParseError(): unknown;
  encodeInvalidRequestError(id: JsonRpc2Id): unknown;
  encodeMethodNotFoundError(id: JsonRpc2Id): unknown;
  encodeInvalidParamsError(id: JsonRpc2Id): unknown;
  encodeInternalError(id: JsonRpc2Id): unknown;
  encodeResponse(id: JsonRpc2Id, result: unknown): unknown;
  encodeBatch(messages: unknown[]): unknown;
}
