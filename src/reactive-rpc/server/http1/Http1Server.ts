import * as http from 'http';
import * as net from 'net';
import {WsServerConnection} from '../ws/server/WsServerConnection';
import {WsFrameEncoder} from '../ws/codec/WsFrameEncoder';
import {Writer} from '../../../util/buffers/Writer';
import {RouteMatcher} from '../../../util/router/codegen';
import {Router} from '../../../util/router';

export interface Http1ServerOpts {
  server: http.Server;
}

export class Http1Server {
  public static start(opts: http.ServerOptions = {}, port = 8000): Http1Server {
    const rawServer = http.createServer(opts);
    rawServer.listen(port);
    const server = new Http1Server({server: rawServer});
    return server;
  }

  public readonly server: http.Server;
  protected readonly wsEncoder: WsFrameEncoder;
  protected wsRouter = new Router<WsEndpointDefinition>();
  protected wsMatcher: RouteMatcher<WsEndpointDefinition> = () => undefined;

  constructor(protected readonly opts: Http1ServerOpts) {
    this.server = opts.server;
    const writer = new Writer();
    this.wsEncoder = new WsFrameEncoder(writer);
  }

  public start(): void {
    const server = this.server;
    this.wsMatcher = this.wsRouter.compile();
    server.on('request', (req, res) => {
      console.log('REQUEST', req.method, req.url);
    });
    server.on('upgrade', this.onWsUpgrade);
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
  }

  private readonly onWsUpgrade = (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const route = req.url || '';
    console.log('route', route);
    const match = this.wsMatcher(route);
    console.log('match', match);
    if (!match) {
      socket.end();
      return;
    }
    const def = match.data;
    const headers = req.headers;
    const connection = new WsServerConnection(this.wsEncoder, socket as net.Socket);
    if (def.onUpgrade) def.onUpgrade(req, connection);
    else {
      const secWebSocketKey = headers['sec-websocket-key'] ?? '';
      const secWebSocketProtocol = headers['sec-websocket-protocol'] ?? '';
      const secWebSocketExtensions = headers['sec-websocket-extensions'] ?? '';
      connection.upgrade(secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions);
    }
    def.onConnect(connection);
  };

  public ws(def: WsEndpointDefinition): void {
    this.wsRouter.add(def.path, def);
  }
}

export interface WsEndpointDefinition {
  path: string;
  maxPayload?: number;
  onUpgrade?(req: http.IncomingMessage, connection: WsServerConnection): void;
  onConnect(connection: WsServerConnection): void;
}