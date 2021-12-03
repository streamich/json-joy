import type {RpcMethodStatic, RpcMethodStreaming} from "./types";
import type {MsgPack} from "../../../json-pack";
import type {JsonTypeSystem} from "../../../json-type-system/JsonTypeSystem";
import {JSON, json_string} from "../../../json-brand";
import {decode, encodeFull} from "../../../json-pack/util";
import {Observable, of, firstValueFrom, from} from "rxjs";
import {map} from "rxjs/operators";

export class RpcMethodStaticWrap<Context = unknown, Request = unknown, Response = unknown> implements RpcMethodStatic<Context, Request, Response> {
  public readonly isStreaming = false;
  public readonly req: string;
  public readonly res: string;
  public readonly validate?: (request: Request) => void;
  public readonly onPreCall?: (ctx: Context, request: Request) => Promise<void>;
  public readonly pretty: boolean;
  public readonly call: (ctx: Context, request: Request) => Promise<Response>;
  public readonly callJson: (ctx: Context, request: Request) => Promise<json_string<Response>>;
  public readonly callMsgPack: (ctx: Context, request: Request) => Promise<MsgPack<Response>>;
  public readonly call$: (ctx: Context, request$: Observable<Request>) => Observable<Response>;
  public readonly callJson$: (ctx: Context, request$: Observable<Request>) => Observable<json_string<Response>>;
  public readonly callMsgPack$: (ctx: Context, request$: Observable<Request>) => Observable<MsgPack<Response>>;

  constructor (method: RpcMethodStatic<Context, Request, Response>, types?: JsonTypeSystem<{}>) {
    this.req = method.req || '';
    this.res = method.res || '';
    this.validate = method.validate ? method.validate.bind(method) : undefined;
    this.onPreCall = method.onPreCall ? method.onPreCall.bind(method) : undefined;
    this.pretty = !!method.pretty;

    const call = method.call ? method.call.bind(method) : undefined;
    const callJson = method.callJson ? method.callJson.bind(method) : undefined;
    const callMsgPack = method.callMsgPack ? method.callMsgPack.bind(method) : undefined;

    if (call) this.call = call;
    else if (callJson) {
      this.call = async (ctx, request) => JSON.parse(await callJson(ctx, request));
    } else if (callMsgPack) {
      this.call = async (ctx, request) => decode(await callMsgPack(ctx, request)) as Response;
    } else throw new Error("No call method defined.");

    if (callJson) {
      this.callJson = callJson;
    } else {
      const serializer = (this.res && types && types.hasType(this.res)) ? types.getJsonSerializer(this.res) : JSON.stringify;
      this.callJson = async (ctx, request) => serializer(await this.call(ctx, request));
    }

    if (callMsgPack) {
      this.callMsgPack = callMsgPack;
    } else {
      const serializer = (this.res && types && types.hasType(this.res)) ? types.getMsgPackEncoder(this.res) : encodeFull;
      this.callMsgPack = async (ctx, request) => serializer(await this.call(ctx, request)) as MsgPack<Response>;
    }

    this.call$ = (ctx, request$) => from((async () => {
      const request = await firstValueFrom(request$);
      return await this.call(ctx, request);
    })());

    this.callJson$ = (ctx, request$) => from((async () => {
      const request = await firstValueFrom(request$);
      return await this.callJson(ctx, request);
    })());

    this.callMsgPack$ = (ctx, request$) => from((async () => {
      const request = await firstValueFrom(request$);
      return await this.callMsgPack(ctx, request);
    })());
  }
}

export class RpcMethodStreamingWrap<Context = unknown, Request = unknown, Response = unknown> implements RpcMethodStreaming<Context, Request, Response> {
  public readonly isStreaming = true;
  public readonly req: string;
  public readonly res: string;
  public readonly validate?: (request: Request) => void;
  public readonly onPreCall?: (ctx: Context, request: Request) => Promise<void>;
  public readonly pretty: boolean;
  public readonly preCallBufferSize?: number;
  public readonly timeout?: number;
  public readonly call: (ctx: Context, request: Request) => Promise<Response>;
  public readonly callJson: (ctx: Context, request: Request) => Promise<json_string<Response>>;
  public readonly callMsgPack: (ctx: Context, request: Request) => Promise<MsgPack<Response>>;
  public readonly call$: (ctx: Context, request$: Observable<Request>) => Observable<Response>;
  public readonly callJson$: (ctx: Context, request$: Observable<Request>) => Observable<json_string<Response>>;
  public readonly callMsgPack$: (ctx: Context, request$: Observable<Request>) => Observable<MsgPack<Response>>;

  constructor (method: RpcMethodStreaming<Context, Request, Response>, types?: JsonTypeSystem<{}>) {
    this.req = method.req || '';
    this.res = method.res || '';
    this.validate = method.validate ? method.validate.bind(method) : undefined;
    this.onPreCall = method.onPreCall ? method.onPreCall.bind(method) : undefined;
    this.preCallBufferSize = method.preCallBufferSize;
    this.timeout = method.timeout;
    this.pretty = !!method.pretty;

    const call$ = method.call$ ? method.call$.bind(method) : undefined;
    const callJson$ = method.callJson$ ? method.callJson$.bind(method) : undefined;
    const callMsgPack$ = method.callMsgPack$ ? method.callMsgPack$.bind(method) : undefined;

    if (call$) this.call$ = call$;
    else if (callJson$) {
      this.call$ = (ctx, request) => callJson$(ctx, request).pipe(map(json => JSON.parse(json)));
    } else if (callMsgPack$) {
      this.call$ = (ctx, request) => callMsgPack$(ctx, request).pipe(map(blob => decode(blob) as Response));
    } else throw new Error("No call method defined.");

    if (callJson$) {
      this.callJson$ = callJson$;
    } else {
      const serializer = (this.res && types && types.hasType(this.res)) ? types.getJsonSerializer(this.res) : JSON.stringify;
      this.callJson$ = (ctx, request) => this.call$(ctx, request).pipe(map(res => serializer(res)));
    }

    if (callMsgPack$) {
      this.callMsgPack$ = callMsgPack$;
    } else {
      const serializer = (this.res && types && types.hasType(this.res)) ? types.getMsgPackEncoder(this.res) : encodeFull;
      this.callMsgPack$ = (ctx, request) => this.call$(ctx, request).pipe(map(res => serializer(res)));
    }

    this.call = (ctx, request) => firstValueFrom(this.call$(ctx, of(request)));
    this.callJson = (ctx, request) => firstValueFrom(this.callJson$(ctx, of(request)));
    this.callMsgPack = (ctx, request) => firstValueFrom(this.callMsgPack$(ctx, of(request)));
  }
}

export const wrapMethod = <Context = unknown, Request = unknown, Response = unknown> (method: RpcMethodStatic<Context, Request, Response> | RpcMethodStreaming<Context, Request, Response>, types?: JsonTypeSystem<any>): RpcMethodStaticWrap<Context, Request, Response> | RpcMethodStreamingWrap<Context, Request, Response> => {
  return method.isStreaming
    ? new RpcMethodStreamingWrap(method as RpcMethodStreaming<Context, Request, Response>, types)
    : new RpcMethodStaticWrap(method as RpcMethodStatic<Context, Request, Response>, types);
};
