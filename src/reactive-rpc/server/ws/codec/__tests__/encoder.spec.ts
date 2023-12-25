import {WsFrameDecoder} from '../WsFrameDecoder';
import {WsFrameEncoder} from '../WsFrameEncoder';
import {WsFrameOpcode} from '../constants';
import {WsCloseFrame, WsFrameHeader, WsPingFrame, WsPongFrame} from '../frames';

describe('control frames', () => {
  test('can encode an empty PING frame', () => {
    const encoder = new WsFrameEncoder();
    const encoded = encoder.encodePing(null);
    const decoder = new WsFrameDecoder();
    decoder.push(encoded);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPingFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PING);
    expect(frame.length).toBe(0);
    expect(frame.mask).toBeUndefined();
    expect((frame as WsPingFrame).data).toEqual(new Uint8Array(0));
  });

  test('can encode a PING frame with data', () => {
    const encoder = new WsFrameEncoder();
    const encoded = encoder.encodePing(new Uint8Array([1, 2, 3, 4]));
    const decoder = new WsFrameDecoder();
    decoder.push(encoded);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPingFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PING);
    expect(frame.length).toBe(4);
    expect(frame.mask).toBeUndefined();
    expect((frame as WsPingFrame).data).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  test('can encode an empty PONG frame', () => {
    const encoder = new WsFrameEncoder();
    const encoded = encoder.encodePong(null);
    const decoder = new WsFrameDecoder();
    decoder.push(encoded);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPongFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PONG);
    expect(frame.length).toBe(0);
    expect(frame.mask).toBeUndefined();
    expect((frame as WsPingFrame).data).toEqual(new Uint8Array(0));
  });

  test('can encode a PONG frame with data', () => {
    const encoder = new WsFrameEncoder();
    const encoded = encoder.encodePong(new Uint8Array([1, 2, 3, 4]));
    const decoder = new WsFrameDecoder();
    decoder.push(encoded);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPongFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PONG);
    expect(frame.length).toBe(4);
    expect(frame.mask).toBeUndefined();
    expect((frame as WsPingFrame).data).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  test('can encode an empty CLOSE frame', () => {
    const encoder = new WsFrameEncoder();
    const encoded = encoder.encodeClose('');
    const decoder = new WsFrameDecoder();
    decoder.push(encoded);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(0);
    expect(frame.mask).toBeUndefined();
  });

  test('can encode a CLOSE frame with code and reason', () => {
    const encoder = new WsFrameEncoder();
    const encoded = encoder.encodeClose('gg wp', 123);
    const decoder = new WsFrameDecoder();
    decoder.push(encoded);
    const frame = decoder.readFrameHeader()!;
    decoder.readCloseFrameData(frame as WsCloseFrame);
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(2 + 5);
    expect(frame.mask).toBeUndefined();
    expect((frame as WsCloseFrame).code).toBe(123);
    expect((frame as WsCloseFrame).reason).toBe('gg wp');
  });
});


describe('data frames', () => {
  test('can encode an empty BINARY data frame', () => {
    const encoder = new WsFrameEncoder();
    const encoded = encoder.encodeHdr(1, WsFrameOpcode.BINARY, 0, 0);
    const decoder = new WsFrameDecoder();
    decoder.push(encoded);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsFrameHeader);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.BINARY);
    expect(frame.length).toBe(0);
    expect(frame.mask).toBeUndefined();
  });

  test('can encode a BINARY data frame with data', () => {
    const encoder = new WsFrameEncoder();
    encoder.writeHdr(1, WsFrameOpcode.BINARY, 5, 0);
    encoder.writer.buf(new Uint8Array([1, 2, 3, 4, 5]), 5);
    const encoded = encoder.writer.flush();
    const decoder = new WsFrameDecoder();
    decoder.push(encoded);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsFrameHeader);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.BINARY);
    expect(frame.length).toBe(5);
    expect(frame.mask).toBeUndefined();
    const data = decoder.reader.buf(5);
    expect(data).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
  });

  test('can encode a fast BINARY data frame with data', () => {
    const encoder = new WsFrameEncoder();
    const data = new Uint8Array(333);
    encoder.writeDataMsgHdrFast(data.length);
    encoder.writer.buf(data, data.length);
    const encoded = encoder.writer.flush();
    const decoder = new WsFrameDecoder();
    decoder.push(encoded);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsFrameHeader);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.BINARY);
    expect(frame.length).toBe(data.length);
    expect(frame.mask).toBeUndefined();
    const data2 = decoder.reader.buf(frame.length);
    expect(data2).toEqual(data);
  });
  
  describe('can encode different message sizes', () => {
    const sizes = [0, 1, 2, 125, 126, 127, 128, 129, 255, 1234, 65535, 65536, 65537, 7777777, 2 ** 31 - 1];
    const encoder = new WsFrameEncoder();
    const decoder = new WsFrameDecoder();
    for (const size of sizes) {
      test(`size ${size}`, () => {
        const encoded = encoder.encodeHdr(1, WsFrameOpcode.BINARY, size, 0);
        decoder.push(encoded);
        const frame = decoder.readFrameHeader()!;
        expect(frame).toBeInstanceOf(WsFrameHeader);
        expect(frame.fin).toBe(1);
        expect(frame.opcode).toBe(WsFrameOpcode.BINARY);
        expect(frame.length).toBe(size);
      });
    }
  });
});

test.todo('test with masking');
test.todo('test with fragmented messages');
test.todo('test with fragmented messages and control frames in between');
