import {printTree} from 'tree-dump/lib/printTree';
import {type Http1CreateServerOpts, Http1Server, type Http1ServerOpts} from './Http1Server';
import {RpcError} from '@jsonjoy.com/rpc-error';
import {gzip} from '@jsonjoy.com/util/lib/compression/gzip';
import {RxLogicalChannelBase} from '@jsonjoy.com/rpc-calls/lib/channel/RxLogicalChannelBase';
import {RxLogicalChannelBaseDispatcher} from '@jsonjoy.com/rpc-calls/lib/dispatcher/RxLogicalChannelBaseDispatcher';
import {BatchDispatcher} from '@jsonjoy.com/rpc-calls/lib/dispatcher/BatchDispatcher';
import {RpcCodec} from '@jsonjoy.com/rpc-codec';
import type {Printable} from 'tree-dump/lib/types';
import type {AnyCallee} from '@jsonjoy.com/rpc-calls';
import type {RpcLogger} from '@jsonjoy.com/rpc-error';
import type {Http1ConnectionContext} from './Http1ConnectionContext';
import type {CorsOpts} from './Http1Cors';

const DEFAULT_MAX_PAYLOAD = 4 * 1024 * 1024;

export interface RpcServerOpts {
  http1: Http1Server;
  callee: AnyCallee;
  logger?: RpcLogger;
  cors?: CorsOpts;
}

export interface RpcServerStartOpts extends Omit<RpcServerOpts, 'http1'> {
  port?: number;
  host?: string;
  server?: Omit<Http1ServerOpts, 'server'>;
  create?: Http1CreateServerOpts;
}

export class RpcServer implements Printable {
  public static readonly startWithDefaults = async (opts: RpcServerStartOpts): Promise<RpcServer> => {
    const port = opts.port || 8080;
    const logger = opts.logger ?? console;
    const server = await Http1Server.create(opts.create);
    const http1 = new Http1Server({...opts.server, server});
    const rpc = new RpcServer({
      callee: opts.callee,
      http1,
      logger,
      cors: opts.cors,
    });
    rpc.enableDefaults();
    await http1.start();
    const listenArgs: any[] = [port];
    if (opts.host) listenArgs.push(opts.host);
    listenArgs.push(() => {
      let host = server.address() || 'localhost';
      if (typeof host === 'object') host = (host as any).address;
      logger.log({msg: 'SERVER_STARTED', host, port});
    });
    server.listen(...listenArgs);
    return rpc;
  };

  public readonly http1: Http1Server;
  public readonly dispatcher: BatchDispatcher;

  constructor(protected readonly opts: RpcServerOpts) {
    this.dispatcher = new BatchDispatcher({callee: opts.callee as any});
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
  }

  public enableHttpPing(): void {
    const http1 = this.http1;
    http1.enableHttpPing();
    http1.enableKamalPing();
  }

  public enableCors(opts: CorsOpts | undefined = this.opts.cors): void {
    this.http1.enableCors(opts);
  }

  private processHttpRpcRequest = async (ctx: Http1ConnectionContext) => {
    const res = ctx.res;
    const body = await ctx.body(DEFAULT_MAX_PAYLOAD);
    if (!res.socket) return;
    try {
      const messageCodec = ctx.msgCodec;
      const incomingMessages = messageCodec.decode(ctx.reqCodec, body);
      try {
        const outgoing = await this.dispatcher.onBatch(incomingMessages as any, ctx);
        if (!res.socket) return;
        const resCodec = ctx.resCodec;
        messageCodec.writeBatch(resCodec, outgoing as any);
        const buf = resCodec.encoder.writer.flush();
        if (!res.socket) return;
        res.end(buf);
      } catch (error) {
        const logger = this.opts.logger ?? console;
        logger.error('HTTP_RPC_PROCESSING', error, {messages: incomingMessages});
        throw RpcError.from(error);
      }
    } catch (error) {
      if (typeof error === 'object' && error)
        if ((error as any).message === 'Invalid JSON') throw RpcError.badRequest();
      throw RpcError.from(error);
    }
  };

  public enableHttpRpc(path = '/rx'): void {
    const http1 = this.http1;
    http1.route({
      method: 'POST',
      path,
      handler: this.processHttpRpcRequest,
      msgCodec: http1.codecs.msg.compact,
    });
  }

  public enableJsonRcp2HttpRpc(path = '/rpc'): void {
    const http1 = this.http1;
    http1.route({
      method: 'POST',
      path,
      handler: this.processHttpRpcRequest,
      msgCodec: http1.codecs.msg.jsonRpc2,
    });
  }

  public enableWsRpc(path = '/rx'): void {
    const opts = this.opts;
    const callee = opts.callee;
    this.http1.ws({
      path,
      maxIncomingMessage: 2 * 1024 * 1024,
      maxOutgoingBackpressure: 2 * 1024 * 1024,
      handler: (ctx) => {
        const codec = new RpcCodec(ctx.msgCodec, ctx.reqCodec, ctx.resCodec);
        const logicalChannel = new RxLogicalChannelBase(ctx.connection, codec);
        new RxLogicalChannelBaseDispatcher(logicalChannel, callee as any, ctx);
      },
    });
  }

  /**
   * Exposes JSON Type schema under the GET /schema endpoint.
   */
  public enableSchema(path: string = '/schema', method: string = 'GET'): void {
    const responseBody: Uint8Array = Buffer.from('{}');
    let responseBodyCompressed: Uint8Array = new Uint8Array(0);
    gzip(responseBody).then((compressed) => (responseBodyCompressed = compressed));
    this.http1.route({
      method,
      path,
      handler: (ctx) => {
        const res = ctx.res;
        res.writeHead(200, 'OK', {
          'Content-Type': 'application/json',
          'Content-Encoding': 'gzip',
          'Cache-Control': 'public, max-age=3600, immutable',
          'Content-Length': responseBodyCompressed.length,
        });
        res.end(responseBodyCompressed);
      },
    });
  }

  public enableDefaults(): void {
    this.enableCors();
    this.enableHttpPing();
    this.enableHttpRpc();
    this.enableJsonRcp2HttpRpc();
    this.enableWsRpc();
    this.enableSchema();
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab = ''): string {
    return (
      `${this.constructor.name}` +
      printTree(tab, [
        (tab) => this.http1.toString(tab),
        () => '',
        (tab) => (this.opts.callee as unknown as Printable).toString(tab),
      ])
    );
  }
}
