import type {TemplatedApp, HttpRequest, HttpResponse, WebSocket} from 'uWebSockets.js';
import type {RpcMethod} from '../../common/rpc/types';
import {Encoder, Decoder} from '../../common/codec/binary-msgpack';
import {RpcServer} from '../../common/rpc/RpcServer';
import {ReactiveRpcRequestMessage, ReactiveRpcResponseMessage} from '../../common';

export interface CreateWsBinaryReactiveRpcApiParams<Ctx> {
  uws: TemplatedApp;
  onCall: (name: string) => RpcMethod<Ctx> | undefined;
  createContext: (req: HttpRequest, res: HttpResponse) => Ctx;
  onNotification?: (ws: RpcWebSocket<Ctx>, name: string, data: unknown | undefined) => void;
  route?: string;
  idleTimeout?: number;
  compression?: number;
  maxPayloadLength?: number;
  maxBackpressure?: number;
  maxActiveCalls?: number;
}

export interface RpcWebSocket<Ctx = unknown> extends WebSocket {
  ctx: Ctx;
  rpc: RpcServer<Ctx>;
}

export const enableWsBinaryReactiveRpcApi = <Ctx>(params: CreateWsBinaryReactiveRpcApiParams<Ctx>) => {
  const encoder = new Encoder();
  const decoder = new Decoder();
  const {
    uws,
    onCall,
    onNotification,
    route = '/binary-rx',
    idleTimeout = 0,
    compression,
    maxPayloadLength = 1024 * 1024,
    maxBackpressure = 3 * 1024 * 1024,
    createContext,
    maxActiveCalls = 50,
  } = params;
  uws.ws(route, {
    idleTimeout,
    compression,
    maxBackpressure, // Used only for MQTT.
    maxPayloadLength,
    upgrade: (res, req, context) => {
      const secWebSocketKey = req.getHeader('sec-websocket-key');
      const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
      const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');
      const ctx = createContext(req, res);
      /* This immediately calls open handler, you must not use res after this call */
      res.upgrade({ctx}, secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions, context);
    },
    open: (ws: WebSocket) => {
      const rpc = new RpcServer<Ctx>({
        maxActiveCalls,
        formatError: () => {},
        onCall,
        onNotification: onNotification ? (name: string, data: unknown | undefined, ctx: Ctx) => {
          if (data instanceof Uint8Array) data = decoder.decode(data, data.byteOffset, data.byteLength);
          onNotification(ws as RpcWebSocket<Ctx>, name, data);
        } : () => {},
        send: (messages: ReactiveRpcResponseMessage[]) => {
          if (ws.getBufferedAmount() > maxBackpressure) return;
          const uint8 = encoder.encode(messages);
          ws.send(uint8, true);
        },
      });
      ws.rpc = rpc;
    },
    message: (ws: WebSocket, buf: ArrayBuffer, isBinary: boolean) => {
      const {ctx, rpc} = ws as RpcWebSocket<Ctx>;
      const messages = decoder.decode(new Uint8Array(buf), 0, buf.byteLength);
      const length = messages.length;
      for (let i = 0; i < length; i++) {
        const message = messages[i] as ReactiveRpcRequestMessage;
        rpc.onMessage(message, ctx);
      }
    },
    close: (ws: WebSocket, code: number, message: ArrayBuffer) => {
      (ws as RpcWebSocket<Ctx>).rpc.stop();
    },
  });
};
