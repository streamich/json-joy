import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborEncoderStable} from '../CborEncoderStable';
import {CborDecoderDag} from '../CborDecoderDag';
import {JsonPackExtension} from '../../JsonPackExtension';

const writer = new Writer(1);
const encoder = new CborEncoderStable(writer);
const decoder = new CborDecoderDag();

describe('only extension = 42 is permitted', () => {
  test('can decode a value with extension 42', () => {
    const encoded = encoder.encode({a: 'a', b: new JsonPackExtension(42, 'b')});
    const val = decoder.read(encoded);
    expect(val).toStrictEqual({a: 'a', b: new JsonPackExtension(42, 'b')});
  });

  test('non-42 extensions are not processed', () => {
    const encoded = encoder.encode({a: 'a', b: new JsonPackExtension(43, 'b')});
    const val = decoder.read(encoded);
    expect(val).toStrictEqual({a: 'a', b: 'b'});
  });

  // test('can encode CID using inlined custom class', () => {
  //   class CID {
  //     constructor(public readonly value: string) {}
  //   }
  //   const encoder = new CborEncoderDag(writer);
  //   encoder.writeUnknown = (val: unknown): void => {
  //     if (val instanceof CID) encoder.writeTag(42, val.value);
  //     else throw new Error('Unknown value type');
  //   };
  //   const encoded = encoder.encode({a: 'a', b: new JsonPackExtension(42, 'b')});
  //   const val = decoder.read(encoded);
  //   expect(val).toStrictEqual({a: 'a', b: new JsonPackExtension(42, 'b')});
  //   const encoded2 = encoder.encode({a: 'a', b: new CID('b')});
  //   const val2 = decoder.read(encoded2);
  //   expect(val).toStrictEqual({a: 'a', b: new JsonPackExtension(42, 'b')});
  // });

  // test('can throw on unknown custom class', () => {
  //   class CID {
  //     constructor(public readonly value: string) {}
  //   }
  //   class NotCID {
  //     constructor(public readonly value: string) {}
  //   }
  //   const encoder = new CborEncoderDag(writer);
  //   encoder.writeUnknown = (val: unknown): void => {
  //     if (val instanceof CID) encoder.writeTag(42, val.value);
  //     else throw new Error('Unknown value type');
  //   };
  //   const encoded1 = encoder.encode({a: 'a', b: new CID('b')});
  //   expect(() => encoder.encode({a: 'a', b: new NotCID('b')})).toThrowError(new Error('Unknown value type'));
  // });
});
