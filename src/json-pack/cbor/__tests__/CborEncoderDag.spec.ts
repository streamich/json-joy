import {Writer} from '../../../util/buffers/Writer';
import {CborEncoderDag} from '../CborEncoderDag';
import {CborDecoder} from '../CborDecoder';
import {JsonPackExtension} from '../../JsonPackExtension';

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

  test('can encode CID using inlined custom class', () => {
    class CID {
      constructor(public readonly value: string) {}
    }
    const encoder = new (class extends CborEncoderDag {
      public writeUnknown(val: unknown): void {
        if (val instanceof CID) encoder.writeTag(42, val.value);
        else throw new Error('Unknown value type');
      }
    })();
    const encoded = encoder.encode({a: 'a', b: new JsonPackExtension(42, 'b')});
    const val = decoder.read(encoded);
    expect(val).toStrictEqual({a: 'a', b: new JsonPackExtension(42, 'b')});
    const encoded2 = encoder.encode({a: 'a', b: new CID('b')});
    const val2 = decoder.read(encoded2);
    expect(val).toStrictEqual({a: 'a', b: new JsonPackExtension(42, 'b')});
  });

  test('can throw on unknown custom class', () => {
    class CID {
      constructor(public readonly value: string) {}
    }
    class NotCID {
      constructor(public readonly value: string) {}
    }
    const encoder = new (class extends CborEncoderDag {
      public writeUnknown(val: unknown): void {
        if (val instanceof CID) encoder.writeTag(42, val.value);
        else throw new Error('Unknown value type');
      }
    })();
    const encoded1 = encoder.encode({a: 'a', b: new CID('b')});
    expect(() => encoder.encode({a: 'a', b: new NotCID('b')})).toThrowError(new Error('Unknown value type'));
  });
});
