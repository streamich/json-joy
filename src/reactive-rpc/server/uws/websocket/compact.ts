import type {EnableWsReactiveRpcApiParams, RpcWebSocket, UwsWebSocket} from './types';
import type {ReactiveRpcMessage, ReactiveRpcRequestMessage, ReactiveRpcResponseMessage} from '../../../common';
import {Encoder as EncoderJson, Decoder as DecoderJson} from '../../../common/codec/compact-json';
import {Encoder as EncoderMsgPack, Decoder as DecoderMsgPack} from '../../../common/codec/compact-msgpack';
import {NotificationMessage} from '../../../common/messages/nominal/NotificationMessage';
import {DEFAULTS} from './constants';
import {createConnectionContext} from '../context';

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
  const invalidPayloadNotification = new NotificationMessage('.err', 'CODING');
  const invalidPayloadJson = encoderJson.encode([invalidPayloadNotification]);
  const invalidPayloadMsgPack = encoderMsgPack.encode([invalidPayloadNotification]);
  const {
    route = '/rpc/compact',
    uws,
    createRpcServer,
    onNotification,
    createContext = createConnectionContext as any,
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
      const isBinary = secWebSocketProtocol.indexOf('MsgPack') > -1;
      /* This immediately calls open handler, you must not use res after this call */
      res.upgrade({ctx, isBinary}, secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions, context);
    },
    open: (ws: UwsWebSocket) => {
      const rpc = createRpcServer({
        send: (messages: (ReactiveRpcResponseMessage | NotificationMessage)[]) => {
          if (ws.getBufferedAmount() > maxBackpressure) return;
          const {isBinary} = (ws as CompactRpcWebSocket<Ctx>);
          const encoded = isBinary ? encoderMsgPack.encode(messages) : encoderJson.encode(messages);
          ws.send(encoded, isBinary);
        },
      });
      if (onNotification) {
        rpc.onNotification = (name: string, data: unknown | undefined, ctx: Ctx) => {
          onNotification(ws as CompactRpcWebSocket<Ctx>, name, data, ctx);
        };
      }
      ws.rpc = rpc;
    },
    message: (ws: UwsWebSocket, buf: ArrayBuffer, isBinary: boolean) => {
      const {ctx, rpc} = ws as CompactRpcWebSocket<Ctx>;
      let messages: ReactiveRpcMessage | ReactiveRpcMessage[];
      try {
        messages = isBinary
          ? decoderMsgPack.decode(new Uint8Array(buf))
          : decoderJson.decode(Buffer.from(buf).toString('utf8') as any);
      } catch (error) {
        // We don't log `error` here as client can intentionally spam many
        // invalid messages an to flood our log.
        if (ws.getBufferedAmount() > maxBackpressure) return;
        ws.send(isBinary ? invalidPayloadMsgPack : invalidPayloadJson, isBinary);
        return;
      }
      if (messages instanceof Array) rpc.onMessages(messages as ReactiveRpcRequestMessage[], ctx);
      else rpc.onMessage(messages as ReactiveRpcRequestMessage, ctx);
    },
    close: (ws: UwsWebSocket, code: number, message: ArrayBuffer) => {
      (ws as CompactRpcWebSocket<Ctx>).rpc.stop();
    },
  });
};
