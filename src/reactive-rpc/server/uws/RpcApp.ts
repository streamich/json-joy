import {enableCors} from './util';
import {Match, Router} from '../../../util/router';
import {listToUint8} from '../../../util/buffers/concat';
import {IncomingBatchMessage, RpcMessageBatchProcessor} from '../../common/rpc/RpcMessageBatchProcessor';
import {RpcError, RpcErrorCodes, RpcErrorType} from '../../common/rpc/caller/error';
import {ConnectionContext} from '../context';
import {RpcMessageCodecs} from '../../common/codec/RpcMessageCodecs';
import {Value} from '../../common/messages/Value';
import {EncodingFormat} from '../../../json-pack/constants';
import {RpcMessageFormat} from '../../common/codec/constants';
import {RpcCodecs} from '../../common/codec/RpcCodecs';
import {type ReactiveRpcMessage, RpcMessageStreamProcessor, ReactiveRpcClientMessage} from '../../common';
import type {Codecs} from '../../../json-pack/codecs/Codecs';
import type {
  TemplatedApp,
  HttpRequest,
  HttpResponse,
  HttpMethodPermissive,
  JsonRouteHandler,
  WebSocket,
  RpcWebSocket,
} from './types';
import type {RouteHandler} from './types';
import type {RpcCaller} from '../../common/rpc/caller/RpcCaller';
import type {JsonValueCodec} from '../../../json-pack/codecs/types';

const HDR_BAD_REQUEST = Buffer.from('400 Bad Request', 'utf8');
const HDR_NOT_FOUND = Buffer.from('404 Not Found', 'utf8');
const HDR_INTERNAL_SERVER_ERROR = Buffer.from('500 Internal Server Error', 'utf8');
const ERR_NOT_FOUND = RpcError.fromCode(RpcErrorCodes.NOT_FOUND, 'Not Found');
const ERR_INTERNAL = RpcError.internal();

export interface RpcAppOptions {
  uws: TemplatedApp;
  maxRequestBodySize: number;
  codecs: Codecs;
  caller: RpcCaller<any>;
}

export class RpcApp<Ctx extends ConnectionContext> {
  public readonly codecs: RpcCodecs;
  protected readonly app: TemplatedApp;
  protected readonly maxRequestBodySize: number;
  protected readonly router = new Router();
  protected readonly batchProcessor: RpcMessageBatchProcessor<Ctx>;

  constructor(protected readonly options: RpcAppOptions) {
    this.app = options.uws;
    this.maxRequestBodySize = options.maxRequestBodySize;
    this.codecs = new RpcCodecs(options.codecs, new RpcMessageCodecs());
    this.batchProcessor = new RpcMessageBatchProcessor<Ctx>({caller: options.caller});
  }

  public enableCors() {
    enableCors(this.options.uws);
  }

  public routeRaw(method: HttpMethodPermissive, path: string, handler: RouteHandler<Ctx>): void {
    method = method.toLowerCase() as HttpMethodPermissive;
    this.router.add(method + path, handler);
  }

  public route(method: HttpMethodPermissive, path: string, handler: JsonRouteHandler<Ctx>): void {
    this.routeRaw(method, path, async (ctx: Ctx) => {
      const result = await handler(ctx);
      const res = ctx.res!;
      if (res.aborted) return;
      const codec = ctx.resCodec;
      const encoder = codec.encoder;
      const writer = encoder.writer;
      writer.reset();
      if (res instanceof Value) {
        if (res.type) res.type.encoder(codec.format)(res.data, encoder);
        else encoder.writeAny(res.data);
      } else {
        encoder.writeAny(result);
      }
      if (res.aborted) return;
      ctx.sendResponse(writer.flush());
    });
  }

  public enableHttpPing(path: string = '/ping'): this {
    this.route('GET', path, async () => {
      return 'pong';
    });
    return this;
  }

  public enableHttpRpc(path: string = '/rpc'): this {
    this.routeRaw('POST', path, async (ctx: Ctx) => {
      try {
        const res = ctx.res!;
        const bodyUint8 = await ctx.requestBody(this.maxRequestBodySize);
        if (res.aborted) return;
        const messageCodec = ctx.msgCodec;
        const incomingMessages = messageCodec.decodeBatch(ctx.reqCodec, bodyUint8);
        const outgoingMessages = await this.batchProcessor.onBatch(incomingMessages as IncomingBatchMessage[], ctx);
        if (res.aborted) return;
        const resCodec = ctx.resCodec;
        messageCodec.encodeBatch(resCodec, outgoingMessages);
        const buf = resCodec.encoder.writer.flush();
        if (res.aborted) return;
        res.end(buf);
      } catch (err: any) {
        if (typeof err === 'object' && err) if (err.message === 'Invalid JSON') throw RpcError.invalidRequest();
        throw RpcError.from(err);
      }
    });
    return this;
  }

  public enableWsRpc(path: string = '/rpc'): this {
    const maxBackpressure = 4 * 1024 * 1024;
    this.app.ws(path, {
      idleTimeout: 0,
      maxPayloadLength: 4 * 1024 * 1024,
      upgrade: (res, req, context) => {
        const secWebSocketKey = req.getHeader('sec-websocket-key');
        const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
        const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');
        const ctx = ConnectionContext.fromReqRes(req, res, null, this);
        /* This immediately calls open handler, you must not use res after this call */
        res.upgrade({ctx}, secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions, context);
      },
      open: (ws_: WebSocket) => {
        const ws = ws_ as RpcWebSocket<Ctx>;
        const ctx = ws.ctx;
        const resCodec = ctx.resCodec;
        const msgCodec = ctx.msgCodec;
        const encoder = resCodec.encoder;
        const isBinary = resCodec.format !== EncodingFormat.Json || msgCodec.format === RpcMessageFormat.Binary;
        ws.rpc = new RpcMessageStreamProcessor({
          caller: this.options.caller,
          send: (messages: ReactiveRpcMessage[]) => {
            if (ws.getBufferedAmount() > maxBackpressure) return;
            const writer = encoder.writer;
            writer.reset();
            msgCodec.encodeBatch(resCodec, messages);
            const encoded = writer.flush();
            ws.send(encoded, isBinary, false);
          },
          bufferSize: 1,
          bufferTime: 0,
        });
      },
      message: (ws_: WebSocket, buf: ArrayBuffer, isBinary: boolean) => {
        const ws = ws_ as RpcWebSocket<Ctx>;
        const ctx = ws.ctx;
        const reqCodec = ctx.reqCodec;
        const msgCodec = ctx.msgCodec;
        const uint8 = new Uint8Array(buf);
        const rpc = ws.rpc!;
        try {
          const messages = msgCodec.decodeBatch(reqCodec, uint8);
          rpc.onMessages(messages as ReactiveRpcClientMessage[], ctx);
        } catch (error) {
          rpc.sendNotification('.err', RpcError.value(RpcError.invalidRequest()));
        }
      },
      close: (ws_: WebSocket, code: number, message: ArrayBuffer) => {
        const ws = ws_ as RpcWebSocket<Ctx>;
        ws.rpc!.stop();
      },
    });
    return this;
  }

  public startRouting(): void {
    const matcher = this.router.compile();
    const codecs = this.codecs;
    let responseCodec: JsonValueCodec = codecs.value.json;
    this.app.any('/*', async (res: HttpResponse, req: HttpRequest) => {
      res.onAborted(() => {
        res.aborted = true;
      });
      const method = req.getMethod();
      const url = req.getUrl();
      try {
        const match = matcher(method + url) as undefined | Match;
        if (!match) {
          res.cork(() => {
            res.writeStatus(HDR_NOT_FOUND);
            res.end(RpcErrorType.encode(responseCodec, ERR_NOT_FOUND));
          });
          return;
        }
        const handler = match.data as RouteHandler<Ctx>;
        const params = match.params;
        const ctx = ConnectionContext.fromReqRes(req, res, params, this) as Ctx;
        responseCodec = ctx.resCodec;
        await handler(ctx);
      } catch (err) {
        if (err instanceof RpcError) {
          const error = <RpcError>err;
          res.cork(() => {
            res.writeStatus(HDR_BAD_REQUEST);
            res.end(RpcErrorType.encode(responseCodec, error));
          });
          return;
        }
        if (err instanceof Value && err.data instanceof RpcError) {
          const error = <RpcError>err.data;
          res.cork(() => {
            res.writeStatus(HDR_BAD_REQUEST);
            res.end(RpcErrorType.encode(responseCodec, error));
          });
          return;
        }
        // tslint:disable-next-line:no-console
        console.error(err);
        res.cork(() => {
          res.writeStatus(HDR_INTERNAL_SERVER_ERROR);
          res.end(RpcErrorType.encode(responseCodec, ERR_INTERNAL));
        });
      }
    });
  }
}
