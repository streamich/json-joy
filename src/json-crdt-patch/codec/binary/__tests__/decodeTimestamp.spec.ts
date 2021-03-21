import {LogicalTimestamp} from '../../../../json-crdt/clock';
import {encodeTimestamp} from '../encode';
import {decodeTimestamp} from '../decode';

test('decodes simple origin timestamps', () => {
  const buf = encodeTimestamp(new LogicalTimestamp(0, 0));
  const buf32 = new Uint32Array(buf);
  const ts = decodeTimestamp(buf32);
  expect(ts.sessionId).toBe(0);
  expect(ts.time).toBe(0);
});

test('decodes a basic timestamp', () => {
  const buf = encodeTimestamp(new LogicalTimestamp(5, 6));
  const buf32 = new Uint32Array(buf);
  const ts = decodeTimestamp(buf32);
  expect(ts.sessionId).toBe(5);
  expect(ts.time).toBe(6);
});

test('large time', () => {
  const buf = encodeTimestamp(new LogicalTimestamp(0x55, 0xBC_DE_F0));
  const buf32 = new Uint32Array(buf);
  const ts = decodeTimestamp(buf32);
  expect(ts.sessionId).toBe(0x55);
  expect(ts.time).toBe(0xBC_DE_F0);
});

test('large session ID', () => {
  const buf = encodeTimestamp(new LogicalTimestamp(0x55_44_33_22_11, 7));
  const buf32 = new Uint32Array(buf);
  const ts = decodeTimestamp(buf32);
  expect(ts.time).toBe(7);
  expect(ts.sessionId).toBe(0x55_44_33_22_11);
});

test('large timestamp', () => {
  const buf = encodeTimestamp(new LogicalTimestamp(0x12_34_56_78_9A, 0xBC_DE_F0));
  const buf32 = new Uint32Array(buf);
  const ts = decodeTimestamp(buf32);
  expect(ts.time).toBe(0xBC_DE_F0);
  expect(ts.sessionId).toBe(0x12_34_56_78_9A);
});
