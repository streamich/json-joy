import type {JsonRpc2Error} from "../types";

export interface JsonRpc2Encoder {
  encodeError(strict: boolean, error: JsonRpc2Error, id: null | string | number, pretty: boolean): unknown;
  encodeResponse(strict: boolean, id: null | string | number, result: unknown, pretty: boolean): unknown;
}
