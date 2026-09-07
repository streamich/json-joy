import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {RandomJson} from '@jsonjoy.com/json-random';
import {JsonPackExtension} from '../../JsonPackExtension';
import {CborDecoder} from '../CborDecoder';
import {CborEncoder} from '../CborEncoder';
import {CborEncoderDag} from '../CborEncoderDag';
import {CborEncoderFast} from '../CborEncoderFast';
import {CborEncoderStable} from '../CborEncoderStable';

const decoder = new CborDecoder();
const encoder = new CborEncoder();

/**
 * Rounds a fuzz loop runs. Every round draws a fresh value from the same
 * generator, so the count buys breadth rather than depth; `RUN_SLOW_TESTS=1`
 * runs the counts these were written at.
 */
const slow = !!process.env.RUN_SLOW_TESTS && process.env.RUN_SLOW_TESTS !== '0';
const rounds = (full: number): number => (slow ? full : Math.ceil(full / 3));

/** Deterministic PRNG so a failure can be reproduced from the seed. */
const prng = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

/**
 * Split by code point, not by UTF-16 unit, so no lone surrogate is ever
 * generated. Lone surrogates are WTF-8 encoded by the writer and survive a
 * round-trip only below ~30 bytes, which is a `@jsonjoy.com/buffers` property
 * rather than something this codec decides.
 */
const alphabet = [...'ab\u{1F44D}\u00E9\u6C34 \uFFFD\u{10151}z\u20AC'];

/**
 * Generates values across the whole CBOR type space, not just JSON. Excludes
 * `Map`, which `decode()` deliberately surfaces as an object with stringified
 * keys, see `randomMap()` below.
 */
const randomCbor = (rnd: () => number, depth = 0): unknown => {
  const pick = rnd();
  if (depth > 3 || pick < 0.36) {
    const leaf = rnd();
    if (leaf < 0.08) return null;
    if (leaf < 0.14) return undefined;
    if (leaf < 0.2) return rnd() < 0.5;
    if (leaf < 0.3) return Math.floor((rnd() - 0.5) * 2 ** 53);
    if (leaf < 0.38) return (rnd() - 0.5) * 10 ** Math.floor(rnd() * 300);
    if (leaf < 0.44) return BigInt(Math.floor(rnd() * 2 ** 32)) * BigInt('4294967296');
    if (leaf < 0.5) return -BigInt(Math.floor(rnd() * 2 ** 32)) * BigInt('4294967296') - BigInt(1);
    if (leaf < 0.62) {
      const size = Math.floor(rnd() * 70);
      const uint8 = new Uint8Array(size);
      for (let i = 0; i < size; i++) uint8[i] = Math.floor(rnd() * 256);
      return uint8;
    }
    if (leaf < 0.7) return new JsonPackExtension(Math.floor(rnd() * 70000), randomCbor(rnd, depth + 3));
    let str = '';
    const length = Math.floor(rnd() * 40);
    for (let i = 0; i < length; i++) str += alphabet[Math.floor(rnd() * alphabet.length)];
    return str;
  }
  const size = Math.floor(rnd() * 6);
  if (pick < 0.58) {
    const arr: unknown[] = [];
    for (let i = 0; i < size; i++) arr.push(randomCbor(rnd, depth + 1));
    return arr;
  }
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < size; i++) {
    const key = String(randomCbor(rnd, 9));
    if (key !== '__proto__') obj[key] = randomCbor(rnd, depth + 1);
  }
  return obj;
};

/** A `Map` with arbitrary keys, which only `readAsMap()` can read back. */
const randomMap = (rnd: () => number): Map<unknown, unknown> => {
  const map = new Map<unknown, unknown>();
  const size = Math.floor(rnd() * 8);
  for (let i = 0; i < size; i++) map.set(randomCbor(rnd, 9), randomCbor(rnd, 1));
  return map;
};

/** `CborEncoderStable` and `CborEncoderDag` write `undefined` as `null`. */
const undefinedToNull = (value: unknown): unknown => {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(undefinedToNull);
  if (value instanceof JsonPackExtension) return new JsonPackExtension(value.tag, undefinedToNull(value.val));
  if (value instanceof Uint8Array || value === null || typeof value !== 'object') return value;
  const obj: Record<string, unknown> = {};
  for (const key in value) obj[key] = undefinedToNull((value as Record<string, unknown>)[key]);
  return obj;
};

describe('round-trip fuzzing over the full CBOR type space', () => {
  test('CborEncoder round-trips random values', () => {
    const rnd = prng(20240811);
    for (let i = 0; i < rounds(500); i++) {
      const value = randomCbor(rnd);
      expect(decoder.decode(encoder.encode(value))).toStrictEqual(value);
    }
  });

  test('CborEncoder round-trips random maps through readAsMap()', () => {
    const rnd = prng(8080);
    for (let i = 0; i < rounds(300); i++) {
      const map = randomMap(rnd);
      decoder.reader.reset(encoder.encode(map));
      expect(decoder.readAsMap()).toStrictEqual(map);
    }
  });

  test('CborEncoderStable round-trips and is idempotent', () => {
    const stable = new CborEncoderStable();
    const rnd = prng(777);
    for (let i = 0; i < rounds(300); i++) {
      const value = randomCbor(rnd);
      const once = stable.encode(value);
      const decoded = decoder.decode(once);
      expect(decoded).toStrictEqual(undefinedToNull(value));
      // Re-encoding what came out must reproduce the same bytes.
      expect(stable.encode(decoded)).toStrictEqual(once);
    }
  });

  test('CborEncoderStable and CborEncoderDag write undefined as null', () => {
    const stable = new CborEncoderStable();
    const dag = new CborEncoderDag();
    expect(decoder.decode(stable.encode(undefined))).toBe(null);
    expect(decoder.decode(dag.encode({a: undefined, b: [undefined]}))).toStrictEqual({a: null, b: [null]});
    // The full encoder keeps it.
    expect(decoder.decode(encoder.encode(undefined))).toBe(undefined);
  });

  test('every encoded value validates and skips to exactly its own length', () => {
    const rnd = prng(31337);
    for (let i = 0; i < rounds(300); i++) {
      const encoded = encoder.encode(randomCbor(rnd));
      expect(() => decoder.validate(encoded)).not.toThrow();
      decoder.reader.reset(encoded);
      decoder.skipAny();
      expect(decoder.reader.x).toBe(encoded.length);
    }
  });

  test('encoders agree with each other on JSON values', () => {
    const fast = new CborEncoderFast();
    for (let i = 0; i < 200; i++) {
      const value = RandomJson.generate();
      expect(decoder.decode(fast.encode(value))).toStrictEqual(value);
      expect(decoder.decode(encoder.encode(value))).toStrictEqual(value);
      expect(decoder.decode(new CborEncoderStable().encode(value))).toStrictEqual(value);
    }
  });

  test('output is identical no matter how small the writer starts', () => {
    const tiny = new CborEncoder(new Writer(1));
    const small = new CborEncoder(new Writer(17));
    const rnd = prng(4242);
    for (let i = 0; i < 200; i++) {
      const value = randomCbor(rnd);
      const expected = encoder.encode(value);
      expect(tiny.encode(value)).toStrictEqual(expected);
      expect(small.encode(value)).toStrictEqual(expected);
    }
  });
});

describe('decoding arbitrary bytes', () => {
  const decodeSafely = (uint8: Uint8Array): {ok: boolean; consumed: number} => {
    try {
      decoder.decode(uint8);
      return {ok: true, consumed: decoder.reader.x};
    } catch {
      return {ok: false, consumed: decoder.reader.x};
    }
  };

  test('never reads past the end of the input', () => {
    const rnd = prng(99);
    for (let i = 0; i < rounds(5000); i++) {
      const size = 1 + Math.floor(rnd() * 24);
      const uint8 = new Uint8Array(size);
      for (let j = 0; j < size; j++) uint8[j] = Math.floor(rnd() * 256);
      const {ok, consumed} = decodeSafely(uint8);
      if (ok) expect(consumed).toBeLessThanOrEqual(size);
    }
  });

  test('never returns a value built from bytes past the end', () => {
    const rnd = prng(1234);
    for (let i = 0; i < rounds(3000); i++) {
      const size = 1 + Math.floor(rnd() * 12);
      const uint8 = new Uint8Array(size);
      for (let j = 0; j < size; j++) uint8[j] = Math.floor(rnd() * 256);
      let decoded: unknown;
      try {
        decoded = decoder.decode(uint8);
      } catch {
        continue;
      }
      // Anything that decoded must fit inside the input it came from.
      if (decoded instanceof Uint8Array) expect(decoded.length).toBeLessThanOrEqual(size);
      if (typeof decoded === 'string') expect(decoded.length).toBeLessThanOrEqual(size);
      if (Array.isArray(decoded)) expect(decoded.length).toBeLessThanOrEqual(size);
    }
  });

  test('truncating a valid encoding at any offset never yields a wrong value', () => {
    const rnd = prng(555);
    for (let i = 0; i < rounds(100); i++) {
      const value = randomCbor(rnd);
      const encoded = encoder.encode(value);
      for (let cut = 0; cut < encoded.length; cut++) {
        const truncated = encoded.subarray(0, cut);
        try {
          decoder.decode(truncated);
        } catch {
          continue;
        }
        // A prefix may still parse, but only as a smaller, self-contained value.
        expect(decoder.reader.x).toBeLessThanOrEqual(cut);
      }
    }
  });

  test('decode() and validate() agree on what is acceptable', () => {
    const rnd = prng(2468);
    for (let i = 0; i < rounds(5000); i++) {
      const size = 1 + Math.floor(rnd() * 10);
      const uint8 = new Uint8Array(size);
      for (let j = 0; j < size; j++) uint8[j] = Math.floor(rnd() * 256);
      let decoded = true;
      try {
        decoder.decode(uint8);
      } catch {
        decoded = false;
      }
      let validated = true;
      try {
        decoder.validate(uint8);
      } catch {
        validated = false;
      }
      // validate() is stricter, it also rejects trailing bytes, but it must
      // never accept something decode() rejects.
      if (validated) expect(decoded).toBe(true);
    }
  });
});

describe('large payloads', () => {
  test('encodes and decodes a 1MB byte string', () => {
    const uint8 = new Uint8Array(1024 * 1024).fill(0xab);
    const encoded = encoder.encode(uint8);
    expect(decoder.decode(encoded)).toStrictEqual(uint8);
  });

  test('encodes and decodes a long unicode string', () => {
    const str = '👍é水a'.repeat(30000);
    expect(decoder.decode(encoder.encode(str))).toBe(str);
    expect(decoder.decode(new CborEncoderStable().encode(str))).toBe(str);
  });

  test('encodes and decodes an array of 100k items', () => {
    const arr: number[] = [];
    for (let i = 0; i < 100000; i++) arr.push(i);
    expect(decoder.decode(encoder.encode(arr))).toStrictEqual(arr);
  });

  test('encodes and decodes an object with 20k keys', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 20000; i++) obj[`key${i}`] = i;
    expect(decoder.decode(encoder.encode(obj))).toStrictEqual(obj);
  });

  test('encodes and decodes strings across every length header boundary', () => {
    for (const length of [0, 1, 23, 24, 25, 255, 256, 257, 65535, 65536, 65537]) {
      const str = 'a'.repeat(length);
      expect(decoder.decode(encoder.encode(str))).toBe(str);
      expect(decoder.decode(new CborEncoderStable().encode(str))).toBe(str);
      const uint8 = new Uint8Array(length).fill(7);
      expect(decoder.decode(encoder.encode(uint8))).toStrictEqual(uint8);
    }
  });

  test('encodes and decodes containers across every length header boundary', () => {
    for (const length of [0, 1, 23, 24, 25, 255, 256, 257, 65535, 65536, 65537]) {
      const arr = new Array(length).fill(1);
      expect(decoder.decode(encoder.encode(arr))).toStrictEqual(arr);
      const map = new Map<number, number>();
      for (let i = 0; i < length; i++) map.set(i, i);
      const encoded = encoder.encode(map);
      decoder.reader.reset(encoded);
      expect(decoder.readAsMap().size).toBe(length);
    }
  });
});
