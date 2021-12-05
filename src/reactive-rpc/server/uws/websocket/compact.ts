import type {EnableWsReactiveRpcApiParams, RpcWebSocket, UwsWebSocket} from './types';
import {
  BinaryNotificationMessage,
  ReactiveRpcBinaryMessage,
  ReactiveRpcMessage,
  ReactiveRpcRequestMessage,
  ReactiveRpcResponseMessage,
} from '../../../common';
import {Decoder as DecoderJson} from '../../../common/codec/compact-json/Decoder';
import {Decoder as DecoderMsgPack} from '../../../common/codec/compact-msgpack/Decoder';
import {Encoder as EncoderCompactMsgPackBinary} from '../../../common/codec/compact-msgpack-binary';
import {Encoder as EncoderCompactJsonString} from '../../../common/codec/compact-json_string';
import {NotificationMessage} from '../../../common/messages/nominal/NotificationMessage';
import {DEFAULTS} from './constants';
import {createConnectionContext} from '../context';
import type {RpcServer, RpcServerParams} from '../../../common/rpc';
import type {RpcServerMsgPack} from '../../../common/rpc/RpcServerMsgPack';
import {JsonNotificationMessage, ReactiveRpcJsonMessage} from '../../../common/messages/json';
import type {RpcServerJson} from '../../../common/rpc/RpcServerJson';
import {JSON} from '../../../../json-brand';
import {encode} from '../../../../json-pack/util';

export interface EnableWsCompactReactiveRpcApiParams<Ctx> extends EnableWsReactiveRpcApiParams<Ctx> {
  createRpcServerJson: (params: Pick<RpcServerParams<Ctx>, 'send'>) => RpcServerJson<Ctx>;
  createRpcServerMsgPack: (params: Pick<RpcServerParams<Ctx>, 'send'>) => RpcServerMsgPack<Ctx>;
}

export interface CompactRpcWebSocket<Ctx = unknown> extends RpcWebSocket<Ctx> {
  isBinary: boolean;
}

export const enableWsCompactReactiveRpcApi = <Ctx>(params: EnableWsCompactReactiveRpcApiParams<Ctx>) => {
  const decoderJson = new DecoderJson();
  const decoderMsgPack = new DecoderMsgPack();
  const encoderCompactJsonString = new EncoderCompactJsonString();
  const encoderCompactMsgPackBinary = new EncoderCompactMsgPackBinary();
  const invalidPayloadJson = encoderCompactJsonString.encode([
    new JsonNotificationMessage('.err', JSON.stringify('CODING')),
  ]);
  const invalidPayloadMsgPack = encoderCompactMsgPackBinary.encode([
    new BinaryNotificationMessage('.err', encode('CODING')),
  ]);
  const {
    route = '/rpc/compact',
    uws,
    createRpcServerJson,
    createRpcServerMsgPack,
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
      const {isBinary} = ws as CompactRpcWebSocket<Ctx>;
      let rpc: RpcServer<Ctx>;
      if (isBinary) {
        rpc = createRpcServerMsgPack({
          send: (messages: (ReactiveRpcResponseMessage | NotificationMessage)[]) => {
            if (ws.getBufferedAmount() > maxBackpressure) return;
            const encoded = encoderCompactMsgPackBinary.encode(messages as ReactiveRpcBinaryMessage[]);
            ws.send(encoded, true);
          },
        });
      } else {
        rpc = createRpcServerJson({
          send: (messages: (ReactiveRpcResponseMessage | NotificationMessage)[]) => {
            if (ws.getBufferedAmount() > maxBackpressure) return;
            const encoded = encoderCompactJsonString.encode(messages as ReactiveRpcJsonMessage[]);
            ws.send(encoded, false);
          },
        });
      }
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
