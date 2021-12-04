import {RpcServer} from './RpcServer';
import type {Call} from './RpcApiCaller';
import {json_string, JSON} from '../../../json-brand';
import {JsonNotificationMessage} from '../messages/json/JsonNotificationMessage';
import {JsonRequestUnsubscribeMessage} from '../messages/json/JsonRequestUnsubscribeMessage';
import {JsonResponseCompleteMessage} from '../messages/json/JsonResponseCompleteMessage';
import {JsonResponseDataMessage} from '../messages/json/JsonResponseDataMessage';
import {JsonResponseErrorMessage} from '../messages/json/JsonResponseErrorMessage';

const stringify = JSON.stringify;

export class RpcServerJson<Ctx = unknown> extends RpcServer<Ctx> {
  protected notifMessage(method: string, data: unknown): JsonNotificationMessage {
    return new JsonNotificationMessage(method, stringify(data));
  }

  protected resCompleteMessage(id: number, data: unknown): JsonResponseCompleteMessage {
    return new JsonResponseCompleteMessage(id, data as json_string<unknown>);
  }

  protected resDataMessage(id: number, data: unknown): JsonResponseDataMessage {
    return new JsonResponseDataMessage(id, data as json_string<unknown>);
  }

  protected resErrorMessage(id: number, data: unknown): JsonResponseErrorMessage {
    return new JsonResponseErrorMessage(id, stringify(data));
  }

  protected reqUnsubscribeMessage(id: number): JsonRequestUnsubscribeMessage {
    return new JsonRequestUnsubscribeMessage(id);
  }

  protected createStaticCall(name: string, request: unknown, ctx: Ctx): Promise<unknown> {
    return this.caller.callJson(name, request, ctx);
  }

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
