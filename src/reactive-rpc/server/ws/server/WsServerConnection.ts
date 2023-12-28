import * as net from 'net';
import * as crypto from 'crypto';
import {WsCloseFrame, WsFrameDecoder, WsFrameHeader, WsFrameOpcode, WsPingFrame, WsPongFrame} from '../codec';
import {utf8Size} from '../../../../util/strings/utf8';
import {FanOut} from 'thingies/es2020/fanout';
import type {WsFrameEncoder} from '../codec/WsFrameEncoder';

export class WsServerConnection {
  public closed: boolean = false;
  public maxIncomingMessage: number = 2 * 1024 * 1024;
  public maxBackpressure: number = 2 * 1024 * 1024;

  /**
   * If this is not null, then the connection is receiving a stream: a sequence
   * of fragment frames.
   */
  protected stream: FanOut<Uint8Array> | null = null;

  public readonly defaultOnPing = (data: Uint8Array | null): void => {
    this.sendPong(data);
  };

  public onmessage: (data: Uint8Array, isUtf8: boolean) => void = () => {};
  public onping: (data: Uint8Array | null) => void = this.defaultOnPing;
  public onpong: (data: Uint8Array | null) => void = () => {};
  public onclose: (code: number, reason: string) => void = () => {};

  constructor(protected readonly encoder: WsFrameEncoder, public readonly socket: net.Socket, head: Buffer) {
    const decoder = new WsFrameDecoder();
    if (head.length) decoder.push(head);
    let currentFrame: WsFrameHeader | null = null;
    const handleData = (data: Uint8Array): void => {
      try {
        decoder.push(data);
        if (currentFrame) {
          const length = currentFrame.length;
          if (length <= decoder.reader.size()) {
            const buf = new Uint8Array(length);
            decoder.copyFrameData(currentFrame, buf, 0);
            const isText = currentFrame.opcode === WsFrameOpcode.TEXT;
            currentFrame = null;
            this.onmessage(buf, isText);
          }
        }
        while (true) {
          const frame = decoder.readFrameHeader();
          if (!frame) break;
          else if (frame instanceof WsPingFrame) this.onping(frame.data);
          else if (frame instanceof WsPongFrame) this.onpong(frame.data);
          else if (frame instanceof WsCloseFrame) this.onClose(frame.code, frame.reason);
          else if (frame instanceof WsFrameHeader) {
            if (this.stream) {
              if (frame.opcode !== WsFrameOpcode.CONTINUE) {
                this.onClose(1002, 'DATA');
                return;
              }
              throw new Error('streaming not implemented');
            }
            const length = frame.length;
            if (length > this.maxIncomingMessage) {
              this.onClose(1009, 'TOO_LARGE');
              return;
            }
            if (length <= decoder.reader.size()) {
              const buf = new Uint8Array(length);
              decoder.copyFrameData(frame, buf, 0);
              const isText = frame.opcode === WsFrameOpcode.TEXT;
              this.onmessage(buf, isText);
            } else {
              currentFrame = frame;
            }
          }
        }
      } catch (error) {
        this.onClose(1002, 'DATA');
      }
    };
    const handleClose = (hadError: boolean): void => {
      if (this.closed) return;
      this.onClose(hadError ? 1001 : 1002, 'END');
    };
    socket.on('data', handleData);
    socket.on('close', handleClose);
  }

  public close(): void {
    const code = 1000;
    const reason = 'CLOSE';
    const frame = this.encoder.encodeClose(reason, code);
    this.socket.write(frame);
    this.onClose(code, reason);
  }

  private onClose(code: number, reason: string): void {
    this.closed = true;
    if (this.__writeTimer) {
      clearImmediate(this.__writeTimer);
      this.__writeTimer = null;
    }
    const socket = this.socket;
    socket.removeAllListeners();
    if (!socket.destroyed) socket.destroy();
    this.onclose(code, reason);
  }

  // ----------------------------------------------------------- Handle upgrade

  public upgrade(secWebSocketKey: string, secWebSocketProtocol: string, secWebSocketExtensions: string): void {
    const accept = secWebSocketKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    const acceptSha1 = crypto.createHash('sha1').update(accept).digest('base64');
    this.socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        'Sec-WebSocket-Accept: ' +
        acceptSha1 +
        '\r\n' +
        '\r\n',
    );
  }

  // ---------------------------------------------------------- Write to socket

  private __buffer: Uint8Array[] = [];
  private __writeTimer: NodeJS.Immediate | null = null;

  public write(buf: Uint8Array): void {
    if (this.closed) return;
    this.__buffer.push(buf);
    if (this.__writeTimer) return;
    this.__writeTimer = setImmediate(() => {
      this.__writeTimer = null;
      const buffer = this.__buffer;
      this.__buffer = [];
      if (!buffer.length) return;
      const socket = this.socket;
      if (socket.writableLength > this.maxBackpressure) this.onClose(1009, 'BACKPRESSURE');
      // TODO: benchmark if corking helps
      socket.cork();
      for (let i = 0, len = buffer.length; i < len; i++) socket.write(buffer[i]);
      socket.uncork();
    });
  }

  // ------------------------------------------------- Write WebSocket messages

  public sendPing(data: Uint8Array | null): void {
    const frame = this.encoder.encodePing(data);
    this.write(frame);
  }

  public sendPong(data: Uint8Array | null): void {
    const frame = this.encoder.encodePong(data);
    this.write(frame);
  }

  public sendBinMsg(data: Uint8Array): void {
    const encoder = this.encoder;
    const header = encoder.encodeDataMsgHdrFast(data.length);
    this.write(header);
    this.write(data);
  }

  public sendTxtMsg(txt: string): void {
    const encoder = this.encoder;
    const writer = encoder.writer;
    const size = utf8Size(txt);
    encoder.writeHdr(1, WsFrameOpcode.TEXT, size, 0);
    writer.ensureCapacity(size);
    writer.utf8(txt);
    const buf = writer.flush();
    this.write(buf);
  }
}
