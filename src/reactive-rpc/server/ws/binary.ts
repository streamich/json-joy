import type {IncomingMessage} from 'http';
import type {ReactiveRpcBinaryMessage, ReactiveRpcRequestMessage} from '../../common';
import {createConnectionContext} from './context';
import {Encoder} from '../../common/codec/binary';
import {Decoder} from '../../common/codec/binary-msgpack';
import type {RpcServerMsgPack} from '../../common/rpc/RpcServerMsgPack';
import type {RpcServerParams} from '../../common/rpc';
import {bufferToUint8Array} from '../../../util/bufferToUint8Array';

export interface EnableWsReactiveRpcApiParams<Ctx> {
  /**
   * An instance of `ws` server.
   * 
   * ```js
   * import WebSocket from 'ws';
   * const wss = new WebSocket('ws://www.host.com/path');
   * ```
   */
  wss: any;
  // wss: WebSocketServer;
  createContext?: (req: IncomingMessage) => Ctx;
  createRpcServer: (params: Pick<RpcServerParams<Ctx>, 'send'>) => RpcServerMsgPack<Ctx>;
  onNotification?: (ws: WebSocket, name: string, data: unknown | undefined, ctx: Ctx) => void;
}

export const enableWsBinaryReactiveRpcApi = <Ctx>(params: EnableWsReactiveRpcApiParams<Ctx>) => {
  const encoder = new Encoder();
  const decoder = new Decoder();
  const {
    wss,
    createContext,
    createRpcServer,
    onNotification,
  } = params;
  wss.on('connection', (ws: any, req: any) => {
    let ctx: Ctx;
    let rpc: RpcServerMsgPack<Ctx>;
    ws.on('upgrade', (req: any) => {
      ctx = (createContext || createConnectionContext)(req) as unknown as Ctx;
    });
    ws.on('open', () => {
      rpc = createRpcServer({
        send: (messages: unknown) => {
          const uint8 = encoder.encode(messages as ReactiveRpcBinaryMessage[]);
          ws.send(uint8);
        },
      });
      if (onNotification)
        rpc.onNotification = (name: string, data: unknown | undefined, ctx: Ctx) => {
          onNotification(ws, name, data, ctx);
        };
    });
    ws.on('message', (buf: Buffer) => {
      if (Buffer.isBuffer(buf)) {
        ws.close();
        return;
      }
      const uint8 = bufferToUint8Array(buf as Buffer);
      const messages = decoder.decode(uint8);
      const length = messages.length;
      for (let i = 0; i < length; i++)
        rpc.onMessage(messages[i] as ReactiveRpcRequestMessage, ctx);
    });
    ws.on('close', () => {
      rpc!.stop();
    });
  });
};
