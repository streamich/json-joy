import type {
  TemplatedApp as UwsTemplatedApp,
  HttpRequest as UwsHttpRequest,
  HttpResponse as UwsHttpResponse,
  WebSocket as UwsWebSocket,
} from 'uWebSockets.js';

export type {UwsTemplatedApp, UwsHttpRequest, UwsHttpResponse, UwsWebSocket};

export interface EnableReactiveRpcApiParams<Ctx> {
  uws: UwsTemplatedApp;
  createContext?: (req: UwsHttpRequest, res: UwsHttpResponse) => Ctx;
  route?: string;
}
