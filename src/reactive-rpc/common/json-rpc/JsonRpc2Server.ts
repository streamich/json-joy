import type {IRpcApiCaller, RpcMethod} from "../rpc";
import type {JsonRpc2Codec} from "./codec/types";
import type {JsonRpc2Error, JsonRpc2RequestMessage, JsonRpc2NotificationMessage} from "./types";

const isArray = Array.isArray;

export interface JsonRpc2ServerParams<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown> {
  strict?: boolean;
  caller: IRpcApiCaller<Api, Ctx>;
  onNotification: (name: string, data: unknown, ctx: Ctx) => void;
  codec: JsonRpc2Codec;
}

export class JsonRpc2Server<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown> {
  private readonly caller: IRpcApiCaller<Api, Ctx>;
  private readonly strict: boolean;
  private readonly onNotification: (name: string, data: unknown, ctx: Ctx) => void;
  private readonly codec: JsonRpc2Codec;

  constructor(params: JsonRpc2ServerParams<Api, Ctx>) {
    this.caller = params.caller;
    this.strict = !!params.strict;
    this.onNotification = params.onNotification;
    this.codec = params.codec;
  }

  public async onMessage(
    ctx: Ctx,
    message: JsonRpc2RequestMessage | JsonRpc2NotificationMessage,
  ): Promise<void | unknown> {
    let id: null | string | number = null;
    try {
      if (!message || typeof message !== 'object' || isArray(message)) return this.codec.encodeInvalidRequestError(id);
      const isNotification =
        typeof (message as JsonRpc2RequestMessage).id !== 'number' && typeof (message as JsonRpc2RequestMessage).id !== 'string';
      if (!isNotification) id = (message as JsonRpc2RequestMessage).id;
      if (message.method === undefined) return this.codec.encodeMethodNotFoundError(id);
      const method = (message as JsonRpc2RequestMessage).method;
      if (typeof method !== 'string') return this.codec.encodeMethodNotFoundError(id);
      if (this.strict && message.jsonrpc !== '2.0') return this.codec.encodeInvalidRequestError(id);
      if (isNotification) return this.onNotification(method, message.params, ctx);
      if (!this.caller.exists(method)) return this.codec.encodeMethodNotFoundError(id);
      const result = await this.caller.call(method, message.params as any, ctx);
      if (result === undefined) return undefined;
      return this.codec.encodeResponse(id, result);
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
      return this.codec.encodeError(rpcError, id);
    }
  }

  public async onMessages(ctx: Ctx, data: unknown): Promise<unknown> {
    try {
      const messages = this.codec.decode(data);
      const results = await Promise.all(messages.map(async message => this.onMessage(ctx, message)));
      const resultsFiltered = results.filter(res => res !== undefined);
      if (resultsFiltered.length < 2) return resultsFiltered[0];
      return this.codec.encodeBatch(resultsFiltered);
    } catch (error) {
      return this.codec.encodeParseError();
    }
  }
}
