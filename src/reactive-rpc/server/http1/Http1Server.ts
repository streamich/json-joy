import * as http from 'http';
import * as net from 'net';
import * as crypto from 'crypto';
import {WsServerConnection} from '../ws/server/WsServerConnection';
import {WsFrameEncoder} from '../ws/codec/WsFrameEncoder';
import {Writer} from '../../../util/buffers/Writer';

export interface Http1ServerOpts {
  server: http.Server;
}

export class Http1Server {
  public static start(opts: http.ServerOptions = {}, port = 8000): Http1Server {
    const server = http.createServer(opts);
    server.listen(port);
    return new Http1Server({server});
  }

  public readonly server: http.Server;
  protected readonly wsEncoder: WsFrameEncoder;

  constructor(protected readonly opts: Http1ServerOpts) {
    this.server = opts.server;
    const writer = new Writer();
    this.wsEncoder = new WsFrameEncoder(writer);
  }

  public start(): void {
    const server = this.server;
    server.on('request', (req, res) => {
      console.log('REQUEST');
    });
    server.on('upgrade', (req, socket, head) => {
      const accept = req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
      const acceptSha1 = crypto.createHash('sha1').update(accept).digest('base64');
      socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        'Sec-WebSocket-Accept: ' + acceptSha1 + '\r\n' +
        '\r\n'
      );
      const connection = new WsServerConnection(this.wsEncoder, socket as net.Socket);
      console.log('head', head);
      socket.on('data', (data) => {
        console.log('DATA', data);
      });
    });
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
  }
}
