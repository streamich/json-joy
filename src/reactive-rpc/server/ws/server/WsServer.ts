import * as http from 'http';

export class WsServer {
  public start(): void {
    const server = http.createServer();
    server.on('request', (req, res) => {
      console.log('REQUEST');
    });
    server.on('upgrade', (req, socket, head) => {
      console.log('UPGRADE');
    });
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    server.listen(8000);
  }
}
