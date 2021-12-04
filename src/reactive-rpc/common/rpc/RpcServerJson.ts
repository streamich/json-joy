import {RpcServer} from './RpcServer';
import type {Call} from './RpcApiCaller';
import {ResponseErrorMessage} from '../messages/nominal';
import {JSON, json_string} from '../../../json-brand';

export class RpcServerJson<Ctx = unknown> extends RpcServer<Ctx> {
  protected resErrorMessage(id: number, data: unknown): ResponseErrorMessage<json_string<unknown>> {
    return new ResponseErrorMessage(id, JSON.stringify(data));
  }

  protected createStaticCall(name: string, request: unknown, ctx: Ctx): Promise<unknown> {
    return this.caller.callJson(name, request, ctx);
  };

  protected createCall(name: string, ctx: Ctx): Call<unknown, unknown> {
    const streamCallback = (method: any, ctx: any, req$: any) => method.callJson$(ctx, req$);
    return this.caller.createCall(
      name,
      ctx,
      (name, req, ctx) => this.caller.callJson(name, req, ctx),
      streamCallback,
    ) as Call<unknown, unknown>;
  }
}
