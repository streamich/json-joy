import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {parse} from '@jsonjoy.com/json-pack/lib/json-binary';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {ModuleType} from '../../../../type/classes/ModuleType';
import {testBinaryCodegen} from '../../__tests__/testBinaryCodegen';
import {JsonCodegen} from '../JsonCodegen';
import type {Type} from '../../../../type';
import {unknown, Value} from '../../../../value';

const encoder = new JsonEncoder(new Writer(16));
const decoder = new JsonDecoder();

describe('inline Value', () => {
  test('can encode "any" field', () => {
    const {t} = new ModuleType();
    const type = t.object({foo: t.any});
    const fn = JsonCodegen.get(type);
    encoder.writer.reset();
    fn({foo: true}, encoder);
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual({foo: true});
  });

  test('can encode anon Value<unknown>', () => {
    const {t} = new ModuleType();
    const type = t.object({foo: t.any});
    const fn = JsonCodegen.get(type);
    encoder.writer.reset();
    const value = unknown('test');
    fn({foo: value}, encoder);
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual({foo: 'test'});
  });

  test('can encode typed Value<T>', () => {
    const {t} = new ModuleType();
    const type = t.object({foo: t.any});
    const fn = JsonCodegen.get(type);
    encoder.writer.reset();
    const value = new Value(123, t.con(123));
    fn({foo: value}, encoder);
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual({foo: 123});
  });
});

const transcode = (system: ModuleType, type: Type, value: unknown) => {
  const fn = JsonCodegen.get(type);
  encoder.writer.reset();
  fn(value, encoder);
  const encoded = encoder.writer.flush();
  const json = Buffer.from(encoded).toString('utf-8');
  // console.log(value);
  // console.log(json);
  const decoded = parse(json);
  return decoded;
};

testBinaryCodegen(transcode);

test('fuzzer 1: map in map', () => {
  const system = new ModuleType();
  const {t} = system;
  const type = t.Map(t.Map(t.nil));
  const value = {
    '^': {
      'ww9DP[c': null,
      '2LL*vp ': null,
      'OW;a(w)': null,
      'T`jb_LZ': null,
      'C)crlQL': null,
      'kw&p(^-': null,
      'oKkF,u8': null,
    },
  };
  const value2 = {
    'YS9mc}Zb': {
      'V2*_9': null,
      'j9?_0': null,
      '@:ODe': null,
      'sS{Sx': null,
      '4EMz|': null,
    },
    "bF@64u'7": {
      'q<_b%}$Q': null,
      RäXpXBLü: null,
      '$uJx]{ft': null,
      'bX%jLhr{': null,
      'Lr1bY-fY': null,
      'D]ml,C)W': null,
      'eK=DszFO': null,
      '!RqC^GUz': null,
    },
    '9SEDa*#|': {
      ';COK{m%=': null,
      'i`tJj:xE': null,
      'ffIhp!Om': null,
      'kiN&BfB5': null,
      'k+$es!mO': null,
      'O1(&D_bt': null,
      'cidA#*BD': null,
      '!ZP5JBFq': null,
    },
    ';6(7#5m:': {},
    'zhGX^&Y3': {
      '1Z>iC': null,
      '%вqL=': null,
      '5?5{)': null,
      '*2"H4': null,
      ')&_O4': null,
    },
    '?6a1a5Y\\': {
      '5,bCV': null,
      'z[x2s': null,
      'Ad/g9': null,
      'at#84': null,
      '{@?".': null,
    },
    uaaAwаHb: {VXy: null, 'I(<': null, 'W V': null},
    '&sH?Bk2E': {
      'M[^ex': null,
      '-ZP$E': null,
      'c*@uR': null,
      '`sy3N': null,
      'g?DB ': null,
    },
  };
  const value3 = {
    '/7': {'|;L': null, '@K<': null, '*x:': null},
    Zf: {N1: null, 't%': null},
  };
  for (let i = 0; i < 100; i++) {
    const decoded = transcode(system, type, value);
    const decoded2 = transcode(system, type, value2);
    const decoded3 = transcode(system, type, value3);
    expect(decoded).toEqual(value);
    expect(decoded2).toEqual(value2);
    expect(decoded3).toEqual(value3);
  }
});
