import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {RandomJson} from '@jsonjoy.com/json-random';
import {encode as cborgEncode} from 'cborg';
import {CborDecoder} from '../CborDecoder';
import {CborEncoderDag} from '../CborEncoderDag';
import {CborEncoderStable} from '../CborEncoderStable';
import {uint8ArrayToHex} from './rfc8949-vectors';

const encoder = new CborEncoderStable();
const dag = new CborEncoderDag();
const decoder = new CborDecoder();
const hex = (value: unknown) => uint8ArrayToHex(encoder.encode(value));

/** `cborg` implements RFC 8949 §4.2.1 deterministic encoding, use it as oracle. */
const expectSameAsCborg = (value: unknown) => expect(hex(value)).toBe(uint8ArrayToHex(cborgEncode(value)));

describe('object key ordering', () => {
  test('sorts ASCII keys by length, then lexicographically', () => {
    expect(hex({b: 1, a: 2, aa: 3, '': 4})).toBe(hex({'': 4, aa: 3, a: 2, b: 1}));
    expectSameAsCborg({b: 1, a: 2, aa: 3, '': 4});
  });

  test('sorts by UTF-8 byte length, not by JS string length', () => {
    // "ÿ" is one UTF-16 unit but two UTF-8 bytes, so it sorts after "zz".
    expectSameAsCborg({ÿ: 1, zz: 2});
    expectSameAsCborg({zz: 2, ÿ: 1});
    expect(hex({ÿ: 1, zz: 2})).toBe('a2627a7a0262c3bf01');
    expect(hex({zz: 2, ÿ: 1})).toBe('a2627a7a0262c3bf01');
    // "€" is one UTF-16 unit but three UTF-8 bytes.
    expectSameAsCborg({'€': 1, ab: 2});
    expect(hex({'€': 1, ab: 2})).toBe('a26261620263e282ac01');
  });

  test('sorts by code point, not by UTF-16 code unit', () => {
    // Both keys are four UTF-8 bytes, so the tie is broken by code point. As
    // UTF-16 the surrogate pair of U+1F600 starts at 0xD83D, which sorts below
    // U+FFFD, the opposite of the UTF-8 byte order.
    const astral = '\u{1F600}';
    const bmp = '\uFFFD\u007F';
    expect(hex({[astral]: 1, [bmp]: 2})).toBe('a264efbfbd7f0264f09f988001');
    expect(hex({[bmp]: 2, [astral]: 1})).toBe(hex({[astral]: 1, [bmp]: 2}));
    expectSameAsCborg({[astral]: 1, [bmp]: 2});
  });

  test('sorts across the one and two byte header boundary', () => {
    const short = 'a'.repeat(23);
    const long = 'b'.repeat(24);
    expectSameAsCborg({[long]: 1, [short]: 2});
    expect(hex({[long]: 1, [short]: 2}).slice(0, 4)).toBe('a277');
  });

  test('is independent of insertion order', () => {
    const keys = ['b', 'a', 'aa', '', 'ÿ', 'zz', '€', '😀', 'z'.repeat(30), 'Z'];
    const forward: Record<string, number> = {};
    const backward: Record<string, number> = {};
    keys.forEach((key, i) => {
      forward[key] = i;
    });
    [...keys].reverse().forEach((key) => {
      backward[key] = keys.indexOf(key);
    });
    expect(hex(forward)).toBe(hex(backward));
    expectSameAsCborg(forward);
  });

  test('ordering survives a decode/encode round-trip', () => {
    const value = {ÿ: 1, zz: 2, '€': 3, a: 4};
    const once = encoder.encode(value);
    const twice = encoder.encode(decoder.decode(once));
    expect(uint8ArrayToHex(twice)).toBe(uint8ArrayToHex(once));
  });

  test('nested objects are sorted too', () => {
    expectSameAsCborg({b: {d: 1, c: 2}, a: [{f: 1, e: 2}]});
  });
});

describe('map key ordering', () => {
  test('sorts string keys', () => {
    expect(
      uint8ArrayToHex(
        encoder.encode(
          new Map([
            ['b', 1],
            ['a', 2],
          ]),
        ),
      ),
    ).toBe('a2616102616201');
  });

  test('sorts integer keys bytewise', () => {
    const map = new Map<unknown, unknown>([
      [2, 'b'],
      [1, 'a'],
      [-1, 'c'],
    ]);
    expect(uint8ArrayToHex(encoder.encode(map))).toBe(uint8ArrayToHex(cborgEncode(map)));
  });

  test('sorts mixed type keys bytewise over their encodings', () => {
    const map = new Map<unknown, unknown>([
      ['x', 1],
      [1, 'a'],
      [-1, 'b'],
      [true, 2],
      [new Uint8Array([1]), 3],
    ]);
    // Keys encode to 01 < 20 < 4101 < 6178 < f5.
    expect(uint8ArrayToHex(encoder.encode(map))).toBe('a5016161206162410103617801f502');
  });

  test('is independent of insertion order', () => {
    const entries: [unknown, unknown][] = [
      ['zz', 1],
      [3, 2],
      ['a', 3],
      [-7, 4],
      [false, 5],
      ['ÿ', 6],
    ];
    const forward = uint8ArrayToHex(encoder.encode(new Map(entries)));
    const backward = uint8ArrayToHex(encoder.encode(new Map([...entries].reverse())));
    expect(forward).toBe(backward);
  });

  test('sorts nested maps', () => {
    const inner = new Map<unknown, unknown>([
      ['b', 1],
      ['a', 2],
    ]);
    const outer = new Map<unknown, unknown>([
      ['y', inner],
      ['x', inner],
    ]);
    expect(uint8ArrayToHex(encoder.encode(outer))).toBe('a26178a26161026162016179a2616102616201');
  });

  test('sorts correctly when the writer grows mid-map', () => {
    const small = new CborEncoderStable(new Writer(1));
    const entries: [string, string][] = [];
    for (let i = 0; i < 40; i++) entries.push([`k${40 - i}`, 'v'.repeat(50)]);
    const map = new Map(entries);
    expect(uint8ArrayToHex(small.encode(map))).toBe(uint8ArrayToHex(encoder.encode(map)));
    expect(decoder.readAsMap.call((decoder.reader.reset(small.encode(map)), decoder))).toStrictEqual(map);
  });

  test('a single entry map is written as is', () => {
    expect(uint8ArrayToHex(encoder.encode(new Map([['a', 1]])))).toBe('a1616101');
    expect(uint8ArrayToHex(encoder.encode(new Map()))).toBe('a0');
  });

  test('map round-trips through readAsMap()', () => {
    const map = new Map<unknown, unknown>([
      ['b', 1],
      ['a', [1, 2]],
      [7, 'x'],
    ]);
    const encoded = encoder.encode(map);
    decoder.reader.reset(encoded);
    expect(decoder.readAsMap()).toStrictEqual(map);
  });
});

describe('byte for byte stability', () => {
  test('same value encodes to the same bytes across instances and writer sizes', () => {
    for (let i = 0; i < 50; i++) {
      const value = RandomJson.generate();
      const a = uint8ArrayToHex(new CborEncoderStable(new Writer(1)).encode(value));
      const b = uint8ArrayToHex(new CborEncoderStable(new Writer(64 * 1024)).encode(value));
      const c = uint8ArrayToHex(encoder.encode(value));
      expect(a).toBe(b);
      expect(b).toBe(c);
    }
  });

  test('matches cborg on random JSON', () => {
    for (let i = 0; i < 50; i++) {
      const value = RandomJson.generate();
      expect(uint8ArrayToHex(encoder.encode(value))).toBe(uint8ArrayToHex(cborgEncode(value)));
    }
  });

  test('DAG encoder inherits the deterministic ordering', () => {
    expect(uint8ArrayToHex(dag.encode({ÿ: 1, zz: 2}))).toBe('a2627a7a0262c3bf01');
    expect(
      uint8ArrayToHex(
        dag.encode(
          new Map([
            ['b', 1],
            ['a', 2],
          ]),
        ),
      ),
    ).toBe('a2616102616201');
  });
});
