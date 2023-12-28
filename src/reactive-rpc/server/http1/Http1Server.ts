import * as http from 'http';
import * as net from 'net';
import {WsServerConnection} from '../ws/server/WsServerConnection';
import {WsFrameEncoder} from '../ws/codec/WsFrameEncoder';
import {Writer} from '../../../util/buffers/Writer';
import {RouteMatcher} from '../../../util/router/codegen';
import {Router} from '../../../util/router';
import {Printable} from '../../../util/print/types';
import {printTree} from '../../../util/print/printTree';
import {PayloadTooLarge} from './errors';
import {findTokenInText} from './util';
import {Http1ConnectionContext} from './context';
import {RpcCodecs} from '../../common/codec/RpcCodecs';
import {Codecs} from '../../../json-pack/codecs/Codecs';
import {RpcMessageCodecs} from '../../common/codec/RpcMessageCodecs';
import {NullObject} from '../../../util/NullObject';

export type Http1Handler = (ctx: Http1ConnectionContext) => void | Promise<void>;
export type Http1NotFoundHandler = (res: http.ServerResponse, req: http.IncomingMessage) => void;
export type Http1InternalErrorHandler = (error: unknown, res: http.ServerResponse, req: http.IncomingMessage) => void;

export class Http1EndpointMatch {
  constructor(public readonly handler: Http1Handler) {}
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
}

export interface WsEndpointDefinition {
  path: string;
  maxPayload?: number;
  onUpgrade?(req: http.IncomingMessage, connection: WsServerConnection): void;
  onConnect(connection: WsServerConnection, req: http.IncomingMessage): void;
}

export interface Http1ServerOpts {
  server: http.Server;
  codecs?: RpcCodecs;
  writer?: Writer;
}

export class Http1Server implements Printable {
  public static start(opts: http.ServerOptions = {}, port = 8000): Http1Server {
    const rawServer = http.createServer(opts);
    rawServer.listen(port);
    const server = new Http1Server({server: rawServer});
    return server;
  }

  public readonly codecs: RpcCodecs;
  public readonly server: http.Server;

  constructor(protected readonly opts: Http1ServerOpts) {
    this.server = opts.server;
    const writer = opts.writer ?? new Writer();
    this.codecs = opts.codecs ?? new RpcCodecs(opts.codecs ?? new Codecs(writer), new RpcMessageCodecs());
    this.wsEncoder = new WsFrameEncoder(writer);
  }

  public start(): void {
    const server = this.server;
    this.httpMatcher = this.httpRouter.compile();
    this.wsMatcher = this.wsRouter.compile();
    server.on('request', this.onRequest);
    server.on('upgrade', this.onWsUpgrade);
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
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

  public route(def: Http1EndpointDefinition): void {
    let path = def.path;
    if (path[0] !== '/') path = '/' + path;
    const method = def.method ? def.method.toUpperCase() : 'GET';
    const route = method + path;
    Number(route);
    const match = new Http1EndpointMatch(def.handler);
    this.httpRouter.add(route, match);
  }

  private readonly onRequest = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    try {
      res.sendDate = false;
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
      const ctx = new Http1ConnectionContext(
        req,
        res,
        path,
        query,
        ip,
        token,
        match.params,
        new NullObject(),
        codecs.value.json,
        codecs.value.json,
        codecs.messages.compact,
      );
      const headers = req.headers;
      const contentType = headers['content-type'];
      if (typeof contentType === 'string') ctx.setCodecs(contentType, codecs);
      const handler = match.data.handler;
      await handler(ctx);
    } catch (error) {
      this.oninternalerror(error, res, req);
    }
  };

  // --------------------------------------------------------------- WebSockets

  protected readonly wsEncoder: WsFrameEncoder;
  protected readonly wsRouter = new Router<WsEndpointDefinition>();
  protected wsMatcher: RouteMatcher<WsEndpointDefinition> = () => undefined;

  private readonly onWsUpgrade = (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const route = req.url || '';
    const match = this.wsMatcher(route);
    if (!match) {
      socket.end();
      return;
    }
    const def = match.data;
    const headers = req.headers;
    const connection = new WsServerConnection(this.wsEncoder, socket as net.Socket, head);
    if (def.onUpgrade) def.onUpgrade(req, connection);
    else {
      const secWebSocketKey = headers['sec-websocket-key'] ?? '';
      const secWebSocketProtocol = headers['sec-websocket-protocol'] ?? '';
      const secWebSocketExtensions = headers['sec-websocket-extensions'] ?? '';
      connection.upgrade(secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions);
    }
    def.onConnect(connection, req);
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
    let token: string = '';
    let text: string = '';
    const headers = req.headers;
    let header: string | string[] | undefined;
    header = headers['authorization'];
    text = typeof header === 'string' ? header : header?.[0] ?? '';
    if (text) token = findTokenInText(text);
    if (token) return token;
    text = req.url || '';
    if (text) token = findTokenInText(text);
    if (token) return token;
    header = headers['cookie'];
    text = typeof header === 'string' ? header : header?.[0] ?? '';
    if (text) token = findTokenInText(text);
    if (token) return token;
    header = headers['sec-websocket-protocol'];
    text = typeof header === 'string' ? header : header?.[0] ?? '';
    if (text) token = findTokenInText(text);
    return token;
  }

  // ------------------------------------------------------- High-level routing

  public enableHttpPing(path: string = '/ping') {
    this.route({
      path,
      handler: (ctx) => {
        ctx.res.end('pong');
      },
    });
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    return (
      `${this.constructor.name}` +
      printTree(tab, [
        (tab) => `HTTP ${this.httpRouter.toString(tab)}`,
        (tab) => `WebSocket ${this.wsRouter.toString(tab)}`,
      ])
    );
  }
}
