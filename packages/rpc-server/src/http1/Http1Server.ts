import * as http from 'http';
import * as https from 'https';
import type * as tls from 'tls';
import type * as net from 'net';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {printTree} from 'tree-dump/lib/printTree';
import {WsServerConnection} from '../ws/server/WsServerConnection';
import {WsFrameEncoder} from '../ws/codec/WsFrameEncoder';
import {Router, type RouteMatcher} from '@jsonjoy.com/jit-router';
import {PayloadTooLarge} from '../errors';
import {setCodecs} from './util';
import {findTokenInText} from '../util';
import {Http1ConnectionContext, WsConnectionContext} from './context';
import {Http1Cors, type CorsOpts} from './Http1Cors';
import {RpcCodecs} from '@jsonjoy.com/rpc-codec';
import {RpcMessageCodecs} from '@jsonjoy.com/rpc-codec';
import {NullObject} from '@jsonjoy.com/util/lib/NullObject';
import type {Printable} from 'tree-dump/lib/types';
import type {RpcMessageCodec} from '../types';

export type Http1Handler = (ctx: Http1ConnectionContext) => void | Promise<void>;
export type Http1NotFoundHandler = (res: http.ServerResponse, req: http.IncomingMessage) => void;
export type Http1InternalErrorHandler = (error: unknown, res: http.ServerResponse, req: http.IncomingMessage) => void;

export class Http1EndpointMatch {
  constructor(
    public readonly handler: Http1Handler,
    public readonly msgCodec: RpcMessageCodec,
  ) {}
}

export interface Http1EndpointDefinition {
  /**
   * The HTTP method to match. If not specified, then the handler will be
   * invoked for any method.
   */
  method?: string | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';

  /**
   * The path to match. Should start with a slash.
   */
  path: string;

  /**
   * The handler function.
   */
  handler: Http1Handler;

  /**
   * Default message codec for this route.
   */
  msgCodec?: RpcMessageCodec;
}

export interface WsEndpointDefinition {
  path: string;
  maxIncomingMessage?: number;
  maxOutgoingBackpressure?: number;
  onWsUpgrade?(req: http.IncomingMessage, connection: WsServerConnection): void;
  handler(ctx: WsConnectionContext, req: http.IncomingMessage): void;
}

export interface Http1ServerOpts {
  server: http.Server;
  codecs?: RpcCodecs;
  writer?: Writer;
}

export type Http1CreateServerOpts = Http1CreateHttpServerOpts | Http1CreateHttpsServerOpts;

export interface Http1CreateHttpServerOpts {
  tls?: false;
  conf?: http.ServerOptions;
}

export interface Http1CreateHttpsServerOpts {
  tls: true;
  conf?: https.ServerOptions;
  secureContext?: () => Promise<tls.SecureContextOptions>;

  /**
   * If specified, and the `secureContext` is also specified, will be used to
   * refresh the secure context every `secureContextRefreshInterval` milliseconds.
   */
  secureContextRefreshInterval?: number;
}

export class Http1Server implements Printable {
  public static create = async (opts: Http1CreateServerOpts = {}): Promise<http.Server | https.Server> => {
    if (opts.tls) {
      const {secureContext, secureContextRefreshInterval} = opts;
      const server = https.createServer({
        ...(secureContext ? await secureContext() : {}),
        ...opts.conf,
      });
      if (secureContext && secureContextRefreshInterval) {
        const timer = setInterval(() => {
          try {
            secureContext()
              .then((context) => {
                server.setSecureContext(context);
              })
              .catch((error) => {
                console.error('Failed to update secure context:', error);
              });
          } catch (error) {
            console.error('Failed to update secure context:', error);
          }
        }, secureContextRefreshInterval);
        server.once('close', () => {
          clearInterval(timer);
        });
      }
      return server;
    }
    return http.createServer(opts.conf || {});
  };

  public readonly codecs: RpcCodecs;
  public readonly server: http.Server;

  constructor(protected readonly opts: Http1ServerOpts) {
    this.server = opts.server;
    const writer = opts.writer ?? new Writer();
    this.codecs = opts.codecs ?? new RpcCodecs(new Codecs(writer), new RpcMessageCodecs());
    this.wsEncoder = new WsFrameEncoder(writer);
  }

  public async start(): Promise<void> {
    const server = this.server;
    this.httpMatcher = this.httpRouter.compile();
    this.wsMatcher = this.wsRouter.compile();
    server.on('request', this.onRequest);
    server.on('upgrade', this.onUpgrade);
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
  }

  public async stop(): Promise<void> {
    const server = this.server;
    server.removeAllListeners();
  }

  // ------------------------------------------------------------- HTTP routing

  public onnotfound: Http1NotFoundHandler = (res) => {
    res.writeHead(404, 'Not Found');
    res.end();
  };

  public oninternalerror: Http1InternalErrorHandler = (error: unknown, res) => {
    if (error instanceof PayloadTooLarge) {
      res.statusCode = 413;
      res.statusMessage = 'Payload Too Large';
      res.end();
      return;
    }
    res.statusCode = 500;
    res.statusMessage = 'Internal Server Error';
    res.end();
  };

  protected readonly httpRouter = new Router<Http1EndpointMatch>();
  protected httpMatcher: RouteMatcher<Http1EndpointMatch> = () => undefined;

  public cors: Http1Cors | null = null;

  public route(def: Http1EndpointDefinition): void {
    let path = def.path;
    if (path[0] !== '/') path = '/' + path;
    const method = def.method ? def.method.toUpperCase() : 'GET';
    const route = method + path;
    Number(route);
    const match = new Http1EndpointMatch(def.handler, def.msgCodec ?? this.codecs.msg.jsonRpc2);
    this.httpRouter.add(route, match);
  }

  private readonly onRequest = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    try {
      res.sendDate = false;
      const cors = this.cors;
      // Before routing: the 404 and internal-error paths need the headers, too.
      if (cors) cors.apply(req, res);
      const url = req.url ?? '';
      const queryStartIndex = url.indexOf('?');
      let path = url;
      let query = '';
      if (queryStartIndex >= 0) {
        path = url.slice(0, queryStartIndex);
        query = url.slice(queryStartIndex + 1);
      }
      const route = (req.method || '') + path;
      const match = this.httpMatcher(route);
      if (!match) {
        this.onnotfound(res, req);
        return;
      }
      const codecs = this.codecs;
      const ip = this.findIp(req);
      const token = this.findToken(req);
      const matchData = match.data;
      const ctx = new Http1ConnectionContext(
        req,
        res,
        path,
        query,
        ip,
        token,
        match.params,
        new NullObject(),
        codecs.val.json,
        codecs.val.json,
        matchData.msgCodec,
      );
      const headers = req.headers;
      const contentType = headers['content-type'];
      if (typeof contentType === 'string') setCodecs(ctx, contentType, codecs);
      const handler = matchData.handler;
      await handler(ctx);
    } catch (error) {
      this.oninternalerror(error, res, req);
    }
  };

  // --------------------------------------------------------------- WebSockets

  protected readonly wsEncoder: WsFrameEncoder;
  protected readonly wsRouter = new Router<WsEndpointDefinition>();
  protected wsMatcher: RouteMatcher<WsEndpointDefinition> = () => undefined;

  private readonly onUpgrade = (req: http.IncomingMessage, socket: net.Socket) => {
    if (req.headers.upgrade === 'websocket') {
      this.onWsUpgrade(req, socket);
    } else {
    }
  };

  private readonly onWsUpgrade = (req: http.IncomingMessage, socket: net.Socket) => {
    const url = req.url ?? '';
    const queryStartIndex = url.indexOf('?');
    let path = url;
    let query = '';
    if (queryStartIndex >= 0) {
      path = url.slice(0, queryStartIndex);
      query = url.slice(queryStartIndex + 1);
    }
    const match = this.wsMatcher(path);
    if (!match) {
      socket.end();
      return;
    }
    const def = match.data;
    const headers = req.headers;
    const connection = new WsServerConnection(this.wsEncoder, socket as net.Socket);
    connection.maxIncomingMessage = def.maxIncomingMessage ?? 2 * 1024 * 1024;
    connection.maxBackpressure = def.maxOutgoingBackpressure ?? 2 * 1024 * 1024;
    if (def.onWsUpgrade) def.onWsUpgrade(req, connection);
    else {
      const secWebSocketKey = headers['sec-websocket-key'] ?? '';
      const secWebSocketProtocol = headers['sec-websocket-protocol'] ?? '';
      const secWebSocketExtensions = headers['sec-websocket-extensions'] ?? '';
      connection.upgrade(secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions);
    }
    const codecs = this.codecs;
    const ip = this.findIp(req);
    const token = this.findToken(req);
    const ctx = new WsConnectionContext(
      connection,
      path,
      query,
      ip,
      token,
      match.params,
      new NullObject(),
      codecs.val.json,
      codecs.val.json,
      codecs.msg.compact,
    );
    const contentType = headers['content-type'];
    if (typeof contentType === 'string') setCodecs(ctx, contentType, codecs);
    else {
      const secWebSocketProtocol = headers['sec-websocket-protocol'] ?? '';
      if (typeof secWebSocketProtocol === 'string') setCodecs(ctx, secWebSocketProtocol, codecs);
    }
    def.handler(ctx, req);
  };

  public ws(def: WsEndpointDefinition): void {
    this.wsRouter.add(def.path, def);
  }

  // ------------------------------------------------------- Context management

  public findIp(req: http.IncomingMessage): string {
    const headers = req.headers;
    const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || req.socket.remoteAddress || '';
    return ip instanceof Array ? ip[0] : ip;
  }

  /**
   * Looks for an authentication token in the following places:
   *
   * 1. The `Authorization` header.
   * 2. The URI query parameters.
   * 3. The `Cookie` header.
   * 4. The `Sec-Websocket-Protocol` header.
   *
   * @param req HTTP request
   * @returns Authentication token, if any.
   */
  public findToken(req: http.IncomingMessage): string {
    let token = '';
    const headers = req.headers;
    let header: string | string[] | undefined;
    header = headers.authorization;
    if (typeof header === 'string') token = findTokenInText(header);
    if (token) return token;
    const url = req.url;
    if (typeof url === 'string') token = findTokenInText(url);
    if (token) return token;
    header = headers.cookie;
    if (typeof header === 'string') token = findTokenInText(header);
    if (token) return token;
    header = headers['sec-websocket-protocol'];
    if (typeof header === 'string') token = findTokenInText(header);
    return token;
  }

  // ------------------------------------------------------- High-level routing

  public enableHttpPing(path = '/ping') {
    this.route({
      path,
      handler: (ctx) => {
        ctx.res.end('"pong"');
      },
    });
  }

  // The /up endpoint is used by Kamal.
  public enableKamalPing(path = '/up', response: string | Uint8Array = 'yes') {
    this.route({
      path,
      handler: (ctx) => {
        ctx.res.end(response);
      },
    });
  }

  /** Attaches CORS headers to every response and answers preflight requests. */
  public enableCors(opts?: CorsOpts): Http1Cors {
    const cors = (this.cors = new Http1Cors(opts));
    this.route({
      method: 'OPTIONS',
      path: '/{::\n}',
      handler: (ctx) => {
        const res = ctx.res;
        cors.preflight(res);
        res.writeHead(204, 'No Content', {'Content-Length': '0'});
        res.end();
      },
    });
    return cors;
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab = ''): string {
    return (
      `${this.constructor.name}` +
      printTree(tab, [
        (tab) => `HTTP ${this.httpRouter.toString(tab)}`,
        (tab) => `WebSocket ${this.wsRouter.toString(tab)}`,
      ])
    );
  }
}
