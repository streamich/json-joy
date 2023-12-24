import {WebsocketDecoder} from "../WebsocketDecoder";

const {frame: WebSocketFrame} = require('websocket');

test('can read final text packet with mask', () => {
  // const frame = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
  // frame.mask = true;
  // frame.binaryPayload = Buffer.from('hello');
  // frame.opcode = 1;
  // const buf = frame.toBuffer();
  // const buf = Buffer.from(new Uint8Array([129, 8, 118, 101, 114, 57, 48, 48, 48]));
  const buf = Buffer.from(new Uint8Array([
    129, 136, // Header
    136, 35, 93, 205, // Mask
    231, 85, 56, 191, 177, 19, 109, 253, // Payload
  ]));
  const decoder = new WebsocketDecoder();
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
  const decoder = new WebsocketDecoder();
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
  const decoder = new WebsocketDecoder();
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
  const decoder = new WebsocketDecoder();
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
  const decoder = new WebsocketDecoder();
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
  const decoder = new WebsocketDecoder();
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
