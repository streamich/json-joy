import * as crypto from 'crypto';
import * as stream from 'stream';
import {utf8Size} from '@jsonjoy.com/util/lib/strings/utf8';
import {listToUint8} from '@jsonjoy.com/util/lib/buffers/concat';
import {WsCloseFrame, WsFrameDecoder, WsFrameHeader, WsFrameOpcode, WsPingFrame, WsPongFrame} from '../codec';
import type {WsFrameEncoder} from '../codec/WsFrameEncoder';

export type WsServerConnectionSocket = stream.Duplex;

export class WsServerConnection {
  public closed: boolean = false;
  public maxIncomingMessage: number = 2 * 1024 * 1024;
  public maxBackpressure: number = 2 * 1024 * 1024;

  public readonly defaultOnPing = (data: Uint8Array | null): void => {
    this.sendPong(data);
  };

  private _fragments: Uint8Array[] = [];
  private _fragmentsSize: number = 0;
  public readonly defaultOnFragment = (isLast: boolean, data: Uint8Array, isUtf8: boolean): void => {
    const fragments = this._fragments;
    this._fragmentsSize += data.length;
    if (this._fragmentsSize > this.maxIncomingMessage) {
      this.onClose(1009, 'TOO_LARGE');
      return;
    }
    fragments.push(data);
    if (!isLast) return;
    this._fragments = [];
    this._fragmentsSize = 0;
    const message = listToUint8(fragments);
    this.onmessage(message, isUtf8);
  };

  public onmessage: (data: Uint8Array, isUtf8: boolean) => void = () => {};
  public onfragment: (isLast: boolean, data: Uint8Array, isUtf8: boolean) => void = this.defaultOnFragment;
  public onping: (data: Uint8Array | null) => void = this.defaultOnPing;
  public onpong: (data: Uint8Array | null) => void = () => {};
  public onclose: (code: number, reason: string) => void = () => {};

  constructor(
    protected readonly encoder: WsFrameEncoder,
    public readonly socket: WsServerConnectionSocket,
  ) {
    const decoder = new WsFrameDecoder();
    let currentFrameHeader: WsFrameHeader | null = null;
    let fragmentStartFrameHeader: WsFrameHeader | null = null;
    const handleData = (data: Uint8Array): void => {
      try {
        decoder.push(data);
        main: while (true) {
          if (currentFrameHeader instanceof WsFrameHeader) {
            const length = currentFrameHeader.length;
            if (length > this.maxIncomingMessage) {
              this.onClose(1009, 'TOO_LARGE');
              return;
            }
            if (length <= decoder.reader.size()) {
              const buf = new Uint8Array(length);
              decoder.copyFrameData(currentFrameHeader, buf, 0);
              if (fragmentStartFrameHeader instanceof WsFrameHeader) {
                const isText = fragmentStartFrameHeader.opcode === WsFrameOpcode.TEXT;
                const isLast = currentFrameHeader.fin === 1;
                currentFrameHeader = null;
                if (isLast) fragmentStartFrameHeader = null;
                this.onfragment(isLast, buf, isText);
              } else {
                const isText = currentFrameHeader.opcode === WsFrameOpcode.TEXT;
                currentFrameHeader = null;
                this.onmessage(buf, isText);
              }
            } else break;
          }
          const frame = decoder.readFrameHeader();
          if (!frame) break;
          if (frame instanceof WsPingFrame) {
            this.onping(frame.data);
            continue main;
          }
          if (frame instanceof WsPongFrame) {
            this.onpong(frame.data);
            continue main;
          }
          if (frame instanceof WsCloseFrame) {
            decoder.readCloseFrameData(frame);
            this.onClose(frame.code, frame.reason);
            continue main;
          }
          if (frame instanceof WsFrameHeader) {
            if (fragmentStartFrameHeader) {
              if (frame.opcode !== WsFrameOpcode.CONTINUE) {
                this.onClose(1002, 'DATA');
                return;
              }
              currentFrameHeader = frame;
            }
            if (frame.fin === 0) {
              fragmentStartFrameHeader = frame;
              currentFrameHeader = frame;
              continue main;
            }
            currentFrameHeader = frame;
            continue main;
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
    // prettier-ignore
    this.socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        'Sec-WebSocket-Accept: ' + acceptSha1 + '\r\n' +
        (secWebSocketProtocol ? 'Sec-WebSocket-Protocol: ' + secWebSocketProtocol + '\r\n' : '') +
        // 'Sec-WebSocket-Extensions: ""\r\n' +
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
