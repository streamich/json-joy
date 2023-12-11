import * as net from 'net';
import {FanOut} from 'thingies/es2020/fanout';

type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export interface ReconnectingSocketOpts {
  /**
   * New socket constructor.
   * @returns A new TCP or TLS socket.
   */
  createSocket: () => net.Socket;

  /**
   * Number of milliseconds to wait before attempting to reconnect for the
   * first time. Defaults to 1 second.
   */
  minTimeout: number;

  /**
   * Maximum number of milliseconds between reconnection attempts. Defaults
   * to 3 minutes.
   */
  maxTimeout: number;

  /**
   * Number of milliseconds to wait before giving up on a connection attempt.
   */
  connectionTimeout: number;
}

/**
 * Represents a TCP or TLS socket that automatically reconnects when the
 * connection is lost. Automatically creates a new socket connection after
 * a timeout.
 * 
 * Use can specify the minimum and maximum timeout between reconnection
 * attempts. Each reconnection attempt increases the timeout by 2x until
 * the maximum timeout is reached.
 * 
 * @todo Add connection timeout...
 */
export class ReconnectingSocket {
  public socket?: net.Socket;
  protected readonly opts: ReconnectingSocketOpts;
  protected retryCount = 0;
  protected retryTimeout = 0;
  protected retryTimer?: NodeJS.Timeout;
  protected connectionTimeoutTimer?: NodeJS.Timeout;
  protected stopped = false;
  protected reffed = true;

  public readonly onReady = new FanOut<void>();
  public readonly onData = new FanOut<Buffer>();
  public readonly onDrain = new FanOut<void>();
  public readonly onError = new FanOut<Error>();

  constructor(opts: PartialExcept<ReconnectingSocketOpts, 'createSocket'>) {
    this.opts = {
      minTimeout: 1000,
      maxTimeout: 1000 * 60 * 3,
      connectionTimeout: 1000 * 10,
      ...opts,
    };
  }

  private getSocket(): net.Socket {
    const socket = this.socket;
    if (!socket) throw new Error('NOT_CONNECTED');
    return socket;
  }

  private readonly handleConnect = () => {
    // Clear the connection timeout timer.
    clearTimeout(this.connectionTimeoutTimer);
    this.connectionTimeoutTimer = undefined;

    // Reset retry count after some time has passed.
    if (this.retryCount !== 0) {
      setTimeout(() => {
        this.retryCount = 0;
      }, this.getRetryTimeout());
    }
  };
  private readonly handleReady = () => {
    this.onReady.emit();
  };
  private readonly handleData = (data: Buffer) => this.onData.emit(data);
  private readonly handleDrain = () => this.onDrain.emit();
  private readonly handleError = (err: Error) => this.onError.emit(err);
  private readonly handleClose = () => {
    if (this.stopped) return;
    this.retry();
  };
  private readonly handleTimeout = () => {
    this.socket?.destroy();
  };

  public start() {
    this.stopped = false;
    if (this.socket) throw new Error('ALREADY_CONNECTED');
    const socket = this.socket = this.opts.createSocket();
    socket.allowHalfOpen = false;
    socket.on('connect', this.handleConnect);
    socket.on('ready', this.handleReady);
    socket.on('data', this.handleData);
    socket.on('drain', this.handleDrain);
    socket.on('error', this.handleError);
    socket.on('close', this.handleClose);
    socket.on('timeout', this.handleTimeout);
    // socket.on('end', () => {});
    // socket.on('lookup', (err: Error, address: string, family: string | number, host: string) => {});

    // Raise an error if the connection takes too long.
    this.connectionTimeoutTimer = setTimeout(() => {
      this.connectionTimeoutTimer = undefined;
      this.socket?.destroy();
    }, this.opts.connectionTimeout);
  }

  public stop(): void {
    this.stopped = true;
    this.getSocket().destroySoon();
  }

  protected retry(): void {
    if (this.retryTimer) return;
    const retryTimeout = this.getRetryTimeout();
    this.retryCount++;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      this.start();
    }, retryTimeout);
    if (this.reffed) this.retryTimer.ref(); else this.retryTimer.unref();
  }

  protected getRetryTimeout(): number {
    const {minTimeout, maxTimeout} = this.opts;
    const timeout = minTimeout * (2 ** Math.min(this.retryCount, 12));
    const timeoutCapped = Math.max(Math.min(timeout, maxTimeout), minTimeout);
    const jitter = Math.round((Math.random() - 0.5) * timeoutCapped * 0.2);
    return Math.max(timeoutCapped + jitter, minTimeout);
  }

  public write(data: string | Uint8Array, cb?: (err?: Error) => void): boolean {
    const socket = this.getSocket();
    return socket.write(data, cb);
  }

  public ref() {
    this.reffed = true;
    this.socket?.ref();
  }

  public unref() {
    this.reffed = false;
    this.socket?.unref();
  }
}
