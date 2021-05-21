import type {TemplatedApp, HttpRequest, HttpResponse, WebSocket} from 'uWebSockets.js';
import type {RpcMethod} from '../../common/rpc/types';
import {Encoder, Decoder} from '../../common/codec/binary-msgpack';
import {Encoder as EncoderJson, Decoder as DecoderJson} from '../../common/codec/compact-json';
import {Encoder as EncoderMsgPack, Decoder as DecoderMsgPack} from '../../common/codec/compact-msgpack';
import {RpcServer} from '../../common/rpc/RpcServer';
import {ReactiveRpcRequestMessage, ReactiveRpcResponseMessage} from '../../common';
import {json_string} from 'ts-brand-json';
import {CompactMessage} from '../../common/codec/compact';

export interface RpcWebSocket<Ctx = unknown> extends WebSocket {
  ctx: Ctx;
  rpc: RpcServer<Ctx>;
}

export interface EnableWsReactiveRpcApiParams<Ctx> {
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

export interface EnableWsBinaryReactiveRpcApiParams<Ctx> extends EnableWsReactiveRpcApiParams<Ctx> {
}

export const enableWsBinaryReactiveRpcApi = <Ctx>(params: EnableWsBinaryReactiveRpcApiParams<Ctx>) => {
  const encoder = new Encoder();
  const decoder = new Decoder();
  const {
    route = '/rpc/binary',
    uws,
    onCall,
    onNotification,
    createContext,
    compression,
    idleTimeout = 0,
    maxActiveCalls = 50,
    maxBackpressure = 3 * 1024 * 1024,
    maxPayloadLength = 1024 * 1024,
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

export interface EnableWsCompactReactiveRpcApiParams<Ctx> extends EnableWsReactiveRpcApiParams<Ctx> {
}

export interface CompactRpcWebSocket<Ctx = unknown> extends RpcWebSocket<Ctx> {
  isBinary: boolean;
}

export const enableWsCompactReactiveRpcApi = <Ctx>(params: EnableWsCompactReactiveRpcApiParams<Ctx>) => {
  const encoderJson = new EncoderJson();
  const decoderJson = new DecoderJson();
  const encoderMsgPack = new EncoderMsgPack();
  const decoderMsgPack = new DecoderMsgPack();
  const {
    route = '/rpc/compact',
    uws,
    onCall,
    onNotification,
    createContext,
    compression,
    idleTimeout = 0,
    maxActiveCalls = 50,
    maxBackpressure = 3 * 1024 * 1024,
    maxPayloadLength = 1024 * 1024,
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
      const isBinary = secWebSocketProtocol.indexOf('MessagePack') > -1;
      /* This immediately calls open handler, you must not use res after this call */
      res.upgrade({ctx, isBinary}, secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions, context);
    },
    open: (ws: WebSocket) => {
      const rpc = new RpcServer<Ctx>({
        maxActiveCalls,
        formatError: () => {},
        onCall,
        onNotification: onNotification ? (name: string, data: unknown | undefined, ctx: Ctx) => {
          onNotification(ws as CompactRpcWebSocket<Ctx>, name, data);
        } : () => {},
        send: (messages: ReactiveRpcResponseMessage[]) => {
          if (ws.getBufferedAmount() > maxBackpressure) return;
          const {isBinary} = (ws as CompactRpcWebSocket<Ctx>);
          const encoded = isBinary
            ? encoderMsgPack.encode(messages)
            : encoderJson.encode(messages);
          ws.send(encoded, isBinary);
        },
      });
      ws.rpc = rpc;
    },
    message: (ws: WebSocket, buf: ArrayBuffer, isBinary: boolean) => {
      const {ctx, rpc} = ws as CompactRpcWebSocket<Ctx>;
      const messages = isBinary
        ? decoderMsgPack.decode(new Uint8Array(buf))
        : decoderJson.decode(Buffer.from(buf).toString('utf8') as json_string<CompactMessage[]>);
      const length = messages.length;
      for (let i = 0; i < length; i++) {
        const message = messages[i] as ReactiveRpcRequestMessage;
        rpc.onMessage(message, ctx);
      }
    },
    close: (ws: WebSocket, code: number, message: ArrayBuffer) => {
      (ws as CompactRpcWebSocket<Ctx>).rpc.stop();
    },
  });
};
