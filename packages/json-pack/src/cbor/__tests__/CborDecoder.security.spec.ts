import {CborDecoder} from '../CborDecoder';
import {CborDecoderBase} from '../CborDecoderBase';
import {CborEncoder} from '../CborEncoder';
import {hexToUint8Array} from './rfc8949-vectors';

const decoder = new CborDecoder();
const base = new CborDecoderBase();
const encoder = new CborEncoder();

/** `__proto__` as a definite length text string key. */
const PROTO_KEY = '695f5f70726f746f5f5f';

describe('prototype pollution', () => {
  // Every way a decoded map can reach an object literal. `topLevel` marks the
  // ones whose map is the outermost value, `decodeLevel()` returns anything
  // deeper as an opaque blob and so never builds an object for it.
  const inputs: [string, string, boolean][] = [
    ['definite length map', `a1${PROTO_KEY}a1616101`, true],
    ['indefinite length map', `bf${PROTO_KEY}a1616101ff`, true],
    ['nested inside an array', `81a1${PROTO_KEY}a1616101`, false],
    ['nested inside a map value', `a16161a1${PROTO_KEY}a1616101`, false],
    ['nested inside an indefinite array', `9fa1${PROTO_KEY}a1616101ff`, false],
    ['key split across indefinite chunks', `a17f655f5f70726f656f746f5f5fffa0`, true],
  ];

  for (const [name, hex, topLevel] of inputs) {
    const uint8 = hexToUint8Array(hex);

    test(`decode() rejects a __proto__ key, ${name}`, () => {
      expect(() => decoder.decode(uint8)).toThrow();
    });

    test(`CborDecoderBase.decode() rejects a __proto__ key, ${name}`, () => {
      expect(() => base.decode(uint8)).toThrow();
    });

    if (topLevel)
      test(`decodeLevel() rejects a __proto__ key, ${name}`, () => {
        expect(() => decoder.decodeLevel(uint8)).toThrow();
      });
  }

  test('readObjRaw() rejects a __proto__ key', () => {
    decoder.reader.reset(hexToUint8Array(`${PROTO_KEY}a1616101`));
    expect(() => decoder.readObjRaw(1)).toThrow();
  });

  test('Object.prototype is left untouched', () => {
    for (const [, hex] of inputs) {
      try {
        decoder.decode(hexToUint8Array(hex));
      } catch {}
    }
    expect(({} as Record<string, unknown>).a).toBe(undefined);
    expect(Object.getPrototypeOf({})).toBe(Object.prototype);
  });

  test('a __proto__ key in a Map is harmless and preserved', () => {
    decoder.reader.reset(hexToUint8Array(`a1${PROTO_KEY}a1616101`));
    const map = decoder.readAsMap();
    expect(map.get('__proto__')).toStrictEqual({a: 1});
    expect(Object.getPrototypeOf({})).toBe(Object.prototype);
  });

  test('other dangerous-looking keys are decoded as plain own properties', () => {
    const encoded = encoder.encode({constructor: 1, prototype: 2, toString: 3});
    const decoded = decoder.decode(encoded) as Record<string, unknown>;
    expect(decoded.constructor).toBe(1);
    expect(decoded.prototype).toBe(2);
    expect(decoded.toString).toBe(3);
    expect(Object.getPrototypeOf(decoded)).toBe(Object.prototype);
  });
});

describe('resource exhaustion', () => {
  /** A container header that claims more entries than the input could hold. */
  const bombs: [string, string][] = [
    ['array claiming 4 billion items', '9affffffff'],
    ['array claiming 2^64-1 items', '9bffffffffffffffff'],
    ['map claiming 4 billion entries', 'baffffffff'],
    ['map claiming 2^64-1 entries', 'bbffffffffffffffff'],
    ['byte string claiming 4GB', '5affffffff'],
    ['text string claiming 4GB', '7affffffff'],
    ['array of 65535 items in 3 bytes', '99ffff'],
    ['map of 65535 entries in 3 bytes', 'b9ffff'],
    ['nested bomb', '81819affffffff'],
  ];

  for (const [name, hex] of bombs) {
    test(`${name} is rejected promptly`, () => {
      const uint8 = hexToUint8Array(hex);
      const start = Date.now();
      expect(() => decoder.decode(uint8)).toThrow();
      expect(() => decoder.validate(uint8)).toThrow();
      expect(() => decoder.decodeLevel(uint8)).toThrow();
      expect(Date.now() - start).toBeLessThan(1000);
    });
  }

  test('a container header is accepted when the input is actually that long', () => {
    const items = 300;
    const uint8 = new Uint8Array(3 + items);
    uint8[0] = 0x99;
    uint8[1] = items >> 8;
    uint8[2] = items & 0xff;
    expect((decoder.decode(uint8) as unknown[]).length).toBe(items);
  });

  test('decoding a simple value does not corrupt the encoder', () => {
    const simple = decoder.decode(hexToUint8Array('f8ff'));
    expect(encoder.encode(simple)).toStrictEqual(hexToUint8Array('f8ff'));
    // The writer must still be usable afterwards.
    expect(encoder.encode({a: 1})).toStrictEqual(hexToUint8Array('a1616101'));
  });
});
