import {Defer} from 'thingies/es2020/Defer';
import {RespEncoder} from '../json-pack/resp';
import {RespStreamingDecoder} from '../json-pack/resp/RespStreamingDecoder';
import {ReconnectingSocket} from './ReconnectingSocket';
import {RedisClientCodecOpts} from './types';

export interface RedisClientOpts extends RedisClientCodecOpts {
  socket: ReconnectingSocket;
}

export class RedisClient {
  protected readonly socket: ReconnectingSocket;
  protected protocol: 2 | 3 = 2;
  protected readonly encoder: RespEncoder;
  protected readonly decoder: RespStreamingDecoder;
  protected readonly requests: unknown[][] = [];
  protected readonly responses: Array<null | Defer<unknown>> = [];
  protected encodingTimer?: NodeJS.Immediate = undefined;
  protected decodingTimer?: NodeJS.Immediate = undefined;

  public readonly onProtocolError = new Defer<Error>();

  constructor(opts: RedisClientOpts) {
    const socket = this.socket = opts.socket;
    this.encoder = opts.encoder;
    const decoder = this.decoder = opts.decoder;
    socket.onData.listen((data) => {
      decoder.push(data);
      this.scheduleRead();
    });
    socket.onError.listen((err: Error) => {
      console.log('err', err);
    });
  }

  protected scheduleWrite() {
    if (this.encodingTimer) return;
    this.encodingTimer = setImmediate(this.handleWrite);
  }

  private readonly handleWrite = () => {
    try {
      this.encodingTimer = undefined;
      const requests = this.requests;
      const length = requests.length;
      if (length === 0) return;
      const encoder = this.encoder;
      for (let i = 0; i < length; i++) {
        const args = requests[i];
        encoder.writeCmd(args);
      }
      const buf = encoder.writer.flush();
      this.socket.write(buf);
      requests.splice(0, length);
    } catch (error) {
      // this.onProtocolError.reject(error);
      // TODO: Re-establish socket ...
    }
  };

  protected scheduleRead() {
    if (this.decodingTimer) return;
    this.decodingTimer = setImmediate(this.handleRead);
  }

  private readonly handleRead = () => {
    try {
      this.decodingTimer = undefined;
      const decoder = this.decoder;
      const responses = this.responses;
      const length = responses.length;
      let i = 0;
      for (; i < length; i++) {
        const defer = responses[i];
        if (defer instanceof Defer) {
          const msg = decoder.read();
          if (msg === undefined) break;
          if (msg instanceof Error) defer.reject(msg); else defer.resolve(msg);
        } else {
          // const length = decoder.skip();
          // if (!length) break;
        }
      }
      if (i > 0) responses.splice(0, i);
    } catch (error) {
      // this.onProtocolError.reject(error);
      // TODO: Re-establish socket ...
    }
  };

  public start() {
    this.socket.start();
  }

  public stop() {
    this.socket.stop();
  }

  /** Authenticate and negotiate protocol version. */
  public async hello(protocol: 2 | 3, pwd?: string, usr: string = ''): Promise<void> {
    try {
      await this.cmd(pwd ? ['HELLO', protocol, 'AUTH', usr, pwd] : ['HELLO', protocol]);
      this.protocol = protocol;
    } catch (error) {
      await this.cmd(usr ? ['AUTH', usr, pwd] : ['AUTH', pwd]);
    }
  }

  public async cmd(args: unknown[]): Promise<unknown> {
    const defer = new Defer<unknown>();
    this.requests.push(args);
    this.responses.push(defer);
    this.scheduleWrite();
    return defer.promise;
  }

  public cmdSync(args: unknown[]): void {
    this.requests.push(args);
    this.responses.push(null);
    this.scheduleWrite();
  }

  public async cmdUtf8(args: unknown[]): Promise<unknown> {
    throw new Error('TODO');
  }
}
