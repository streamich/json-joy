import {RespEncoder} from '../json-pack/resp';
import {RespStreamingDecoder} from '../json-pack/resp/RespStreamingDecoder';
import {ReconnectingSocket} from './ReconnectingSocket';

export interface RedisSocketOpts {
  socket: ReconnectingSocket;
  encoder: RespEncoder;
  decoder: RespStreamingDecoder;
}

export class RedisSocket {
  protected readonly socket: ReconnectingSocket;
  protected readonly encoder: RespEncoder;
  protected readonly decoder: RespStreamingDecoder;

  constructor(opts: RedisSocketOpts) {
    const socket = this.socket = opts.socket;
    this.encoder = opts.encoder;
    const decoder = this.decoder = opts.decoder;
    socket.onData.listen((data) => {
      decoder.push(data);
      let msg;
      while ((msg = decoder.read()) !== undefined) {
        console.log('data', msg);
      }
    });
    socket.onError.listen((err: Error) => {
      console.log('err', err);
    });
  }

  public start() {
    this.socket.start();
  }

  public stop() {
    this.socket.stop();
  }

  public write(buf: Uint8Array) {
    this.socket.write(buf);
  }

  public writeCmd(...args: unknown[]) {
    const buf = this.encoder.encodeCmd(args);
    this.socket.write(buf);
  }

  public writeCmdUtf8(...args: unknown[]) {
    const buf = this.encoder.encodeCmdUtf8(args);
    this.socket.write(buf);
  }
}
