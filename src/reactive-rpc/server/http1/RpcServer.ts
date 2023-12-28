import * as http from 'http';
import {Printable} from '../../../util/print/types';
import {printTree} from '../../../util/print/printTree';
import {Http1Server} from './Http1Server';
import {RpcError} from '../../common/rpc/caller';
import {IncomingBatchMessage, ReactiveRpcClientMessage, ReactiveRpcMessage, RpcMessageBatchProcessor, RpcMessageStreamProcessor} from '../../common';
import {ConnectionContext, WsConnectionContext} from './context';
import type {RpcCaller} from '../../common/rpc/caller/RpcCaller';
import type {ServerLogger} from './types';

const DEFAULT_MAX_PAYLOAD = 4 * 1024 * 1024;

export interface RpcServerOpts {
  http1: Http1Server;
  caller: RpcCaller<any>;
  logger?: ServerLogger;
}

export interface RpcServerStartOpts extends Omit<RpcServerOpts, 'http1'> {
  port?: number;
  server?: http.Server;
}

export class RpcServer implements Printable {
  public static readonly create = (opts: RpcServerOpts) => {
    const server = new RpcServer(opts);
    opts.http1.enableHttpPing();
    return server;
  };

  public static readonly startWithDefaults = (opts: RpcServerStartOpts): RpcServer => {
    const port = opts.port ?? 8080;
    const logger = opts.logger ?? console;
    const server = http.createServer();
    const http1Server = new Http1Server({
      server,
    });
    const rpcServer = new RpcServer({
      caller: opts.caller,
      http1: http1Server,
      logger,
    });
    rpcServer.enableDefaults();
    http1Server.start();
    server.listen(port, () => {
      let host = server.address() || 'localhost';
      if (typeof host === 'object') host = (host as any).address;
      logger.log({msg: 'SERVER_STARTED', host, port});
    });
    return rpcServer;
  };

  public readonly http1: Http1Server;
  protected readonly batchProcessor: RpcMessageBatchProcessor<ConnectionContext>;

  constructor(protected readonly opts: RpcServerOpts) {
    const http1 = (this.http1 = opts.http1);
    const onInternalError = http1.oninternalerror;
    http1.oninternalerror = (error, res, req) => {
      if (error instanceof RpcError) {
        res.statusCode = 400;
        const data = JSON.stringify(error.toJson());
        res.end(data);
        return;
      }
      onInternalError(error, res, req);
    };
    this.batchProcessor = new RpcMessageBatchProcessor<ConnectionContext>({caller: opts.caller});
  }

  public enableHttpPing(): void {
    this.http1.enableHttpPing();
  }

  public enableCors(): void {
    this.http1.route({
      method: 'OPTIONS',
      path: '/{::\n}',
      handler: (ctx) => {
        const res = ctx.res;
        res.writeHead(200, 'OK', {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          // 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          // 'Access-Control-Allow-Headers': 'Content-Type',
          // 'Access-Control-Max-Age': '86400',
        });
        res.end();
      },
    });
  }

  public enableHttpRpc(path: string = '/rpc'): void {
    const batchProcessor = this.batchProcessor;
    const logger = this.opts.logger ?? console;
    this.http1.route({
      method: 'POST',
      path,
      handler: async (ctx) => {
        const res = ctx.res;
        const body = await ctx.body(DEFAULT_MAX_PAYLOAD);
        if (!res.socket) return;
        try {
          const messageCodec = ctx.msgCodec;
          const incomingMessages = messageCodec.decodeBatch(ctx.reqCodec, body);
          try {
            const outgoingMessages = await batchProcessor.onBatch(incomingMessages as IncomingBatchMessage[], ctx);
            if (!res.socket) return;
            const resCodec = ctx.resCodec;
            messageCodec.encodeBatch(resCodec, outgoingMessages);
            const buf = resCodec.encoder.writer.flush();
            if (!res.socket) return;
            res.end(buf);
          } catch (error) {
            logger.error('HTTP_RPC_PROCESSING', error, {messages: incomingMessages});
            throw RpcError.from(error);
          }
        } catch (error) {
          if (typeof error === 'object' && error)
            if ((error as any).message === 'Invalid JSON') throw RpcError.badRequest();
          throw RpcError.from(error);
        }
      },
    });
  }

  public enableWsRpc(path: string = '/rpc'): void {
    const opts = this.opts;
    const logger = opts.logger ?? console;
    const caller = opts.caller;
    this.http1.ws({
      path,
      maxIncomingMessage: 2 * 1024 * 1024,
      maxOutgoingBackpressure: 2 * 1024 * 1024,
      handler: (ctx: WsConnectionContext, req: http.IncomingMessage) => {
        const connection = ctx.connection;
        const reqCodec = ctx.reqCodec;
        const resCodec = ctx.resCodec;
        const msgCodec = ctx.msgCodec;
        const encoder = resCodec.encoder;
        const rpc = new RpcMessageStreamProcessor({
          caller,
          send: (messages: ReactiveRpcMessage[]) => {
            try {
              const writer = encoder.writer;
              writer.reset();
              msgCodec.encodeBatch(resCodec, messages);
              const encoded = writer.flush();
              connection.sendBinMsg(encoded);
            } catch (error) {
              logger.error('WS_SEND', error, {messages});
              connection.close();
            }
          },
          bufferSize: 1,
          bufferTime: 0,
        });
        connection.onmessage = (uint8: Uint8Array, isUtf8: boolean) => {
          let messages: ReactiveRpcClientMessage[];
          try {
            messages = msgCodec.decodeBatch(reqCodec, uint8) as ReactiveRpcClientMessage[]; 
          } catch (error) {
            logger.error('RX_RPC_DECODING', error, {codec: reqCodec.id, buf: Buffer.from(uint8).toString('base64')});
            connection.close();
            return;
          }
          try {
            rpc.onMessages(messages, ctx);
          } catch (error) {
            logger.error('RX_RPC_PROCESSING', error, messages!);
            connection.close();
            return;
          }
        };
        connection.onclose = (code: number, reason: string) => {   
          rpc.stop();
        };
      },
    });
  }

  public enableDefaults(): void {
    this.enableCors();
    this.enableHttpPing();
    this.enableHttpRpc();
    this.enableWsRpc();
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    return `${this.constructor.name}` + printTree(tab, [(tab) => this.http1.toString(tab)]);
  }
}
