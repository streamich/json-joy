import {StaticRpcMethod} from '../methods/StaticRpcMethod';
import {StreamingRpcMethod} from '../methods/StreamingRpcMethod';
import {RpcCaller, RpcApiCallerOptions} from './RpcCaller';
import type {IStaticRpcMethod, IStreamingRpcMethod} from '../types';
import type {RpcApiMap} from './types';

export interface ApiRpcCallerOptions<Api extends RpcApiMap<Ctx>, Ctx = unknown>
  extends Omit<RpcApiCallerOptions<Ctx>, 'getMethod'> {
  api: Api;
}

export class ApiRpcCaller<
  Api extends RpcApiMap<Ctx>,
  Ctx = unknown,
  Methods = {
    [K in keyof Api]: Api[K] extends IStaticRpcMethod<infer Ctx, infer Req, infer Res>
      ? StaticRpcMethod<Ctx, Req, Res>
      : Api[K] extends IStreamingRpcMethod<infer Ctx, infer Req, infer Res>
        ? StreamingRpcMethod<Ctx, Req, Res>
        : never;
  },
> extends RpcCaller<Ctx> {
  protected readonly methods = new Map<string, StaticRpcMethod | StreamingRpcMethod>();

  constructor({api, ...rest}: ApiRpcCallerOptions<Api, Ctx>) {
    super({
      ...rest,
      getMethod: (name: string) => this.get(name as any) as StaticRpcMethod | StreamingRpcMethod,
    });
    for (const key in api) {
      const method = api[key];
      this.methods.set(key, <any>(method.isStreaming ? new StreamingRpcMethod(method) : new StaticRpcMethod(method)));
    }
  }

  protected get<K extends keyof Methods>(name: K): Methods[K] | undefined {
    return <Methods[K] | undefined>this.methods.get(<string>name);
  }
}
