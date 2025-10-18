import {bufferToUint8Array} from '@jsonjoy.com/buffers/lib/bufferToUint8Array';
import {RespEncoder} from '../RespEncoder';
import {RespVerbatimString} from '../extensions';
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
      const encoder = new RespEncoder();
      encoder.writeSimpleStr('');
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('+\r\n');
      expect(parse(encoded)).toBe('');
    });

    test('short string', () => {
      const encoder = new RespEncoder();
      encoder.writeSimpleStr('abc!');
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('+abc!\r\n');
      expect(parse(encoded)).toBe('abc!');
    });
  });

  describe('.writeBulkStr()', () => {
    test('empty string', () => {
      const encoder = new RespEncoder();
      encoder.writeBulkStr('');
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('$0\r\n\r\n');
      expect(parse(encoded)).toBe('');
    });

    test('short string', () => {
      const encoder = new RespEncoder();
      encoder.writeBulkStr('abc!');
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('$4\r\nabc!\r\n');
      expect(parse(encoded)).toBe('abc!');
    });
  });

  describe('.writeVerbatimStr()', () => {
    test('empty string', () => {
      const encoder = new RespEncoder();
      encoder.writeVerbatimStr('txt', '');
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('=4\r\ntxt:\r\n');
    });

    test('short string', () => {
      const encoder = new RespEncoder();
      encoder.writeVerbatimStr('txt', 'asdf');
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('=8\r\ntxt:asdf\r\n');
    });

    test('can encode verbatim string using RespVerbatimString', () => {
      const encoder = new RespEncoder();
      const encoded = encoder.encode(new RespVerbatimString('asdf'));
      expect(toStr(encoded)).toBe('=8\r\ntxt:asdf\r\n');
    });
  });
});

describe('binary', () => {
  test('empty blob', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(new Uint8Array(0));
    expect(toStr(encoded)).toBe('$0\r\n\r\n');
    expect(parse(encoded)).toBe('');
  });

  test('small blob', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(new Uint8Array([65, 66]));
    expect(toStr(encoded)).toBe('$2\r\nAB\r\n');
    expect(parse(encoded)).toBe('AB');
  });
});

describe('.writeAsciiString()', () => {
  test('can write "OK"', () => {
    const encoder = new RespEncoder();
    encoder.writeAsciiStr('OK');
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('+OK\r\n');
    expect(parse(encoded)).toBe('OK');
  });
});

describe('errors', () => {
  test('can encode simple error', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(new Error('ERR'));
    expect(toStr(encoded)).toBe('-ERR\r\n');
    expect(parse(encoded)).toBeInstanceOf(Error);
    expect((parse(encoded) as any).message).toBe('ERR');
  });

  test('can encode bulk error', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(new Error('a\nb'));
    expect(toStr(encoded)).toBe('!3\r\na\nb\r\n');
    expect(parse(encoded)).toBeInstanceOf(Error);
  });
});

describe('integers', () => {
  test('zero', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(0);
    expect(toStr(encoded)).toBe(':0\r\n');
    expect(parse(encoded)).toBe(0);
  });

  test('positive integer', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(23423432543);
    expect(toStr(encoded)).toBe(':23423432543\r\n');
    expect(parse(encoded)).toBe(23423432543);
  });

  test('negative integer', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(-11111111);
    expect(toStr(encoded)).toBe(':-11111111\r\n');
    expect(parse(encoded)).toBe(-11111111);
  });
});

describe('arrays', () => {
  test('empty array', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode([]);
    expect(toStr(encoded)).toBe('*0\r\n');
    expect(parse(encoded)).toEqual([]);
  });

  test('array of numbers', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode([1, 2, 3]);
    expect(toStr(encoded)).toBe('*3\r\n:1\r\n:2\r\n:3\r\n');
    expect(parse(encoded)).toEqual([1, 2, 3]);
  });

  test('array of strings and numbers', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode([1, 'abc', 3]);
    expect(toStr(encoded)).toBe('*3\r\n:1\r\n+abc\r\n:3\r\n');
    expect(parse(encoded)).toEqual([1, 'abc', 3]);
  });
});

describe('nulls', () => {
  test('a single null', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(null);
    expect(toStr(encoded)).toBe('_\r\n');
  });

  test('null in array', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode([1, 2, null]);
    expect(toStr(encoded)).toBe('*3\r\n:1\r\n:2\r\n_\r\n');
  });

  test('string null', () => {
    const encoder = new RespEncoder();
    encoder.writeNullStr();
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('$-1\r\n');
    expect(parse(encoded)).toEqual(null);
  });

  test('array null', () => {
    const encoder = new RespEncoder();
    encoder.writeNullArr();
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('*-1\r\n');
    expect(parse(encoded)).toEqual(null);
  });
});

describe('booleans', () => {
  test('true', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(true);
    expect(toStr(encoded)).toBe('#t\r\n');
  });

  test('false', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(false);
    expect(toStr(encoded)).toBe('#f\r\n');
  });
});

describe('doubles', () => {
  test('1.2', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(1.2);
    expect(toStr(encoded)).toBe(',1.2\r\n');
  });
});

describe('big numbers', () => {
  test('12345678901234567890', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(BigInt('12345678901234567890'));
    expect(toStr(encoded)).toBe('(12345678901234567890\r\n');
  });
});

describe('objects', () => {
  test('empty object', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode({});
    expect(toStr(encoded)).toBe('%0\r\n');
  });

  test('simple object', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode({foo: 123});
    expect(toStr(encoded)).toBe('%1\r\n+foo\r\n:123\r\n');
  });
});

describe('attributes', () => {
  test('empty attributes', () => {
    const encoder = new RespEncoder();
    encoder.writeAttr({});
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('|0\r\n');
  });

  test('simple object', () => {
    const encoder = new RespEncoder();
    encoder.writeAttr({foo: 123});
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('|1\r\n+foo\r\n:123\r\n');
  });
});

describe('sets', () => {
  test('empty set', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(new Set());
    expect(toStr(encoded)).toBe('~0\r\n');
  });

  test('array of numbers', () => {
    const encoder = new RespEncoder();
    const encoded = encoder.encode(new Set([1]));
    expect(toStr(encoded)).toBe('~1\r\n:1\r\n');
  });
});

describe('pushes', () => {
  test('empty push', () => {
    const encoder = new RespEncoder();
    encoder.writePush([]);
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('>0\r\n');
  });

  test('two elements', () => {
    const encoder = new RespEncoder();
    encoder.writePush([1, 32]);
    const encoded = encoder.writer.flush();
    expect(toStr(encoded)).toBe('>2\r\n:1\r\n:32\r\n');
  });
});

describe('streaming data', () => {
  describe('strings', () => {
    test('can write a streaming string', () => {
      const encoder = new RespEncoder();
      encoder.writeStartStr();
      encoder.writeStrChunk('abc');
      encoder.writeStrChunk('def');
      encoder.writeEndStr();
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('$?\r\n;3\r\nabc\r\n;3\r\ndef\r\n;0\r\n');
    });
  });

  describe('binary', () => {
    test('can write a streaming binary', () => {
      const encoder = new RespEncoder();
      encoder.writeStartBin();
      encoder.writeBinChunk(new Uint8Array([65]));
      encoder.writeBinChunk(new Uint8Array([66]));
      encoder.writeEndBin();
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('$?\r\n;1\r\nA\r\n;1\r\nB\r\n;0\r\n');
    });
  });
});

describe('commands', () => {
  describe('.writeCmd()', () => {
    test('can encode a simple command', () => {
      const encoder = new RespEncoder();
      encoder.writeCmd(['SET', 'foo', 'bar']);
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n');
    });

    test('casts numbers to strings', () => {
      const encoder = new RespEncoder();
      encoder.writeCmd(['SET', 'foo', 123]);
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\n123\r\n');
    });

    test('can encode Uint8Array', () => {
      const encoder = new RespEncoder();
      const encoded = encoder.encodeCmd([bufferToUint8Array(Buffer.from('SET')), 'foo', 123]);
      expect(toStr(encoded)).toBe('*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\n123\r\n');
    });
  });

  describe('.can encode emojis()', () => {
    test('can encode a simple command', () => {
      const encoder = new RespEncoder();
      encoder.writeCmdUtf8(['SET', 'foo 👍', 'bar']);
      const encoded = encoder.writer.flush();
      expect(toStr(encoded)).toBe('*3\r\n$3\r\nSET\r\n$8\r\nfoo 👍\r\n$3\r\nbar\r\n');
    });
  });
});
