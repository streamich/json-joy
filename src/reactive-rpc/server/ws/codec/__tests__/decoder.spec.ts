import {WsFrameDecoder} from '../WsFrameDecoder';
import {WsFrameOpcode} from '../constants';
import {WsCloseFrame, WsPingFrame, WsPongFrame} from '../frames';

const {frame: WebSocketFrame} = require('websocket');

describe('data frames', () => {
  test('can read final text packet with mask', () => {
    const buf = Buffer.from(
      new Uint8Array([
        129,
        136, // Header
        136,
        35,
        93,
        205, // Mask
        231,
        85,
        56,
        191,
        177,
        19,
        109,
        253, // Payload
      ]),
    );
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(1);
    expect(frame.length).toBe(8);
    expect(frame.mask).toEqual([136, 35, 93, 205]);
    expect(dst.toString()).toBe('over9000');
  });

  test('can read final text packet without mask', () => {
    const buf = Buffer.from(new Uint8Array([129, 8, 111, 118, 101, 114, 57, 48, 48, 48]));
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(1);
    expect(frame.length).toBe(8);
    expect(frame.mask).toEqual(undefined);
    expect(dst.toString()).toBe('over9000');
  });

  test('can read final masked text frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('hello world');
    frame0.opcode = 1;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(1);
    expect(frame.length).toBe(11);
    expect(frame.mask).toBeInstanceOf(Array);
    expect(dst.toString()).toBe('hello world');
  });

  test('can read non-final masked text frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = false;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('hello world');
    frame0.opcode = 1;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(0);
    expect(frame.opcode).toBe(1);
    expect(frame.length).toBe(11);
    expect(frame.mask).toBeInstanceOf(Array);
    expect(dst.toString()).toBe('hello world');
  });

  test('can read non-final masked binary frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = false;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('hello world');
    frame0.opcode = 2;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(0);
    expect(frame.opcode).toBe(2);
    expect(frame.length).toBe(11);
    expect(frame.mask).toBeInstanceOf(Array);
    expect(dst.toString()).toBe('hello world');
  });

  test('can read non-final non-masked binary frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = false;
    frame0.mask = false;
    frame0.binaryPayload = Buffer.from('hello world');
    frame0.opcode = 2;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(0);
    expect(frame.opcode).toBe(2);
    expect(frame.length).toBe(11);
    expect(frame.mask).toBe(undefined);
    expect(dst.toString()).toBe('hello world');
  });

  test('can decode a frame with a continuation frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = false;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('hello ');
    frame0.opcode = 2;
    const frame1 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame1.fin = true;
    frame1.mask = true;
    frame1.binaryPayload = Buffer.from('world');
    frame1.opcode = 0;
    const buf0 = frame0.toBuffer();
    const buf1 = frame1.toBuffer();
    const dst = Buffer.alloc(11);
    const decoder = new WsFrameDecoder();
    decoder.push(buf0);
    const header0 = decoder.readFrameHeader()!;
    let remaining0 = header0.length;
    remaining0 = decoder.readFrameData(header0, remaining0, dst, 0);
    expect(header0.fin).toBe(0);
    decoder.push(buf1);
    const header1 = decoder.readFrameHeader()!;
    let remaining1 = header1.length;
    remaining1 = decoder.readFrameData(header1, remaining1, dst, 6);
    expect(header1.fin).toBe(1);
    expect(dst.toString()).toBe('hello world');
  });
});

describe('control frames', () => {
  test('can read CLOSE frame with masked UTF-8 payload', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('something 🤷‍♂️ happened');
    frame0.closeStatus = 1000;
    frame0.opcode = WsFrameOpcode.CLOSE;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(frame0.binaryPayload.length + 2);
    expect(frame.mask).toBeInstanceOf(Array);
    expect((frame as WsCloseFrame).code).toBe(0);
    expect((frame as WsCloseFrame).reason).toBe('');
    decoder.readCloseFrameData(frame as WsCloseFrame);
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(frame0.binaryPayload.length + 2);
    expect(frame.mask).toBeInstanceOf(Array);
    expect((frame as WsCloseFrame).code).toBe(1000);
    expect((frame as WsCloseFrame).reason).toBe('something 🤷‍♂️ happened');
  });

  test('can read CLOSE frame with un-masked UTF-8 payload', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = false;
    frame0.binaryPayload = Buffer.from('something 🤷‍♂️ happened');
    frame0.closeStatus = 1000;
    frame0.opcode = WsFrameOpcode.CLOSE;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(frame0.binaryPayload.length + 2);
    expect(frame.mask).toBe(undefined);
    expect((frame as WsCloseFrame).code).toBe(0);
    expect((frame as WsCloseFrame).reason).toBe('');
    decoder.readCloseFrameData(frame as WsCloseFrame);
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(frame0.binaryPayload.length + 2);
    expect(frame.mask).toBe(undefined);
    expect((frame as WsCloseFrame).code).toBe(1000);
    expect((frame as WsCloseFrame).reason).toBe('something 🤷‍♂️ happened');
  });

  test('can read PING frame with masked bytes', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = true;
    frame0.binaryPayload = new Uint8Array([1, 2, 3]);
    frame0.opcode = WsFrameOpcode.PING;
    const buf0 = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf0);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPingFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PING);
    expect(frame.length).toBe(3);
    expect(frame.mask).toBeInstanceOf(Array);
    expect((frame as WsPingFrame).data).toEqual(new Uint8Array([1, 2, 3]));
  });

  test('can read PING frame with un-masked bytes', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = false;
    frame0.binaryPayload = Buffer.from(new Uint8Array([1, 2, 3]));
    frame0.opcode = WsFrameOpcode.PING;
    const buf0 = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf0);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPingFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PING);
    expect(frame.length).toBe(3);
    expect(frame.mask).toBe(undefined);
    expect((frame as WsPingFrame).data).toEqual(new Uint8Array([1, 2, 3]));
  });

  test('can read PONG frame with masked bytes', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = true;
    frame0.binaryPayload = new Uint8Array([1, 2, 3]);
    frame0.opcode = WsFrameOpcode.PONG;
    const buf0 = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf0);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPongFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PONG);
    expect(frame.length).toBe(3);
    expect(frame.mask).toBeInstanceOf(Array);
    expect((frame as WsPongFrame).data).toEqual(new Uint8Array([1, 2, 3]));
  });

  test('can read PONG frame with un-masked bytes', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = false;
    frame0.binaryPayload = Buffer.from(new Uint8Array([1, 2, 3]));
    frame0.opcode = WsFrameOpcode.PONG;
    const buf0 = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf0);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPongFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PONG);
    expect(frame.length).toBe(3);
    expect(frame.mask).toBe(undefined);
    expect((frame as WsPongFrame).data).toEqual(new Uint8Array([1, 2, 3]));
  });
});
