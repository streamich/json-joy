import {Defer} from 'thingies/es2020/Defer';
import {RespEncoder} from '../../json-pack/resp/RespEncoder';
import {RespStreamingDecoder} from '../../json-pack/resp/RespStreamingDecoder';
import {ReconnectingSocket} from './ReconnectingSocket';
import {RedisClientCodecOpts} from '../types';
import {RedisCall, callNoRes} from './RedisCall';

export interface RedisClientOpts extends RedisClientCodecOpts {
  socket: ReconnectingSocket;
}

export class RedisClient {
  protected readonly socket: ReconnectingSocket;
  protected protocol: 2 | 3 = 2;
  protected readonly encoder: RespEncoder;
  protected readonly decoder: RespStreamingDecoder;
  protected readonly requests: RedisCall[] = [];
  protected readonly responses: Array<null | RedisCall> = [];
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
        const call = requests[i];
        encoder.writeCmd(call.args);
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
        const call = responses[i];
        if (call instanceof RedisCall) {
          decoder.tryUtf8 = !!call.utf8Res;
          const msg = decoder.read();
          if (msg === undefined) break;
          const res = call.response;
          if (msg instanceof Error) res.reject(msg); else res.resolve(msg);
        } else {
          // TODO: Use skipping here...
          decoder.tryUtf8 = false;
          const msg = decoder.read();
          if (msg === undefined) break;
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
      const args = pwd ? ['HELLO', protocol, 'AUTH', usr, pwd] : ['HELLO', protocol];
      await this.call(new RedisCall(args));
      this.protocol = protocol;
    } catch (error) {
      // This is likely protocol switching error. Try again with protocol 2.
      const args = usr ? ['AUTH', usr, pwd] : ['AUTH', pwd];
      await this.call(new RedisCall(args));
    }
  }

  public async call(call: RedisCall): Promise<unknown> {
    const noResponse = call.noRes;
    this.requests.push(call);
    this.responses.push(noResponse ? null : call);
    this.scheduleWrite();
    return noResponse ? void 0 : call.response.promise;
  }

  public async cmd(args: unknown[], opts?: Pick<RedisCall, 'utf8Res' | 'noRes'>): Promise<unknown> {
    const call = new RedisCall(args);
    if (opts) {
      if (opts.utf8Res) call.utf8Res = true;
      if (opts.noRes) call.noRes = true;
    }
    return this.call(call);
  }

  private callFnf(call: RedisCall): void {
    this.requests.push(call);
    this.responses.push(null);
    this.scheduleWrite();
  }

  public cmdFnF(args: unknown[]): void {
    this.callFnf(callNoRes(args));
  }
}
