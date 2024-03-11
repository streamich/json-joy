import {Writer} from '../../../util/buffers/Writer';
import {CborEncoderDag} from '../CborEncoderDag';
import {CborDecoder} from '../CborDecoder';
import {JsonPackExtension} from '../../JsonPackExtension';
import {CborDecoderDag} from '../CborDecoderDag';

const writer = new Writer(1);
const encoder = new CborEncoderDag(writer);
const decoder = new CborDecoder();

describe('special tokens are not permitted', () => {
  test('undefined', () => {
    const encoded = encoder.encode(undefined);
    const val = decoder.read(encoded);
    expect(val).toBe(null);
    expect(encoded.length).toBe(1);
  });

  test('NaN', () => {
    const encoded = encoder.encode(NaN);
    const val = decoder.read(encoded);
    expect(val).toBe(null);
    expect(encoded.length).toBe(1);
  });

  test('+Infinity', () => {
    const encoded = encoder.encode(+Infinity);
    const val = decoder.read(encoded);
    expect(val).toBe(null);
    expect(encoded.length).toBe(1);
  });

  test('-Infinity', () => {
    const encoded = encoder.encode(-Infinity);
    const val = decoder.read(encoded);
    expect(val).toBe(null);
    expect(encoded.length).toBe(1);
  });
});

describe('only extension = 42 is permitted', () => {
  test('can encode a value with extension 42', () => {
    const encoded = encoder.encode({a: 'a', b: new JsonPackExtension(42, 'b')});
    const val = decoder.read(encoded);
    expect(val).toStrictEqual({a: 'a', b: new JsonPackExtension(42, 'b')});
  });

  test('non-42 extensions are not encoded', () => {
    const encoded = encoder.encode({a: 'a', b: new JsonPackExtension(43, 'b')});
    const val = decoder.read(encoded);
    expect(val).toStrictEqual({a: 'a', b: 'b'});
  });

  class CID {
    constructor(public readonly value: string) {}
  }
  class NotCID {
    constructor(public readonly value: string) {}
  }

  class IpfsCborEncoder extends CborEncoderDag {
    public writeUnknown(val: unknown): void {
      if (val instanceof CID) this.writeTag(42, val.value);
      else throw new Error('Unknown value type');
    }
  }

  class IpfsCborDecoder extends CborDecoderDag {
    public readTagRaw(tag: number): CID | unknown {
      if (tag === 42) return new CID(this.val() as any);
      throw new Error('UNKNOWN_TAG');
    }
  }

  test('can encode CID using inlined custom class', () => {
    const encoder = new IpfsCborEncoder();
    const encoded = encoder.encode({a: 'a', b: new JsonPackExtension(42, 'b')});
    const val = decoder.read(encoded);
    expect(val).toStrictEqual({a: 'a', b: new JsonPackExtension(42, 'b')});
    const encoded2 = encoder.encode({a: 'a', b: new CID('b')});
    const val2 = decoder.decode(encoded2);
    expect(val).toStrictEqual({a: 'a', b: new JsonPackExtension(42, 'b')});
    expect(val2).toStrictEqual({a: 'a', b: new JsonPackExtension(42, 'b')});
  });

  test('can encode CID inside a nested array', () => {
    const encoder = new IpfsCborEncoder();
    const decoder = new IpfsCborDecoder();
    const cid = new CID('my-cid');
    const data = [1, [2, [3, cid, 4], 5], 6];
    const encoded = encoder.encode(data);
    const decoded = decoder.decode(encoded);
    expect(decoded).toStrictEqual(data);
  });

  test('can throw on unknown custom class', () => {
    const encoder = new IpfsCborEncoder();
    const encoded1 = encoder.encode({a: 'a', b: new CID('b')});
    expect(() => encoder.encode({a: 'a', b: new NotCID('b')})).toThrowError(new Error('Unknown value type'));
  });
});
