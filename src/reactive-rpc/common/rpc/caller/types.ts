import type {Observable, Observer} from 'rxjs';
import type {IStaticRpcMethod, IStreamingRpcMethod, RpcMethod} from '../methods/types';
import type {RpcValue} from '../../messages/Value';

export type RpcApiMap<Ctx = unknown> = {
  [name: string]: IStaticRpcMethod<Ctx, any, any> | IStreamingRpcMethod<Ctx, any, any>;
};

/**
 * Represents an in-flight call.
 */
export interface Call<Req = unknown, Res = unknown> {
  req$: Observer<Req>;
  reqUnsubscribe$: Observable<null>;
  res$: Observable<RpcValue<Res>>;
}
