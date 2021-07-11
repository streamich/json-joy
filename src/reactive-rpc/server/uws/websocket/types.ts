import type {
  TemplatedApp as UwsTemplatedApp,
  HttpRequest as UwsHttpRequest,
  HttpResponse as UwsHttpResponse,
  WebSocket as UwsWebSocket
} from 'uWebSockets.js';
import type {RpcServer, RpcServerParams} from '../../../common/rpc/RpcServer';

export type {
  UwsTemplatedApp,
  UwsHttpRequest,
  UwsHttpResponse,
  UwsWebSocket,
};

export interface RpcWebSocket<Ctx = unknown> extends UwsWebSocket {
  ctx: Ctx;
  rpc: RpcServer<Ctx>;
}

export interface EnableWsReactiveRpcApiParams<Ctx> {
  uws: UwsTemplatedApp;
  createContext: (req: UwsHttpRequest, res: UwsHttpResponse) => Ctx;
  createRpcServer: (params: Pick<RpcServerParams<Ctx>, 'send'>) => RpcServer<Ctx>;
  onNotification?: (ws: RpcWebSocket<Ctx>, name: string, data: unknown | undefined, ctx: Ctx) => void;
  route?: string;
  idleTimeout?: number;
  compression?: number;
  maxPayloadLength?: number;
  maxBackpressure?: number;
}
