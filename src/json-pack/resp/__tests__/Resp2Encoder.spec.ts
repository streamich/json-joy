import {Resp2Encoder} from '../Resp2Encoder';
const Parser = require('redis-parser');

const parse = (uint8: Uint8Array): unknown => {
  let result: unknown;
  const parser = new Parser({
    returnReply(reply: any, b: any, c: any) {
      result = reply;
    },
    returnError(err: any) {
      result = err;
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

describe('strings', () => {
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

  describe('.writeVerbatimStr()', () => {
    test('empty string', () => {
      const encoder = new Resp2Encoder();
      encoder.writeVerbatimStr('txt', '');
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('=0\r\ntxt:\r\n');
    });

    test('short string', () => {
      const encoder = new Resp2Encoder();
      encoder.writeVerbatimStr('txt', '');
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('=0\r\ntxt:\r\n');
    });
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

describe('errors', () => {
  test('can encode simple error', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(new Error('ERR'));
    expect(toStr(encoded)).toBe('-ERR\r\n');
    expect(parse(encoded)).toBeInstanceOf(Error);
    expect((parse(encoded) as any).message).toBe('ERR');
  });

  test('can encode bulk error', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(new Error('a\nb'));
    expect(toStr(encoded)).toBe('!3\r\na\nb\r\n');
    expect(parse(encoded)).toBeInstanceOf(Error);
  });
});

describe('integers', () => {
  test('zero', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(0);
    expect(toStr(encoded)).toBe(':0\r\n');
    expect(parse(encoded)).toBe(0);
  });

  test('positive integer', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(23423432543);
    expect(toStr(encoded)).toBe(':23423432543\r\n');
    expect(parse(encoded)).toBe(23423432543);
  });

  test('negative integer', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(-11111111);
    expect(toStr(encoded)).toBe(':-11111111\r\n');
    expect(parse(encoded)).toBe(-11111111);
  });
});

describe('arrays', () => {
  test('empty array', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode([]);
    expect(toStr(encoded)).toBe('*0\r\n');
    expect(parse(encoded)).toEqual([]);
  });

  test('array of numbers', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode([1, 2, 3]);
    expect(toStr(encoded)).toBe('*3\r\n:1\r\n:2\r\n:3\r\n');
    expect(parse(encoded)).toEqual([1, 2, 3]);
  });

  test('array of strings and numbers', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode([1, 'abc', 3]);
    expect(toStr(encoded)).toBe('*3\r\n:1\r\n$3\r\nabc\r\n:3\r\n');
    expect(parse(encoded)).toEqual([1, 'abc', 3]);
  });
});

describe('nulls', () => {
  test('a single null', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(null);
    expect(toStr(encoded)).toBe('_\r\n');
  });

  test('null in array', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode([1, 2, null]);
    expect(toStr(encoded)).toBe('*3\r\n:1\r\n:2\r\n_\r\n');
  });

  test('string null', () => {
    const encoder = new Resp2Encoder();
    encoder.writeNullStr();
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('$-1\r\n');
    expect(parse(encoded)).toEqual(null);
  });

  test('array null', () => {
    const encoder = new Resp2Encoder();
    encoder.writeNullArr();
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('*-1\r\n');
    expect(parse(encoded)).toEqual(null);
  });
});

describe('booleans', () => {
  test('true', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(true);
    expect(toStr(encoded)).toBe('#t\r\n');
  });

  test('false', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(false);
    expect(toStr(encoded)).toBe('#f\r\n');
  });
});

describe('doubles', () => {
  test('1.2', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(1.2);
    expect(toStr(encoded)).toBe(',1.2\r\n');
  });
});

describe('big numbers', () => {
  test('12345678901234567890', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(BigInt('12345678901234567890'));
    expect(toStr(encoded)).toBe('(12345678901234567890\r\n');
  });
});

describe('objects', () => {
  test('empty object', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode({});
    expect(toStr(encoded)).toBe('%0\r\n');
  });

  test('simple object', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode({foo: 123});
    expect(toStr(encoded)).toBe('%1\r\n$3\r\nfoo\r\n:123\r\n');
  });
});

describe('sets', () => {
  test('empty set', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(new Set());
    expect(toStr(encoded)).toBe('~0\r\n');
  });

  test('array of numbers', () => {
    const encoder = new Resp2Encoder();
    const encoded = encoder.encode(new Set([1]));
    expect(toStr(encoded)).toBe('~1\r\n:1\r\n');
  });
});
