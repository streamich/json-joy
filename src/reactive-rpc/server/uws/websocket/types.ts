import type {RpcServer, RpcServerParams} from '../../../common/rpc/RpcServer';
import type {
  EnableReactiveRpcApiParams,
  UwsHttpRequest,
  UwsHttpResponse,
  UwsTemplatedApp,
  UwsWebSocket,
} from '../types';

export type {UwsTemplatedApp, UwsHttpRequest, UwsHttpResponse, UwsWebSocket};

export interface RpcWebSocket<Ctx = unknown> extends UwsWebSocket {
  ctx: Ctx;
  rpc: RpcServer<Ctx>;
}

export interface EnableWsReactiveRpcApiParams<Ctx> extends EnableReactiveRpcApiParams<Ctx> {
  createRpcServer: (params: Pick<RpcServerParams<Ctx>, 'send'>) => RpcServer<Ctx>;
  onNotification?: (ws: RpcWebSocket<Ctx>, name: string, data: unknown | undefined, ctx: Ctx) => void;
  idleTimeout?: number;
  compression?: number;
  maxPayloadLength?: number;
  maxBackpressure?: number;
}
