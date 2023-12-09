import {Resp2Encoder} from '../Resp2Encoder';
const Parser = require('redis-parser');

const parse = (uint8: Uint8Array) => {
  const parser = new Parser({
    returnReply(reply: any) {
      console.log('returnReply', reply);
    },
    returnError(err: any) {
      console.log('returnError', err);
    },
    returnFatalError(err: any) {
      console.log('returnFatalError', err);
    },
    returnBuffers: false,
    stringNumbers: false,
  });
  parser.execute(uint8);
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
  });

  test('short string', () => {
    const encoder = new Resp2Encoder();
    encoder.writeSimpleStr('abc!');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('+abc!\r\n');
  });
});

describe('.writeBulkStr()', () => {
  test('empty string', () => {
    const encoder = new Resp2Encoder();
    encoder.writeBulkStr('');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('$0\r\n\r\n');
  });

  test('short string', () => {
    const encoder = new Resp2Encoder();
    encoder.writeBulkStr('abc!');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('$4\r\nabc!\r\n');
  });
});

describe('.writeAsciiString()', () => {
  test('can write "OK"', () => {
    const encoder = new Resp2Encoder();
    encoder.writeAsciiStr('OK');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('+OK\r\n');
  });
});