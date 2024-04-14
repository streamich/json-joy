import type {Observable} from 'rxjs';
import type {FunctionStreamingType, FunctionType, ResolveType} from '../../json-type';
import type {ObjectValue, ObjectValueToTypeMap, UnObjectType} from '../../json-type-value/ObjectValue';
import type {TypeRouter} from '../../json-type/system/TypeRouter';
import type {ObjectValueCaller} from './rpc/caller/ObjectValueCaller';
import type {RpcCaller} from './rpc/caller/RpcCaller';
import type {TypeRouterCaller} from './rpc/caller/TypeRouterCaller';

export type CallerToMethods<Caller extends RpcCaller<any>> = {
  [K in keyof UnTypeRouter<UnTypeRouterCaller<Caller>>]: UnwrapFunction<UnTypeRouter<UnTypeRouterCaller<Caller>>[K]>;
};

type UnTypeRouterCaller<T> = T extends TypeRouterCaller<infer R> ? R : T extends ObjectValueCaller<infer R> ? R : never;
type UnTypeRouter<T> =
  T extends TypeRouter<infer R> ? R : T extends ObjectValue<infer R> ? ObjectValueToTypeMap<UnObjectType<R>> : never;
type UnwrapFunction<F> =
  F extends FunctionType<infer Req, infer Res>
    ? (req: ResolveType<Req>) => Promise<ResolveType<Res>>
    : F extends FunctionStreamingType<infer Req, infer Res>
      ? (req$: Observable<ResolveType<Req>>) => Observable<ResolveType<Res>>
      : never;
