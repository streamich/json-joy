import {IonEncoderFast} from '../IonEncoderFast';
import {IonDecoder} from '../IonDecoder';

describe('IonDecoder', () => {
  let encoder: IonEncoderFast;
  let decoder: IonDecoder;

  beforeEach(() => {
    encoder = new IonEncoderFast();
    decoder = new IonDecoder();
  });

  const testRoundtrip = (value: unknown, name?: string) => {
    const encoded = encoder.encode(value);
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual(value);
  };

  describe('null values', () => {
    test('null', () => {
      testRoundtrip(null);
    });
  });

  describe('boolean values', () => {
    test('true', () => {
      testRoundtrip(true);
    });

    test('false', () => {
      testRoundtrip(false);
    });
  });

  describe('integer values', () => {
    test('0', () => {
      testRoundtrip(0);
    });

    test('positive integers', () => {
      testRoundtrip(1);
      testRoundtrip(127);
      testRoundtrip(128);
      testRoundtrip(255);
      testRoundtrip(256);
      testRoundtrip(65535);
      testRoundtrip(65536);
      testRoundtrip(16777215);
      testRoundtrip(16777216);
      testRoundtrip(4294967295);
    });

    test('negative integers', () => {
      testRoundtrip(-1);
      testRoundtrip(-127);
      testRoundtrip(-128);
      testRoundtrip(-255);
      testRoundtrip(-256);
      testRoundtrip(-65535);
      testRoundtrip(-65536);
      testRoundtrip(-16777215);
      testRoundtrip(-16777216);
      testRoundtrip(-4294967295);
    });
  });

  describe('float values', () => {
    test('positive floats', () => {
      testRoundtrip(0.5);
      testRoundtrip(1.5);
      testRoundtrip(Math.PI);
      testRoundtrip(123.456);
    });

    test('negative floats', () => {
      testRoundtrip(-0.5);
      testRoundtrip(-1.5);
      testRoundtrip(-Math.PI);
      testRoundtrip(-123.456);
    });
  });

  describe('string values', () => {
    test('empty string', () => {
      testRoundtrip('');
    });

    test('short strings', () => {
      testRoundtrip('a');
      testRoundtrip('hello');
      testRoundtrip('world');
    });

    test('long strings', () => {
      testRoundtrip('a'.repeat(100));
      testRoundtrip('hello world '.repeat(10));
    });

    test('unicode strings', () => {
      testRoundtrip('café');
      testRoundtrip('🎉');
      testRoundtrip('こんにちは');
    });
  });

  describe('binary values', () => {
    test('empty binary', () => {
      const binary = new Uint8Array(0);
      testRoundtrip(binary);
    });

    test('small binary', () => {
      const binary = new Uint8Array([1, 2, 3, 4, 5]);
      testRoundtrip(binary);
    });

    test('large binary', () => {
      const binary = new Uint8Array(100);
      for (let i = 0; i < 100; i++) {
        binary[i] = i % 256;
      }
      testRoundtrip(binary);
    });
  });

  describe('array values', () => {
    test('empty array', () => {
      testRoundtrip([]);
    });

    test('simple arrays', () => {
      testRoundtrip([1, 2, 3]);
      testRoundtrip(['a', 'b', 'c']);
      testRoundtrip([true, false, null]);
    });

    test('mixed arrays', () => {
      testRoundtrip([1, 'hello', true, null, 3.14]);
    });

    test('nested arrays', () => {
      testRoundtrip([
        [1, 2],
        [3, 4],
      ]);
      testRoundtrip([[[1]], [[2]]]);
    });
  });

  describe('object values', () => {
    test('empty object', () => {
      testRoundtrip({});
    });

    test('simple objects', () => {
      testRoundtrip({a: 1});
      testRoundtrip({a: 1, b: 2});
      testRoundtrip({name: 'John', age: 30});
    });

    test('nested objects', () => {
      testRoundtrip({
        user: {
          name: 'John',
          profile: {
            age: 30,
            active: true,
          },
        },
      });
    });

    test('mixed nested structures', () => {
      testRoundtrip({
        users: [
          {name: 'John', age: 30},
          {name: 'Jane', age: 25},
        ],
        meta: {
          count: 2,
          active: true,
        },
      });
    });
  });

  describe('complex structures', () => {
    test('deep nesting', () => {
      const deep = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep',
              },
            },
          },
        },
      };
      testRoundtrip(deep);
    });

    test('large object', () => {
      const large: Record<string, number> = {};
      for (let i = 0; i < 100; i++) {
        large[`key${i}`] = i;
      }
      testRoundtrip(large);
    });
  });

  describe('edge cases', () => {
    test('object with empty string key', () => {
      testRoundtrip({'': 'value'});
    });

    test('array with mixed types', () => {
      testRoundtrip([null, true, false, 0, -1, 1, 3.14, '', 'hello', new Uint8Array([1, 2, 3]), [], {}]);
    });
  });
});
