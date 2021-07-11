import type {ReactiveRpcRequestMessage, ReactiveRpcResponseMessage} from '../../../common';
import type {EnableWsReactiveRpcApiParams, RpcWebSocket, UwsWebSocket} from './types';
import {Encoder, Decoder} from '../../../common/codec/binary-msgpack';
import {DEFAULTS} from './constants';

export interface EnableWsBinaryReactiveRpcApiParams<Ctx> extends EnableWsReactiveRpcApiParams<Ctx> {
}

export const enableWsBinaryReactiveRpcApi = <Ctx>(params: EnableWsBinaryReactiveRpcApiParams<Ctx>) => {
  const encoder = new Encoder();
  const decoder = new Decoder();
  const {
    route = '/rpc/binary',
    uws,
    createRpcServer,
    onNotification,
    createContext,
    compression,
    idleTimeout = DEFAULTS.IDLE_TIMEOUT,
    maxBackpressure = DEFAULTS.MAX_BACKPRESSURE,
    maxPayloadLength = DEFAULTS.MAX_PAYLOAD_LENGTH,
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
    open: (ws: UwsWebSocket) => {
      const rpc = createRpcServer({
        send: (messages: ReactiveRpcResponseMessage[]) => {
          if (ws.getBufferedAmount() > maxBackpressure) return;
          const uint8 = encoder.encode(messages);
          ws.send(uint8, true);
        },
      });
      if (onNotification) {
        rpc.onNotification = (name: string, data: unknown | undefined, ctx: Ctx) => {
          onNotification(ws as RpcWebSocket<Ctx>, name, data, ctx);
        };
      }
      ws.rpc = rpc;
    },
    message: (ws: UwsWebSocket, buf: ArrayBuffer, isBinary: boolean) => {
      const {ctx, rpc} = ws as RpcWebSocket<Ctx>;
      const uint8 = new Uint8Array(buf);
      const messages = decoder.decode(uint8);
      const length = messages.length;
      for (let i = 0; i < length; i++) {
        const message = messages[i] as ReactiveRpcRequestMessage;
        rpc.onMessage(message, ctx);
      }
    },
    close: (ws: UwsWebSocket, code: number, message: ArrayBuffer) => {
      (ws as RpcWebSocket<Ctx>).rpc.stop();
    },
  });
};
