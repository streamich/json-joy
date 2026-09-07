import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonPackExtension} from '../../JsonPackExtension';
import {JsonPackValue} from '../../JsonPackValue';
import {CborDecoder} from '../CborDecoder';
import {CborEncoder} from '../CborEncoder';
import {CborEncoderFast} from '../CborEncoderFast';
import {uint8ArrayToHex} from './rfc8949-vectors';

const decoder = new CborDecoder();

describe('writes exactly one item per value', () => {
  const make = () => new CborEncoder();
  const unsupported: [string, unknown][] = [
    ['undefined', undefined],
    ['symbol', Symbol('nope')],
    ['function', () => {}],
    ['Date', new Date(0)],
    ['RegExp', /x/],
    ['Set', new Set([1, 2])],
    ['Float64Array', new Float64Array([1])],
    ['class instance', new (class Foo {})()],
    ['boxed number', new Number(1)],
  ];

  for (const [label, value] of unsupported) {
    test(`inside an array: ${label}`, () => {
      const encoder = make();
      const encoded = encoder.encode([1, value, 2]);
      const decoded = decoder.decode(encoded) as unknown[];
      expect(decoded.length).toBe(3);
      expect(decoded[0]).toBe(1);
      expect(decoded[2]).toBe(2);
      expect(() => decoder.validate(encoded)).not.toThrow();
    });

    test(`inside a map: ${label}`, () => {
      const encoder = make();
      const encoded = encoder.encode({a: value, b: 2});
      const decoded = decoder.decode(encoded) as Record<string, unknown>;
      expect(Object.keys(decoded)).toStrictEqual(['a', 'b']);
      expect(decoded.b).toBe(2);
      expect(() => decoder.validate(encoded)).not.toThrow();
    });

    test(`on its own: ${label}`, () => {
      const encoder = make();
      const encoded = encoder.encode(value);
      expect(encoded.length).toBeGreaterThan(0);
      expect(() => decoder.validate(encoded)).not.toThrow();
    });
  }

  test('bigint is encoded, not dropped', () => {
    const encoder = make();
    const value = BigInt('18446744073709551615');
    expect(decoder.decode(encoder.encode(value))).toBe(value);
    expect(decoder.decode(encoder.encode([1, value, 2]))).toStrictEqual([1, value, 2]);
  });

  test('an unsupported value does not corrupt the writer for later calls', () => {
    const encoder = make();
    encoder.encode(Symbol('x'));
    encoder.encode(undefined);
    expect(decoder.decode(encoder.encode({a: 1}))).toStrictEqual({a: 1});
  });
});

describe('objects that shadow the constructor property', () => {
  const shadowing: [string, Record<string, unknown>][] = [
    ['constructor: number', {constructor: 1}],
    ['constructor: string', {constructor: 'x', a: 2}],
    ['constructor: object', JSON.parse('{"constructor":{"prototype":1}}')],
    ['null prototype', Object.assign(Object.create(null), {constructor: 1, a: 2})],
  ];

  for (const [label, value] of shadowing) {
    // `toEqual`, not `toStrictEqual`: an own "constructor" key makes jest
    // consider the two objects different types.
    test(`CborEncoder encodes ${label} as a map`, () => {
      const encoder = new CborEncoder();
      const decoded = decoder.decode(encoder.encode(value)) as Record<string, unknown>;
      expect(decoded).toEqual(value);
      expect(Object.keys(decoded)).toStrictEqual(Object.keys(value));
    });

    test(`CborEncoderFast encodes ${label} as a map`, () => {
      const encoder = new CborEncoderFast();
      const decoded = decoder.decode(encoder.encode(value)) as Record<string, unknown>;
      expect(decoded).toEqual(value);
      expect(Object.keys(decoded)).toStrictEqual(Object.keys(value));
    });
  }

  test('a real class instance is still treated as unknown', () => {
    class Foo {
      public a = 1;
    }
    expect(decoder.decode(new CborEncoder().encode(new Foo()))).toBe(null);
  });

  test('Uint8Array subclasses are still encoded as binary', () => {
    const buf = Buffer.from([1, 2, 3]);
    expect(decoder.decode(new CborEncoder().encode(buf))).toStrictEqual(new Uint8Array([1, 2, 3]));
  });
});

describe('JsonPackValue', () => {
  test('a pre-encoded blob is spliced in verbatim', () => {
    const encoder = new CborEncoder();
    const blob = new JsonPackValue(new CborEncoder().encode({inner: true}));
    expect(decoder.decode(encoder.encode({a: blob}))).toStrictEqual({a: {inner: true}});
  });

  test('a simple value round-trips through the encoder', () => {
    const encoder = new CborEncoder();
    for (const simple of [0, 16, 19, 24, 32, 200, 255]) {
      const value = new JsonPackValue(simple);
      const encoded = encoder.encode(value);
      expect(decoder.decode(encoded)).toStrictEqual(value);
    }
  });

  test('encoding a simple value leaves the writer usable', () => {
    const writer = new Writer(64);
    const encoder = new CborEncoder(writer);
    expect(uint8ArrayToHex(encoder.encode(new JsonPackValue(255)))).toBe('f8ff');
    expect(writer.x).toBeGreaterThan(0);
    expect(Number.isFinite(writer.x)).toBe(true);
    expect(uint8ArrayToHex(encoder.encode({a: 1}))).toBe('a1616101');
  });

  test('a decoded simple value survives a full round-trip', () => {
    const encoder = new CborEncoder();
    const decoded = decoder.decode(new Uint8Array([0xf8, 0x2a]));
    expect(uint8ArrayToHex(encoder.encode(decoded))).toBe('f82a');
  });
});

describe('JsonPackExtension', () => {
  test('round-trips tags across every header size', () => {
    const encoder = new CborEncoder();
    for (const tag of [0, 1, 23, 24, 255, 256, 65535, 65536, 4294967295]) {
      const value = new JsonPackExtension(tag, {a: 1});
      expect(decoder.decode(encoder.encode(value))).toStrictEqual(value);
    }
  });
});
