import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborEncoderStable} from '../CborEncoderStable';
import {encode} from 'cborg';

const writer = new Writer(1);
const encoder = new CborEncoderStable(writer);

describe('objects', () => {
  test('sorts keys lexicographically', () => {
    const obj1 = {
      a: 1,
      b: 2,
    };
    const encoded1 = encoder.encode(obj1);
    const encoded2 = encode(obj1);
    expect(encoded1).toStrictEqual(encoded2);
    const obj2 = {
      b: 2,
      a: 1,
    };
    const encoded3 = encoder.encode(obj2);
    const encoded4 = encode(obj2);
    expect(encoded3).toStrictEqual(encoded4);
    expect(encoded1).toStrictEqual(encoded3);
  });

  test('sorts keys by length', () => {
    const obj1 = {
      aa: 1,
      b: 2,
    };
    const encoded1 = encoder.encode(obj1);
    const encoded2 = encode(obj1);
    expect(encoded1).toStrictEqual(encoded2);
    const obj2 = {
      b: 2,
      aa: 1,
    };
    const encoded3 = encoder.encode(obj2);
    const encoded4 = encode(obj2);
    expect(encoded3).toStrictEqual(encoded4);
    expect(encoded1).toStrictEqual(encoded3);
  });
});

describe('floats', () => {
  test('always encoded as 8 bytes', () => {
    for (let i = 0; i < 100; i++) {
      const val = Math.random() * 100000;
      const encoded1 = encoder.encode(val);
      const encoded2 = encode(val);
      expect(encoded1).toStrictEqual(encoded2);
      expect(encoded1.length).toBe(9);
    }
  });
});

describe('numbers and bigints', () => {
  const assertNumber = (val: number, length: number) => {
    const encoded1 = encoder.encode(val);
    const encoded2 = encode(val);
    expect(encoded1).toStrictEqual(encoded2);
    expect(encoded1.length).toBe(length);
    const encoded3 = encoder.encode(BigInt(val));
    expect(encoded1).toStrictEqual(encoded3);
  };

  describe('positive', () => {
    test('numbers up to 23 are encoded as one byte', () => {
      for (let i = 0; i < 24; i++) {
        assertNumber(i, 1);
      }
    });

    test('numbers between 24 and 0xff are encoded as two bytes', () => {
      assertNumber(24, 2);
      assertNumber(0xff, 2);
      for (let i = 0; i < 100; i++) {
        const val = Math.round(Math.random() * (0xff - 24) + 24);
        assertNumber(val, 2);
      }
    });

    test('numbers between 0xff + 1 and 0xffff are encoded as three bytes', () => {
      assertNumber(0xff + 1, 3);
      assertNumber(0xffff, 3);
      for (let i = 0; i < 100; i++) {
        const val = Math.round(Math.random() * (0xffff - (0xff + 1)) + 0xff + 1);
        assertNumber(val, 3);
      }
    });

    test('numbers between 0xffff + 1 and 0xffffffff are encoded as five bytes', () => {
      assertNumber(0xffff + 1, 5);
      assertNumber(0xffffffff, 5);
      for (let i = 0; i < 100; i++) {
        const val = Math.round(Math.random() * (0xffffffff - (0xffff + 1)) + 0xffff + 1);
        assertNumber(val, 5);
      }
    });

    test('numbers between 0xffffffff + 1 and Number.MAX_SAFE_INTEGER are encoded as nine bytes', () => {
      assertNumber(0xffffffff + 1, 9);
      assertNumber(Number.MAX_SAFE_INTEGER, 9);
      for (let i = 0; i < 100; i++) {
        const val = Math.round(Math.random() * (Number.MAX_SAFE_INTEGER - (0xffffffff + 1)) + 0xffffffff + 1);
        assertNumber(val, 9);
      }
    });
  });

  describe('negative', () => {
    test('numbers between -24 and -1 are encoded as one byte', () => {
      assertNumber(-24, 1);
      assertNumber(-1, 1);
      for (let i = 0; i < 100; i++) {
        const val = Math.round(Math.random() * (-1 - -24) + -24);
        assertNumber(val, 1);
      }
    });

    test('numbers between -0xff - 1 and -25 are encoded as two bytes', () => {
      assertNumber(-0xff, 2);
      assertNumber(-0xff - 1, 2);
      assertNumber(-25, 2);
      for (let i = 0; i < 100; i++) {
        const val = Math.round(Math.random() * (-25 - -0xff) + -0xff);
        assertNumber(val, 2);
      }
    });

    test('numbers between -0xffff - 1 and -0xff - 2 are encoded as three bytes', () => {
      assertNumber(-0xffff, 3);
      assertNumber(-0xff - 2, 3);
      for (let i = 0; i < 100; i++) {
        const val = Math.round(Math.random() * (-0xff - 2 - -0xffff) + -0xffff);
        assertNumber(val, 3);
      }
    });

    test('numbers between -0xffffffff - 1 and -0xffff - 2 are encoded as five bytes', () => {
      assertNumber(-0xffffffff, 5);
      assertNumber(-0xffff - 2, 5);
      for (let i = 0; i < 100; i++) {
        const val = Math.round(Math.random() * (-0xffff - 2 - -0xffffffff) + -0xffffffff);
        assertNumber(val, 5);
      }
    });

    test('numbers between Number.MIN_SAFE_INTEGER and -0xffffffff - 2 are encoded as nine bytes', () => {
      assertNumber(Number.MIN_SAFE_INTEGER, 9);
      assertNumber(-0xffffffff - 2, 9);
      for (let i = 0; i < 100; i++) {
        const val = Math.round(Math.random() * (-0xffffffff - 2 - Number.MIN_SAFE_INTEGER) + Number.MIN_SAFE_INTEGER);
        assertNumber(val, 9);
      }
    });
  });
});

describe('strings', () => {
  const assertString = (val: string, length: number) => {
    const encoded1 = encoder.encode(val);
    expect(encoded1.length).toBe(length);
  };

  test('strings shorter than 24 byte consume 1 byte header', () => {
    assertString('', 1);
    assertString('a', 2);
    assertString('a'.repeat(4), 5);
    assertString('a'.repeat(8), 9);
    assertString('a'.repeat(16), 17);
    assertString('a'.repeat(23), 24);
  });

  test('strings between 24 and 0xff bytes consume 2 byte header', () => {
    assertString('b'.repeat(24), 26);
    assertString('b'.repeat(0xff), 0xff + 2);
    for (let i = 0; i < 5; i++) {
      const len = Math.round(Math.random() * (0xff - 24) + 24);
      assertString('b'.repeat(len), len + 2);
    }
  });

  test('strings between 0xff + 1 and 0xffff bytes consume 3 byte header', () => {
    assertString('c'.repeat(0xff + 1), 0xff + 1 + 3);
    assertString('c'.repeat(0xffff), 0xffff + 3);
    for (let i = 0; i < 10; i++) {
      const len = Math.round(Math.random() * (0xffff - (0xff + 1)) + 0xff + 1);
      assertString('c'.repeat(len), len + 3);
    }
  });

  test('strings between over 0xffff + 1 bytes consume 5 byte header', () => {
    assertString('d'.repeat(0xffff + 1), 0xffff + 1 + 5);
    for (let i = 0; i < 10; i++) {
      const len = Math.round(Math.random() * (0xfffff - (0xffff + 1)) + 0xffff + 1);
      assertString('c'.repeat(len), len + 5);
    }
  });
});

describe('recursion', () => {
  test('can prevent recursive objects', () => {
    const encoder = new (class extends CborEncoderStable {
      private readonly objectSet = new Set<unknown>();

      public encode(value: unknown): Uint8Array {
        this.objectSet.clear();
        return super.encode(value);
      }

      public writeAny(value: unknown): void {
        if (this.objectSet.has(value)) {
          throw new Error('Recursive object');
        }
        this.objectSet.add(value);
        super.writeAny(value);
      }
    })();
    const obj1 = {a: 1};
    const obj2 = {b: 2};
    (<any>obj1).b = obj2;
    (<any>obj2).a = obj1;
    expect(() => encoder.encode(obj1)).toThrowError('Recursive object');
  });
});
