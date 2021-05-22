import type {TemplatedApp, HttpRequest, HttpResponse, WebSocket} from 'uWebSockets.js';
import type {RpcMethod} from '../../common/rpc/types';
import {Encoder, Decoder} from '../../common/codec/binary-msgpack';
import {Encoder as EncoderJson, Decoder as DecoderJson} from '../../common/codec/compact-json';
import {Encoder as EncoderMsgPack, Decoder as DecoderMsgPack} from '../../common/codec/compact-msgpack';
import {RpcServer, RpcServerParams} from '../../common/rpc/RpcServer';
import {ReactiveRpcRequestMessage, ReactiveRpcResponseMessage} from '../../common';
import {NotificationMessage} from '../../common/messages/nominal/NotificationMessage';

interface ErrorLike {
  message: string;
  status?: number;
  code?: string;
  errno?: number;
  errorId?: number;
}

const formatErrorLike = (error: ErrorLike): ErrorLike => {
  const out: ErrorLike = {message: error.message};
  if (typeof error.status === 'number') out.status = error.status;
  if (typeof error.code === 'string') out.code = error.code;
  if (typeof error.errno === 'number') out.errno = error.errno;
  if (typeof error.errorId === 'number') out.errorId = error.errorId;
  return out;
};

const isErrorLike = (error: unknown): error is ErrorLike => {
  if (error instanceof Error) return true;
  if (typeof error === 'object')
    if (typeof (error as Record<string, unknown>).message === 'string') return true;
  return false;
};

const defaultFormatError = (error: unknown): unknown => {
  if (isErrorLike(error)) return formatErrorLike(error);
  return error;
};

const defaultFormatErrorCode = (errno: number): ErrorLike => {
  return {
    message: 'PROTOCOL',
    errno,
  };
};

const enum DEFAULTS {
  IDLE_TIMEOUT = 0,
  MAX_ACTIVE_CLIENTS = 50,
  MAX_BACKPRESSURE = 3 * 1024 * 1024,
  MAX_PAYLOAD_LENGTH = 1024 * 1024,
}

export interface RpcWebSocket<Ctx = unknown> extends WebSocket {
  ctx: Ctx;
  rpc: RpcServer<Ctx>;
}

export interface EnableWsReactiveRpcApiParams<Ctx> {
  uws: TemplatedApp;
  createContext: (req: HttpRequest, res: HttpResponse) => Ctx;
  onCall: RpcServerParams<Ctx>['onCall'];
  onNotification?: (ws: RpcWebSocket<Ctx>, name: string, data: unknown | undefined) => void;
  formatError?: RpcServerParams<Ctx>['formatError'];
  formatErrorCode?: RpcServerParams<Ctx>['formatErrorCode'];
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
    formatError = defaultFormatError,
    formatErrorCode = defaultFormatErrorCode,
    idleTimeout = DEFAULTS.IDLE_TIMEOUT,
    maxActiveCalls = DEFAULTS.MAX_ACTIVE_CLIENTS,
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
    open: (ws: WebSocket) => {
      const rpc = new RpcServer<Ctx>({
        maxActiveCalls,
        formatError,
        formatErrorCode,
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
  const invalidPayloadNotification = new NotificationMessage('.err', {
    message: 'INVALID_PAYLOAD',
  });
  const invalidPayloadJson = encoderJson.encode([invalidPayloadNotification]);
  const invalidPayloadMsgPack = encoderMsgPack.encode([invalidPayloadNotification]);
  const {
    route = '/rpc/compact',
    uws,
    onCall,
    onNotification,
    createContext,
    compression,
    formatError = defaultFormatError,
    formatErrorCode = defaultFormatErrorCode,
    idleTimeout = DEFAULTS.IDLE_TIMEOUT,
    maxActiveCalls = DEFAULTS.MAX_ACTIVE_CLIENTS,
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
      const isBinary = secWebSocketProtocol.indexOf('MsgPack') > -1;
      /* This immediately calls open handler, you must not use res after this call */
      res.upgrade({ctx, isBinary}, secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions, context);
    },
    open: (ws: WebSocket) => {
      const rpc = new RpcServer<Ctx>({
        maxActiveCalls,
        formatError,
        formatErrorCode,
        onCall,
        onNotification: onNotification ? (name: string, data: unknown | undefined, ctx: Ctx) => {
          onNotification(ws as CompactRpcWebSocket<Ctx>, name, data);
        } : () => {},
        send: (messages: ReactiveRpcResponseMessage[]) => {
          if (ws.getBufferedAmount() > maxBackpressure) return;
          const {isBinary} = (ws as CompactRpcWebSocket<Ctx>);
          const encoded = isBinary ? encoderMsgPack.encode(messages) : encoderJson.encode(messages);
          ws.send(encoded, isBinary);
        },
      });
      ws.rpc = rpc;
    },
    message: (ws: WebSocket, buf: ArrayBuffer, isBinary: boolean) => {
      try {
        const {ctx, rpc} = ws as CompactRpcWebSocket<Ctx>;
        const messages = isBinary
          ? decoderMsgPack.decode(new Uint8Array(buf))
          : decoderJson.decode(Buffer.from(buf).toString('utf8') as any);
        if (messages instanceof Array) rpc.onMessages(messages as ReactiveRpcRequestMessage[], ctx);
        else rpc.onMessage(messages as ReactiveRpcRequestMessage, ctx);
      } catch (error) {
        // We don't log `error` here as client can intentionally spam many
        // invalid messages an to flood our log.
        if (ws.getBufferedAmount() > maxBackpressure) return;
        ws.send(isBinary ? invalidPayloadMsgPack : invalidPayloadJson, isBinary);
      }
    },
    close: (ws: WebSocket, code: number, message: ArrayBuffer) => {
      (ws as CompactRpcWebSocket<Ctx>).rpc.stop();
    },
  });
};
