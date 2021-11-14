import {RpcApiCaller} from '../../../../common/rpc/RpcApiCaller';
import {EnableReactiveRpcApiParams} from '../../types';
import {UwsHttpBaseContext} from '../types';

export interface EnableHttpPostRcpApiParams<Ctx extends UwsHttpBaseContext> extends EnableReactiveRpcApiParams<Ctx> {
  caller: RpcApiCaller<any, Ctx, unknown>;
  onNotification?: (name: string, data: unknown, ctx: Ctx) => void;
}
