import type {IRpcApiCaller, RpcMethod} from "../rpc";
import type {JsonRpc2Encoder} from "./codec/types";
import type {JsonRpc2Error, JsonRpc2ErrorMessage, JsonRpc2RequestMessage, JsonRpc2NotificationMessage, JsonRpc2ResponseMessage} from "./types";

const isArray = Array.isArray;

export interface JsonRpc2ServerParams<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown> {
  strict?: boolean;
  caller: IRpcApiCaller<Api, Ctx>;
  onNotification: (name: string, data: unknown, ctx: Ctx) => void;
  encoder: JsonRpc2Encoder;
}

export class JsonRpc2Server<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown> {
  private readonly caller: IRpcApiCaller<Api, Ctx>;
  private readonly strict: boolean;
  private readonly onNotification: (name: string, data: unknown, ctx: Ctx) => void;
  encoder: JsonRpc2Encoder;

  constructor(params: JsonRpc2ServerParams<Api, Ctx>) {
    this.caller = params.caller;
    this.strict = !!params.strict;
    this.onNotification = params.onNotification;
    this.encoder = params.encoder;
  }

  private formatError(error: JsonRpc2Error, id: null | string | number = null, pretty: boolean): unknown {
    return this.encoder.encodeError(this.strict, error, id, pretty);
  }

  public async onMessage(
    ctx: Ctx,
    message: JsonRpc2RequestMessage | JsonRpc2NotificationMessage,
  ): Promise<void | unknown> {
    let id: null | string | number = null;
    let pretty = false;
    try {
      if (!message || typeof message !== 'object' || isArray(message))
        return this.formatError({message: 'Invalid Request', code: -32600}, id, pretty);
      const isNotification =
        typeof (message as JsonRpc2RequestMessage).id !== 'number' && typeof (message as JsonRpc2RequestMessage).id !== 'string';
      if (!isNotification) id = (message as JsonRpc2RequestMessage).id;
      if (message.method === undefined) return this.formatError({message: 'Method not found', code: -32601}, id, pretty);
      const method = (message as JsonRpc2RequestMessage).method;
      if (typeof method !== 'string') return this.formatError({message: 'Invalid method.', code: 0}, id, pretty);
      if (this.strict && message.jsonrpc !== '2.0')
        return this.formatError({message: 'Invalid Request', code: -32600}, id, pretty);
      if (!this.caller.exists(method))
        return this.formatError({message: 'Method not found', code: -32601}, id, pretty);
      pretty = !!this.caller.get(method)!.pretty;
      if (isNotification) return this.onNotification(method, message.params, ctx);
      const result = await this.caller.call(method, message.params as any, ctx);
      if (result === undefined) return undefined;
      return this.encoder.encodeResponse(this.strict, id, result, pretty);
    } catch (error: any) {
      const rpcError: JsonRpc2Error = {
        code: !!error && typeof error === 'object' && typeof error.code === 'number' ? error.code : 0,
        message:
          error instanceof Error
            ? error.message
            : !!error && typeof error === 'object'
            ? String(error.message)
            : String(error),
      };
      if (!!error && typeof error === 'object' && error.data !== undefined) rpcError.data = error.data;
      return this.formatError(rpcError, id, pretty);
    }
  }
}
