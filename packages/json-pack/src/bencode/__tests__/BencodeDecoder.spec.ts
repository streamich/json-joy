import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {utf8} from '@jsonjoy.com/buffers/lib/strings';
import {BencodeEncoder} from '../BencodeEncoder';
import {BencodeDecoder} from '../BencodeDecoder';

const decoder = new BencodeDecoder();

describe('null', () => {
  test('null', () => {
    const data = utf8`n`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(null);
  });
});

describe('undefined', () => {
  test('undefined', () => {
    const encoder = new BencodeEncoder(new Writer());
    const encoded = encoder.encode(undefined);
    const decoded = decoder.read(encoded);
    expect(decoded).toBe(undefined);
  });

  test('undefined in array', () => {
    const encoder = new BencodeEncoder(new Writer());
    const encoded = encoder.encode({foo: [1, undefined, -1]});
    const decoded = decoder.read(encoded);
    expect(decoded).toEqual({foo: [1, undefined, -1]});
  });
});

describe('boolean', () => {
  test('true', () => {
    const data = utf8`t`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(true);
  });

  test('false', () => {
    const data = utf8`f`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(false);
  });
});

describe('number', () => {
  test('1', () => {
    const data = utf8`i1e`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(1);
  });

  test('12', () => {
    const data = utf8`i12e`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(12);
  });

  test('123', () => {
    const data = utf8`i123e`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(123);
  });

  test('1234', () => {
    const data = utf8`i1234e`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(1234);
  });

  test('12345', () => {
    const data = utf8`i12345e`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(12345);
  });

  test('123456', () => {
    const data = utf8`i123456e`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(123456);
  });

  test('-0.1234', () => {
    const data = utf8`i-123e`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(-123);
  });
});

describe('string', () => {
  test('empty string', () => {
    const data = utf8`0:`;
    const value = decoder.decode(data);
    expect(value).toEqual(utf8``);
  });

  test('one char string', () => {
    const data = utf8`1:a`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(utf8`a`);
  });

  test('"hello world" string', () => {
    const data = utf8`11:hello world`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(utf8`hello world`);
  });

  test('string with emoji', () => {
    const str = 'yes! - 👍🏻👍🏼👍🏽👍🏾👍🏿';
    const buf = Buffer.from(str, 'utf-8');
    const data = utf8(`${buf.length}:${str}`);
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(utf8(str));
  });

  test('string with quote', () => {
    const str = 'this is a "quote"';
    const buf = Buffer.from(str, 'utf-8');
    const data = utf8(`${buf.length}:${str}`);
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(utf8(str));
  });

  test('string with new line', () => {
    const str = 'this is a \n new line';
    const buf = Buffer.from(str, 'utf-8');
    const data = utf8(`${buf.length}:${str}`);
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(utf8(str));
  });

  test('string with backslash', () => {
    const str = 'this is a \\ backslash';
    const buf = Buffer.from(str, 'utf-8');
    const data = utf8(`${buf.length}:${str}`);
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(utf8(str));
  });

  test('a single backslash character', () => {
    const str = '\\';
    const buf = Buffer.from(str, 'utf-8');
    const data = utf8(`${buf.length}:${str}`);
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(utf8(str));
  });

  test('string with tab', () => {
    const str = 'this is a \t tab';
    const buf = Buffer.from(str, 'utf-8');
    const data = utf8(`${buf.length}:${str}`);
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(utf8(str));
  });

  test('string unicode characters', () => {
    const str = '15\u00f8C';
    const buf = Buffer.from(str, 'utf-8');
    const data = utf8(`${buf.length}:${str}`);
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(utf8(str));
  });
});

describe('binary', () => {
  test('empty buffer', () => {
    const encoder = new BencodeEncoder(new Writer());
    const data = encoder.encode(new Uint8Array(0));
    decoder.reader.reset(data);
    const value1 = decoder.readAny();
    expect(value1).toEqual(new Uint8Array(0));
    decoder.reader.reset(data);
    const value2 = decoder.readBin();
    expect(value2).toEqual(new Uint8Array(0));
  });

  test('a small buffer', () => {
    const encoder = new BencodeEncoder(new Writer());
    const data = encoder.encode(new Uint8Array([4, 5, 6]));
    decoder.reader.reset(data);
    const value = decoder.readBin();
    expect(value).toEqual(new Uint8Array([4, 5, 6]));
  });
});

describe('array', () => {
  test('empty array', () => {
    const data = utf8`le`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([]);
  });

  test('array with one number element', () => {
    const data = utf8`li1ee`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([1]);
  });

  test('array with strings', () => {
    const data = utf8`l1:al1:be1:cl1:d1:eelee`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([utf8`a`, [utf8`b`], utf8`c`, [utf8`d`, utf8`e`], []]);
  });
});

describe('object', () => {
  test('empty object', () => {
    const data = utf8`de`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({});
  });

  test('object with single key', () => {
    const data = utf8`d3:foo3:bare`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({foo: utf8`bar`});
  });

  test('nested object', () => {
    const data = utf8`d0:dee`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({'': {}});
  });

  test('complex nested object', () => {
    const obj = {
      a: 1,
      b: true,
      c: null,
      d: [1, 2, 3],
      e: {
        f: utf8`foo`,
        g: utf8`bar`,
        h: {
          i: utf8`baz`,
          j: utf8`qux`,
        },
      },
    };
    const data = utf8`d1:ai1e1:bt1:cn1:dli1ei2ei3ee1:ed1:f3:foo1:g3:bar1:hd1:i3:baz1:j3:quxeee`;
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(obj);
  });
});
