import {RespEncoderLegacy} from '../RespEncoderLegacy';

const encode = (value: unknown): string => {
  const encoder = new RespEncoderLegacy();
  const encoded = encoder.encode(value);
  return Buffer.from(encoded).toString();
};

test('can encode simple strings', () => {
  expect(encode('')).toBe('+\r\n');
  expect(encode('asdf')).toBe('+asdf\r\n');
});

test('can encode simple errors', () => {
  expect(encode(new Error('asdf'))).toBe('-asdf\r\n');
});

test('can encode integers', () => {
  expect(encode(0)).toBe(':0\r\n');
  expect(encode(123)).toBe(':123\r\n');
  expect(encode(-422469777)).toBe(':-422469777\r\n');
});

test('can encode bulk strings', () => {
  expect(encode('ab\nc')).toBe('$4\r\nab\nc\r\n');
  expect(encode(new Uint8Array([65]))).toBe('$1\r\nA\r\n');
});

test('can encode arrays', () => {
  expect(encode(['a', 1])).toBe('*2\r\n+a\r\n:1\r\n');
});

test('encodes null as nullable array', () => {
  expect(encode(null)).toBe('*-1\r\n');
});

test('encodes null in nested structure as nullable string', () => {
  expect(encode(['a', 'b', null])).toBe('*3\r\n+a\r\n+b\r\n$-1\r\n');
});

test('encodes booleans as strings', () => {
  expect(encode(true)).toBe('+TRUE\r\n');
  expect(encode(false)).toBe('+FALSE\r\n');
});

test('encodes floats as strings', () => {
  expect(encode(1.23)).toBe('+1.23\r\n');
});

test('encodes objects as 2-tuple arrays', () => {
  expect(encode({foo: 'bar'})).toBe('*2\r\n+foo\r\n+bar\r\n');
});
