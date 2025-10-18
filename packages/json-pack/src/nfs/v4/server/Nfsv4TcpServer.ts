import * as net from 'net';
import {Nfsv4Connection} from './Nfsv4Connection';
import type {Logger} from './types';
import type {Nfsv4Operations} from './operations/Nfsv4Operations';

/* tslint:disable:no-console */

const PORT = Number(process.env.NFS_PORT) || Number(process.env.PORT) || 2049;
const HOST = process.env.NFS_HOST
  ? String(process.env.NFS_HOST)
  : process.env.HOST
    ? String(process.env.HOST)
    : '127.0.0.1';

export interface Nfsv4TcpServerOpts {
  ops: Nfsv4Operations;
  port?: number;
  host?: string;
  debug?: boolean;
  logger?: Logger;
  onError?: (err: Error) => void;
  stopOnSigint?: boolean;
}

export class Nfsv4TcpServer {
  public static start(opts: Nfsv4TcpServerOpts): void {
    const server = new Nfsv4TcpServer(opts);
    server.start().catch(console.error);
  }

  public readonly server: net.Server;
  public port: number = PORT;
  public host: string = HOST;
  public debug: boolean = false;
  public logger: Logger;
  private sigintHandler?: () => void;

  constructor(opts: Nfsv4TcpServerOpts) {
    this.port = opts.port ?? PORT;
    this.host = opts.host ?? HOST;
    this.debug = opts.debug ?? false;
    this.logger = opts.logger ?? console;
    const ops = opts.ops;
    const server = (this.server = new net.Server());
    server.on('connection', (socket) => {
      if (this.debug) this.logger.log('New connection from', socket.remoteAddress, 'port', socket.remotePort);
      new Nfsv4Connection({
        duplex: socket,
        ops,
        debug: this.debug,
        logger: this.logger,
      });
    });
    server.on(
      'error',
      opts.onError ??
        ((err) => {
          if (this.debug) this.logger.error('Server error:', err.message);
          process.exit(1);
        }),
    );
    if (opts.stopOnSigint ?? true) {
      this.sigintHandler = () => {
        if (this.debug) this.logger.log('\nShutting down NFSv4 server...');
        this.cleanup();
        process.exit(0);
      };
      process.on('SIGINT', this.sigintHandler);
    }
  }

  private cleanup(): void {
    if (this.sigintHandler) {
      process.off('SIGINT', this.sigintHandler);
      this.sigintHandler = undefined;
    }
    this.server.close((err) => {
      if (this.debug && err) this.logger.error('Error closing server:', err);
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.cleanup();
      this.server.close(() => {
        if (this.debug) this.logger.log('NFSv4 server closed');
        resolve();
      });
    });
  }

  public start(port: number = this.port, host: string = this.host): Promise<void> {
    if (this.debug) this.logger.log(`Starting NFSv4 TCP server on ${host}:${port}...`);
    return new Promise((resolve, reject) => {
      const onError = (err: unknown) => reject(err);
      const server = this.server;
      server.on('error', onError);
      server.listen(port, host, () => {
        if (this.debug) this.logger.log(`NFSv4 TCP server listening on ${host}:${port}`);
        server.off('error', onError);
        resolve();
      });
    });
  }
}
