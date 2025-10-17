import {RespEncoder} from '../RespEncoder';
import {RespDecoder} from '../RespDecoder';
import {bufferToUint8Array} from '@jsonjoy.com/buffers/lib/bufferToUint8Array';
import {RespAttributes, RespPush} from '../extensions';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {utf8} from '@jsonjoy.com/buffers/lib/strings';

const decode = (encoded: string | Uint8Array): unknown => {
  const decoder = new RespDecoder();
  const buf = typeof encoded === 'string' ? bufferToUint8Array(Buffer.from(encoded)) : encoded;
  const decoded = decoder.read(buf);
  return decoded;
};

const encoder = new RespEncoder(new Writer(4));
const assertCodec = (value: unknown, expected: unknown = value): void => {
  const encoded = encoder.encode(value);
  // console.log(Buffer.from(encoded).toString());
  const decoded = decode(encoded);
  expect(decoded).toStrictEqual(expected);
  const encoded2 = encoder.encode(value);
  const decoded2 = decode(encoded2);
  expect(decoded2).toStrictEqual(expected);
};

describe('nulls', () => {
  test('null', () => {
    assertCodec(null);
  });
});

describe('booleans', () => {
  test('true', () => {
    assertCodec(true);
  });

  test('false', () => {
    assertCodec(false);
  });
});

describe('integers', () => {
  test('zero', () => assertCodec(0));
  test('positive', () => assertCodec(123));
  test('negative', () => assertCodec(-2348934));
  test('positive with leading "+"', () => {
    const decoded = decode(':+123\r\n');
    expect(decoded).toBe(123);
  });
});

describe('big ints', () => {
  test('zero', () => assertCodec(BigInt('0')));
  test('positive', () => assertCodec(BigInt('123')));
  test('negative', () => assertCodec(BigInt('-2348934')));
  test('positive with leading "+"', () => {
    const decoded = decode('(+123\r\n');
    expect(decoded).toEqual(BigInt('123'));
  });
});

describe('floats', () => {
  test('positive', () => assertCodec([1.123]));
  test('negative', () => assertCodec([-43.234435]));
  test('negative', () => assertCodec([-5445e-10]));
  test('negative', () => assertCodec([-5445e-20]));
  test('negative', () => assertCodec([-5445e-30]));
  test('inf', () => assertCodec([Infinity]));
  test('-inf', () => assertCodec([-Infinity]));
  test('nan', () => assertCodec([NaN]));

  test('decodes ",inf<CR><LF>"', () => {
    const decoded = decode(',inf\r\n');
    expect(decoded).toEqual(Infinity);
  });

  test('decodes ",-inf<CR><LF>"', () => {
    const decoded = decode(',-inf\r\n');
    expect(decoded).toEqual(-Infinity);
  });

  test('decodes ",nan<CR><LF>"', () => {
    const decoded = decode(',nan\r\n');
    expect(decoded).toEqual(NaN);
  });
});

const stringCases: [string, string][] = [
  ['empty string', ''],
  ['short string', 'foo bar'],
  ['short string with emoji', 'foo bar🍼'],
  ['short string with emoji and newline', 'foo bar\n🍼'],
  ['simple string with newline', 'foo\nbar'],
];

describe('strings', () => {
  for (const [name, value] of stringCases) {
    test(name, () => assertCodec(value));
  }

  describe('verbatim strings', () => {
    test('example from docs', () => {
      const encoded = '=15\r\ntxt:Some string\r\n';
      const decoded = decode(encoded);
      expect(decoded).toBe('Some string');
    });
  });
});

describe('binary', () => {
  test('empty blob', () => assertCodec(new Uint8Array(0)));
  test('small blob', () => assertCodec(new Uint8Array([1, 2, 3])));
  test('blob with new lines', () => assertCodec(new Uint8Array([1, 2, 3, 10, 13, 14, 64, 65])));
});

describe('errors', () => {
  for (const [name, value] of stringCases) {
    test(name, () => assertCodec(new Error(value)));
  }
});

const arrays: [string, unknown[]][] = [
  ['empty array', []],
  ['simple array', [1, 2, 3]],
  ['with strings', ['foo', 'bar']],
  ['nested', [[]]],
  ['surrounded by special strings', ['a\n', 'b😱', [0, -1, 1], '\nasdf\r\n\r💪\nadsf']],
];

describe('arrays', () => {
  for (const [name, value] of arrays) test(name, () => assertCodec(value));
});

describe('sets', () => {
  for (const [name, value] of arrays) test(name, () => assertCodec(new Set(value)));
});

describe('pushes', () => {
  for (const [name, value] of arrays) test(name, () => assertCodec(new RespPush(value)));
});

const maps: [string, Record<string, unknown>][] = [
  ['empty map', {}],
  ['simple map', {foo: 'bar'}],
  ['multiple keys', {foo: 'bar', baz: 'qux'}],
  ['nested', {foo: {bar: 'baz'}}],
  ['surrounded by special strings', {foo: 'bar', baz: 'qux', quux: ['a\n', 'b😱', [0, -1, 1], '\nasdf\r\n\r💪\nadsf']}],
  ['fuzzer 1', {a: 'b', 'a*|Avi5:7%7El': false}],
  [
    'fuzzer 2',
    {
      'u.qSvG-7#j0tp1Z': [
        'Mk9|s2<[-$k2sEq',
        '.YyA',
        ',g:V5el?o1',
        ['/-=gfBa7@r'],
        null,
        'x0"',
        899663861.7189225,
        ['-yM}#tH>Z|0', '?x4c-M', 'V`Wjk', 962664739.7776917, 541764469.8786258],
        39815384.70374191,
        '%J,TE6',
        867117612.5557965,
        432039764.7694767,
        {'&3qo`uOc@]7c': -1199425724646684, '(3': 98978664.1896191},
        941209461.4820778,
        444029027.33100927,
      ],
      ':xwsOx[u0:\\,': 116172902.03305908,
      '=Em$Bo+t4': 118717435.20500576,
      'D3 hvV+uBsY^0': ' Mr!`Pjno;ME_',
      'l\\Wv1bs': null,
      F: 175071663.912447,
      's-o}fQO2e': null,
      'K!q]': 'LBm,GEw,`BpQxIq',
      "(:'-g`;x": 'r\\?K;AZWT1S:w0_-',
    },
  ],
];

describe('objects', () => {
  for (const [name, value] of maps) test(name, () => assertCodec(value));

  describe('when .tryUtf8 = true', () => {
    test('parses bulk strings as UTF8 strings', () => {
      const encoded = '%1\r\n$3\r\nfoo\r\n$3\r\nbar\r\n';
      const decoder = new RespDecoder();
      decoder.tryUtf8 = true;
      const decoded = decoder.read(Buffer.from(encoded));
      expect(decoded).toStrictEqual({foo: 'bar'});
    });

    test('parses invalid UTF8 as Uint8Array', () => {
      const encoded = encoder.encode({foo: new Uint8Array([0xc3, 0x28])});
      const decoder = new RespDecoder();
      decoder.tryUtf8 = true;
      const decoded = decoder.read(encoded);
      expect(decoded).toStrictEqual({foo: new Uint8Array([0xc3, 0x28])});
    });
  });
});

describe('attributes', () => {
  for (const [name, value] of maps) test(name, () => assertCodec(new RespAttributes(value)));
});

describe('nulls', () => {
  test('can decode string null', () => {
    const decoded = decode('$-1\r\n');
    expect(decoded).toBe(null);
  });

  test('can decode array null', () => {
    const decoded = decode('*-1\r\n');
    expect(decoded).toBe(null);
  });
});

describe('commands', () => {
  test('can decode a PING command', () => {
    const encoded = encoder.encodeCmd(['PING']);
    const decoder = new RespDecoder();
    decoder.reader.reset(encoded);
    const decoded = decoder.readCmd();
    expect(decoded).toEqual(['PING']);
  });

  test('can decode a SET command', () => {
    const encoded = encoder.encodeCmd(['SET', 'foo', 'bar']);
    const decoder = new RespDecoder();
    decoder.reader.reset(encoded);
    const decoded = decoder.readCmd();
    expect(decoded).toEqual(['SET', utf8`foo`, utf8`bar`]);
  });
});
