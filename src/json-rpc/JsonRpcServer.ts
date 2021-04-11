import {JsonRpcRxServer, JsonRpcRxServerParams} from '../json-rx/JsonRpcRxServer';
import {isArray} from '../json-rx/util';

export interface RpcMessageRequest {
  jsonrpc?: '2.0';
  id: number | string | null;
  method: string;
  params: unknown;
}

export interface RpcMessageResponse {
  jsonrpc?: '2.0';
  id: number | string | null;
  result: unknown;
}

export interface RpcMessageError {
  jsonrpc?: '2.0';
  id: number | string | null;
  error: RpcError;
}

export interface RpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface RpcMessageNotification {
  jsonrpc?: '2.0';
  method: string;
  params: unknown;
}

export interface JsonRpcServerParams<Context> extends JsonRpcRxServerParams<Context> {
  strict?: boolean;
}

export class JsonRpcServer<Context = unknown> {
  private readonly rx: JsonRpcRxServer<Context>;
  private readonly strict: boolean;

  constructor(params: JsonRpcServerParams<Context>) {
    this.rx = new JsonRpcRxServer<Context>(params);
    this.strict = params.strict || false;
  }

  private formatError(error: RpcError, id: null | string | number = null): RpcMessageError {
    const message: RpcMessageError = {
      id,
      error,
    };
    if (this.strict) message.jsonrpc = '2.0';
    return message;
  }

  public async onMessage(
    ctx: Context,
    message: RpcMessageRequest | RpcMessageNotification,
  ): Promise<null | RpcMessageResponse | RpcMessageError> {
    let id: null | string | number = null;
    try {
      if (!message || typeof message !== 'object' || isArray(message))
        return this.formatError({message: 'Invalid message.', code: 0}, id);

      const isNotification =
        typeof (message as RpcMessageRequest).id !== 'number' && typeof (message as RpcMessageRequest).id !== 'string';
      if (!isNotification) id = (message as RpcMessageRequest).id;

      if (message.method === undefined) return this.formatError({message: 'Method not specified.', code: 0}, id);
      if (typeof message.method !== 'string') return this.formatError({message: 'Invalid method.', code: 0}, id);
      if (this.strict && message.jsonrpc !== '2.0')
        return this.formatError({message: 'Only JSON-RPC version 2.0 is supported.', code: 0}, id);
      if (isNotification) {
        this.rx.onMessage(ctx, [message.method, message.params]);
        return null;
      }
      const result = await this.rx.onMessage(ctx, [1, message.method, message.params]);
      if (!result) return null;
      const [type] = result;
      if (type === -1) throw result[2];
      const responseMessage: RpcMessageResponse = {
        id,
        result: result[2],
      };
      if (this.strict) responseMessage.jsonrpc = '2.0';
      return responseMessage;
    } catch (error) {
      const rpcError: RpcError = {
        code: !!error && typeof error === 'object' && typeof error.code === 'number' ? error.code : 0,
        message:
          error instanceof Error
            ? error.message
            : !!error && typeof error === 'object'
            ? String(error.message)
            : String(error),
      };
      if (!!error && typeof error === 'object' && error.data !== undefined) rpcError.data = error.data;
      return this.formatError(rpcError, id);
    }
  }
}
