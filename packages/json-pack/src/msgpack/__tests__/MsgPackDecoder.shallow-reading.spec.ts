import {MsgPackEncoder} from '../MsgPackEncoder';
import {MsgPackDecoder} from '../MsgPackDecoder';

const encoder = new MsgPackEncoder();
const decoder = new MsgPackDecoder();

describe('shallow reading values, without parsing the document', () => {
  describe('reading object header', () => {
    test('can read object size of empty oject', () => {
      const encoded = encoder.encode({});
      decoder.reader.reset(encoded);
      const size = decoder.readObjHdr();
      expect(size).toBe(0);
    });

    test('can read small object size', () => {
      const encoded = encoder.encode({foo: 'bar', a: 1, b: 2});
      decoder.reader.reset(encoded);
      const size = decoder.readObjHdr();
      expect(size).toBe(3);
    });

    test('medium size object size', () => {
      const encoded = encoder.encode({
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 16,
        17: 17,
      });
      decoder.reader.reset(encoded);
      const size = decoder.readObjHdr();
      expect(size).toBe(17);
    });

    test('throws if value is not an object', () => {
      const encoded = encoder.encode([]);
      decoder.reader.reset(encoded);
      expect(() => decoder.readObjHdr()).toThrowError();
    });
  });

  describe('object key finding', () => {
    test('can find object key', () => {
      const encoded = encoder.encode({foo: 'bar'});
      decoder.reader.reset(encoded);
      const decoded = decoder.findKey('foo').readAny();
      expect(decoded).toBe('bar');
    });

    test('can find object key in the middle of the object', () => {
      const encoded = encoder.encode({x: 123, y: 0, z: -1});
      decoder.reader.reset(encoded);
      const decoded = decoder.findKey('y').readAny();
      expect(decoded).toBe(0);
    });

    test('can find object key at the end of the object', () => {
      const encoded = encoder.encode({x: 123, y: 0, z: -1});
      decoder.reader.reset(encoded);
      const decoded = decoder.findKey('z').readAny();
      expect(decoded).toBe(-1);
    });
  });

  describe('reading array header', () => {
    test('can read array size of an empty array', () => {
      const encoded = encoder.encode([]);
      decoder.reader.reset(encoded);
      const size = decoder.readArrHdr();
      expect(size).toBe(0);
    });

    test('can read small array size', () => {
      const encoded = encoder.encode(['bar', 1, 2]);
      decoder.reader.reset(encoded);
      const size = decoder.readArrHdr();
      expect(size).toBe(3);
    });

    test('medium size array size', () => {
      const encoded = encoder.encode([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
      decoder.reader.reset(encoded);
      const size = decoder.readArrHdr();
      expect(size).toBe(17);
    });

    test('throws if value is not an array', () => {
      const encoded = encoder.encode({});
      decoder.reader.reset(encoded);
      expect(() => decoder.readArrHdr()).toThrowError();
    });
  });

  describe('array index finding', () => {
    test('can find value at beginning of array', () => {
      const encoded = encoder.encode(['foobar']);
      decoder.reader.reset(encoded);
      const decoded = decoder.findIndex(0).readAny();
      expect(decoded).toBe('foobar');
    });

    test('can find value in the middle of array', () => {
      const encoded = encoder.encode([1, 2, 3]);
      decoder.reader.reset(encoded);
      const decoded = decoder.findIndex(1).readAny();
      expect(decoded).toBe(2);
    });

    test('can find value at the end of array', () => {
      const encoded = encoder.encode([1, 2, 3]);
      decoder.reader.reset(encoded);
      const decoded = decoder.findIndex(2).readAny();
      expect(decoded).toBe(3);
    });

    test('throws if array index is out of bounds', () => {
      const encoded = encoder.encode([1, 2, 3]);
      decoder.reader.reset(encoded);
      expect(() => decoder.findIndex(3).readAny()).toThrowError();
    });

    test('throws when reading value from an empty array', () => {
      const encoded = encoder.encode([]);
      decoder.reader.reset(encoded);
      expect(() => decoder.findIndex(0).readAny()).toThrowError();
    });
  });

  test('can shallow read a deeply nested value', () => {
    const encoded = encoder.encode({
      a: {
        b: {
          c: {
            d: {
              e: [1, 2, 3],
            },
            hmm: [
              {
                foo: 'bar',
              },
            ],
          },
        },
      },
    });

    decoder.reader.reset(encoded);
    const decoded1 = decoder.findKey('a').findKey('b').findKey('c').findKey('d').findKey('e').readAny();
    expect(decoded1).toStrictEqual([1, 2, 3]);

    decoder.reader.reset(encoded);
    const decoded2 = decoder.findKey('a').findKey('b').findKey('c').findKey('d').findKey('e').findIndex(1).readAny();
    expect(decoded2).toBe(2);

    decoder.reader.reset(encoded);
    const decoded3 = decoder
      .findKey('a')
      .findKey('b')
      .findKey('c')
      .findKey('hmm')
      .findIndex(0)
      .findKey('foo')
      .readAny();
    expect(decoded3).toBe('bar');
  });
});
