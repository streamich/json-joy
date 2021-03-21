import {LogicalTimestamp} from '../../../../json-crdt/clock';
import {encodeTimestamp} from '../encode';
import {decodeTimestamp} from '../decode';

test('decodes simple origin timestamps', () => {
  const buf = new Uint32Array(encodeTimestamp(new LogicalTimestamp(0, 0)));
  const ts = decodeTimestamp(new Uint8Array(buf.buffer), 0);
  expect(ts.sessionId).toBe(0);
  expect(ts.time).toBe(0);
});

test('decodes a basic timestamp', () => {
  const buf = new Uint32Array(encodeTimestamp(new LogicalTimestamp(5, 6)));
  const ts = decodeTimestamp(new Uint8Array(buf.buffer), 0);
  expect(ts.sessionId).toBe(5);
  expect(ts.time).toBe(6);
});

test('decodes a basic timestamp - 2', () => {
  const buf = new Uint8Array([0, 3, 0, 0, 0, 5, 0, 0, 0]);
  const ts = decodeTimestamp(new Uint8Array(buf.buffer), 1);
  expect(ts.sessionId).toBe(3);
  expect(ts.time).toBe(5);
});

test('large time', () => {
  const buf = new Uint32Array(encodeTimestamp(new LogicalTimestamp(0x55, 0xBC_DE_F0)));
  const ts = decodeTimestamp(new Uint8Array(buf.buffer), 0);
  expect(ts.sessionId).toBe(0x55);
  expect(ts.time).toBe(0xBC_DE_F0);
});

test('large session ID', () => {
  const buf = new Uint32Array(encodeTimestamp(new LogicalTimestamp(0x55_44_33_22_11, 7)));
  const ts = decodeTimestamp(new Uint8Array(buf.buffer), 0);
  expect(ts.time).toBe(7);
  expect(ts.sessionId).toBe(0x55_44_33_22_11);
});

test('large timestamp', () => {
  const buf = new Uint32Array(encodeTimestamp(new LogicalTimestamp(0x12_34_56_78_9A, 0xBC_DE_F0)));
  const ts = decodeTimestamp(new Uint8Array(buf.buffer), 0);
  expect(ts.time).toBe(0xBC_DE_F0);
  expect(ts.sessionId).toBe(0x12_34_56_78_9A);
});
