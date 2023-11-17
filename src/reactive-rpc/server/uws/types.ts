import type {RpcMessageStreamProcessor} from '../../common';
import type {ConnectionContext} from '../context';
import * as uws from './types-uws';

export * from './types-uws';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace' | 'connect';
export type HttpMethodPermissive =
  | HttpMethod
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT';

export type RouteHandler<Ctx extends ConnectionContext> = (ctx: Ctx) => void;
export type JsonRouteHandler<Ctx extends ConnectionContext> = (ctx: Ctx) => void;

export interface RpcWebSocket<Ctx extends ConnectionContext = ConnectionContext> extends uws.WebSocket {
  ctx: Ctx;
  rpc?: RpcMessageStreamProcessor<Ctx>;
}

export interface ServerLogger {
  log(msg: unknown): void;
  error(kind: string, error?: Error | unknown | null, meta?: unknown): void;
}
