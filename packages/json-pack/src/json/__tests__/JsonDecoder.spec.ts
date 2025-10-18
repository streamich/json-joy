import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonDecoder} from '../JsonDecoder';
import {JsonEncoder} from '../JsonEncoder';

const decoder = new JsonDecoder();

describe('null', () => {
  test('null', () => {
    const data = Buffer.from('null', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(null);
  });

  test('null with whitespace', () => {
    const data = Buffer.from('   null', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(null);
  });

  test('null with more whitespace', () => {
    const data = Buffer.from(' \n\n  \n \t  \r \r   null  \r \r \r\t\n', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(null);
  });
});

describe('undefined', () => {
  test('undefined', () => {
    const encoder = new JsonEncoder(new Writer());
    const encoded = encoder.encode(undefined);
    const decoded = decoder.read(encoded);
    expect(decoded).toBe(undefined);
  });

  test('undefined in array', () => {
    const encoder = new JsonEncoder(new Writer());
    const encoded = encoder.encode({foo: [1, undefined, -1]});
    const decoded = decoder.read(encoded);
    expect(decoded).toEqual({foo: [1, undefined, -1]});
  });
});

describe('boolean', () => {
  test('true', () => {
    const data = Buffer.from('true', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(true);
  });

  test('true with whitespace', () => {
    const data = Buffer.from('\n \t \r true\n \t \r ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(true);
  });

  test('false', () => {
    const data = Buffer.from('false', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(false);
  });

  test('true with whitespace', () => {
    const data = Buffer.from('\n \t \r false\n \t \r ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(false);
  });

  test('can read any boolean - 1', () => {
    const data = Buffer.from('\n \t \r false\n \t \r ', 'utf-8');
    decoder.reader.reset(data);
    decoder.skipWhitespace();
    const value = decoder.readBool();
    expect(value).toBe(false);
  });

  test('can read any boolean - 2', () => {
    const data = Buffer.from('true ', 'utf-8');
    decoder.reader.reset(data);
    decoder.skipWhitespace();
    const value = decoder.readBool();
    expect(value).toBe(true);
  });
});

describe('number', () => {
  test('1', () => {
    const data = Buffer.from('1', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(1);
  });

  test('12', () => {
    const data = Buffer.from('12', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(12);
  });

  test('123', () => {
    const data = Buffer.from('123', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(123);
  });

  test('1234', () => {
    const data = Buffer.from('1234', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(1234);
  });

  test('12345', () => {
    const data = Buffer.from('12345', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(12345);
  });

  test('123456', () => {
    const data = Buffer.from('123456', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(123456);
  });

  test('-0.1234', () => {
    const data = Buffer.from('-0.1234', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(-0.1234);
  });

  test('3n', () => {
    const data = Buffer.from('3n', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(3);
  });

  test('with whitespace', () => {
    const data = Buffer.from('\n \r 5.6 ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(5.6);
  });

  test('small float with many digits', () => {
    const smallFloat = 0.0000040357127006276845;
    const data = Buffer.from(JSON.stringify(smallFloat), 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(smallFloat);
  });

  test('large float with e+ notation - Number.MAX_VALUE', () => {
    const data = Buffer.from('1.7976931348623157e+308', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(1.7976931348623157e308);
    expect(value).toBe(Number.MAX_VALUE);
  });

  test('large float with E+ notation - uppercase', () => {
    const data = Buffer.from('1.7976931348623157E+308', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(1.7976931348623157e308);
  });

  test('large float without explicit + sign', () => {
    const data = Buffer.from('1.7976931348623157e308', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(1.7976931348623157e308);
  });

  test('infinity with e+ notation', () => {
    const data = Buffer.from('2e+308', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(Infinity);
  });

  test('medium large float with e+ notation', () => {
    const data = Buffer.from('1.2345e+50', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(1.2345e50);
  });

  test('very small float with e- notation', () => {
    const data = Buffer.from('5e-324', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(5e-324);
  });

  test('smallest normal positive float', () => {
    const data = Buffer.from('2.2250738585072014e-308', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(2.2250738585072014e-308);
  });

  test('large float in JSON array', () => {
    const data = Buffer.from('[1.7976931348623157e+308]', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([1.7976931348623157e308]);
  });

  test('large float in JSON object', () => {
    const data = Buffer.from('{"value": 1.7976931348623157e+308}', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({value: 1.7976931348623157e308});
  });
});

describe('string', () => {
  test('empty string', () => {
    const data = Buffer.from('""', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe('');
  });

  test('empty string with whitespace', () => {
    const data = Buffer.from(' \n \r \t "" \n \r \t ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe('');
  });

  test('one char string', () => {
    const data = Buffer.from('"a"', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe('a');
  });

  test('"hello world" string', () => {
    const data = Buffer.from('"hello world"', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe('hello world');
  });

  test('string with emoji', () => {
    const str = 'yes! - 👍🏻👍🏼👍🏽👍🏾👍🏿';
    const data = Buffer.from(' "yes! - 👍🏻👍🏼👍🏽👍🏾👍🏿" ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(str);
  });

  test('string with quote', () => {
    const str = 'this is a "quote"';
    const data = Buffer.from(JSON.stringify(str), 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(str);
  });

  test('string with new line', () => {
    const str = 'this is a \n new line';
    const json = JSON.stringify(str);
    const data = Buffer.from(json, 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(str);
  });

  test('string with backslash', () => {
    const str = 'this is a \\ backslash';
    const json = JSON.stringify(str);
    const data = Buffer.from(json, 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(str);
  });

  test('a single backslash character', () => {
    const str = '\\';
    const json = JSON.stringify(str);
    const data = Buffer.from(json, 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(str);
  });

  test('string with tab', () => {
    const str = 'this is a \t tab';
    const json = JSON.stringify(str);
    const data = Buffer.from(json, 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe(str);
  });

  test('string unicode characters', () => {
    const json = '"15\u00f8C"';
    const data = Buffer.from(json, 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toBe('15\u00f8C');
  });
});

describe('binary', () => {
  test('empty buffer', () => {
    const encoder = new JsonEncoder(new Writer());
    const data = encoder.encode(new Uint8Array(0));
    decoder.reader.reset(data);
    const value1 = decoder.readAny();
    expect(value1).toEqual(new Uint8Array(0));
    decoder.reader.reset(data);
    const value2 = decoder.readBin();
    expect(value2).toEqual(new Uint8Array(0));
  });

  test('a small buffer', () => {
    const encoder = new JsonEncoder(new Writer());
    const data = encoder.encode(new Uint8Array([4, 5, 6]));
    decoder.reader.reset(data);
    const value = decoder.readBin();
    expect(value).toEqual(new Uint8Array([4, 5, 6]));
  });
});

describe('array', () => {
  test('empty array', () => {
    const data = Buffer.from('[]', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([]);
  });

  test('empty array with whitespace', () => {
    const data = Buffer.from(' \n \r \t [] \n \r \t ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([]);
  });

  test('array with one number element', () => {
    const data = Buffer.from(' \n \r \t [1] \n \r \t ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([1]);
  });

  test('array with one number element - 2', () => {
    const data = Buffer.from(' \n \r \t [ -3.5e2\n] \n \r \t ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([-3.5e2]);
  });

  test('array with one boolean', () => {
    const data = Buffer.from(' \n \r \t [ true] \n \r \t ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([true]);
  });

  test('array with one boolean - 2', () => {
    const data = Buffer.from(' \n \r \t [false ] \n \r \t ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([false]);
  });

  test('array with one null', () => {
    const data = Buffer.from(' \n \r \t [null] \n \r \t ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([null]);
  });

  test('array with multiple numbers', () => {
    const data = Buffer.from(' \n \r \t [1, 2.2,-3.3 ] \n \r \t ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([1, 2.2, -3.3]);
  });

  test('simple array', () => {
    const data = Buffer.from('[1, 2, 3]', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([1, 2, 3]);
  });

  test('missing comma', () => {
    const data = Buffer.from('[1, 2 3]', 'utf-8');
    decoder.reader.reset(data);
    expect(() => decoder.readAny()).toThrow(new Error('Invalid JSON'));
  });

  test('nested arrays', () => {
    const data = Buffer.from(' \n \r \t [[],\n[ 4,\t5] , [null]] \n \r \t ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual([[], [4, 5], [null]]);
  });

  test('array with strings', () => {
    const data = Buffer.from('["a", ["b"], "c", ["d", "e"], [  ] ]', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(['a', ['b'], 'c', ['d', 'e'], []]);
  });
});

describe('object', () => {
  test('empty object', () => {
    const data = Buffer.from('{}', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({});
  });

  test('empty object with whitespace', () => {
    const data = Buffer.from(' { } ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({});
  });

  test('empty object with whitespace - 2', () => {
    const data = Buffer.from(' {\n} ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({});
  });

  test('object with single key', () => {
    const data = Buffer.from(' { "foo" : "bar" } ', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({foo: 'bar'});
  });

  test('simple object', () => {
    const data = Buffer.from('{"foo": 1, "bar": 2}', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({foo: 1, bar: 2});
  });

  test('missing comma', () => {
    const data = Buffer.from('{"foo": 1 "bar": 2}', 'utf-8');
    decoder.reader.reset(data);
    expect(() => decoder.readAny()).toThrow(new Error('Invalid JSON'));
  });

  test('nested object', () => {
    const data = Buffer.from('{"":{}}', 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual({'': {}});
  });

  test('nested object', () => {
    const data = Buffer.from('{"":{}}', 'utf-8');
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
        f: 'foo',
        g: 'bar',
        h: {
          i: 'baz',
          j: 'qux',
        },
      },
    };
    const data = Buffer.from(JSON.stringify(obj), 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(obj);
  });

  test('complex nested object - 2', () => {
    const obj = {
      '!Cq"G_f/]j': 'pG.HEFjh',
      '<3-': [285717617.40402037, '! qiH14NE', 'YCu"<>)PWv[9ot', 591097389.6547585],
      'zJ49L}1A)M]': {
        'V0`*ei?8E': {
          'C8:yy': -2807878070964447,
          '$^': 855760508.2633594,
          'ew5!f{>w/B zg': 'vGS',
          'oFaFl,&F{9J9!=h': 828843580.1490843,
        },
        '5|': {
          '?#^5`_ABY"': ["h'mHT-\\JK\\$", 'je{O<3l(', 'q'],
          'Z|gPbq,LZB9^$].8': ['mo"Ho'],
          Sl45: 796047966.3180537,
          "`_pz@ADh 'iYlc5V": 1128283461473140,
        },
        'y|#.;\\QpUx8T': -53172,
        'BGk-f#QZ_!)2Tup4': 87540156.63740477,
        'H5tl@md|9(-': 411281070.2708618,
      },
      'XH>)': 718476139.1743257,
      't$@`w': {
        'jQ$1y"9': null,
        诶г西诶必西诶西西诶诶西西: 64094888.57050705,
      },
      'OWB@6%': "'bx8Fc",
      '#vxKbXgF+$mIk': 919164616.3711811,
      'x!UZa*e@Rfz': '\\',
      "tyae=ID>')Z5Bu?": 721968011.7405405,
    };
    const data = Buffer.from(JSON.stringify(obj), 'utf-8');
    decoder.reader.reset(data);
    const value = decoder.readAny();
    expect(value).toEqual(obj);
  });
});
