import * as http from 'http';
import * as net from 'net';
import {WsServerConnection} from '../ws/server/WsServerConnection';
import {WsFrameEncoder} from '../ws/codec/WsFrameEncoder';
import {Writer} from '../../../util/buffers/Writer';
import {RouteMatcher} from '../../../util/router/codegen';
import {Router} from '../../../util/router';
import {Printable} from '../../../util/print/types';
import {printTree} from '../../../util/print/printTree';

export type Http1Handler = (params: null | string[], req: http.IncomingMessage, res: http.ServerResponse) => void;
export type Http1NotFoundHandler = (res: http.ServerResponse, req: http.IncomingMessage) => void;
export type Http1InternalErrorHandler = (res: http.ServerResponse, req: http.IncomingMessage) => void;

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
}

export class Http1Server implements Printable {
  public static start(opts: http.ServerOptions = {}, port = 8000): Http1Server {
    const rawServer = http.createServer(opts);
    rawServer.listen(port);
    const server = new Http1Server({server: rawServer});
    return server;
  }

  public readonly server: http.Server;

  constructor(protected readonly opts: Http1ServerOpts) {
    this.server = opts.server;
    const writer = new Writer();
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

  public oninternalerror: Http1InternalErrorHandler = (res) => {
    res.writeHead(500, 'Internal Server Error');
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

  private readonly onRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
    try {
      res.sendDate = false;
      const route = (req.method || '') + (req.url || '');
      const match = this.httpMatcher(route);
      if (!match) {
        this.onnotfound(res, req);
        return;
      }
      const params = match.params;
      const handler = match.data.handler;
      handler(params, req, res);
    } catch (error) {
      this.oninternalerror(res, req);
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

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    return `${this.constructor.name}` + printTree(tab, [
      (tab) => `HTTP/1.1 ${this.httpRouter.toString(tab)}`,
      (tab) => `WebSocket ${this.wsRouter.toString(tab)}`,
    ]);
  }
}
