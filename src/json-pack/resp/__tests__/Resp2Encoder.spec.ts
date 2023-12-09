import {Resp2Encoder} from '../Resp2Encoder';
const Parser = require('redis-parser');

const parse = (uint8: Uint8Array): unknown => {
  let result: unknown;
  const parser = new Parser({
    returnReply(reply: any, b: any, c: any) {
      result = reply;
    },
    returnError(err: any) {
      result = new Error(err);
    },
    returnFatalError(err: any) {
      result = err;
    },
    returnBuffers: false,
    stringNumbers: false,
  });
  parser.execute(Buffer.from(uint8));
  return result;
};

const toStr = (uint8: Uint8Array): string => {
  return Buffer.from(uint8).toString();
};

describe('.writeSimpleStr()', () => {
  test('empty string', () => {
    const encoder = new Resp2Encoder();
    encoder.writeSimpleStr('');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('+\r\n');
    expect(parse(encoded)).toBe('');
  });

  test('short string', () => {
    const encoder = new Resp2Encoder();
    encoder.writeSimpleStr('abc!');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('+abc!\r\n');
    expect(parse(encoded)).toBe('abc!');
  });
});

describe('.writeBulkStr()', () => {
  test('empty string', () => {
    const encoder = new Resp2Encoder();
    encoder.writeBulkStr('');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('$0\r\n\r\n');
    expect(parse(encoded)).toBe('');
  });

  test('short string', () => {
    const encoder = new Resp2Encoder();
    encoder.writeBulkStr('abc!');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('$4\r\nabc!\r\n');
    expect(parse(encoded)).toBe('abc!');
  });
});

describe('.writeAsciiString()', () => {
  test('can write "OK"', () => {
    const encoder = new Resp2Encoder();
    encoder.writeAsciiStr('OK');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('+OK\r\n');
    expect(parse(encoded)).toBe('OK');
  });
});
