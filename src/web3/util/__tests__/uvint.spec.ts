import {read, write} from '../uvint';

describe('read', () => {
  test('can read single byte uvint', () => {
    expect(read(new Uint8Array([0]), 0)).toEqual([0, 1])
    expect(read(new Uint8Array([1]), 0)).toEqual([1, 1])
    expect(read(new Uint8Array([65]), 0)).toEqual([65, 1])
    expect(read(new Uint8Array([0b1111111]), 0)).toEqual([0b1111111, 1])
  });

  test('can read two byte uvint', () => {
    expect(read(new Uint8Array([0b10000000, 0b00000001]), 0)).toEqual([0x80, 2])
    expect(read(new Uint8Array([0b11111111, 0b00000001]), 0)).toEqual([0xff, 2])
    expect(read(new Uint8Array([0b10101100, 0b00000010]), 0)).toEqual([0x012c, 2])
  });

  test('can read three byte uvint', () => {
    expect(read(new Uint8Array([0b10000000, 0b10000000, 0b00000001]), 0)).toEqual([0x4000, 3])
  });
});

describe('write', () => {
  test('can write single byte uvint', () => {
    const buf = new Uint8Array(4);
    const offset = write(buf, 1, 5);
    expect(offset).toEqual(2);
    expect(buf[1]).toEqual(5);
  });

  test('can write two byte uvint', () => {
    const buf = new Uint8Array(4);
    const offset = write(buf, 2, 222);
    expect(offset).toEqual(4);
    expect(buf[2]).toEqual(222);
    expect(buf[3]).toEqual(1);
  });

  describe('can write different positive integers', () => {
    const integers = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
      0x7f, 0x80, 0x81, 0x82, 0x83, 0x84, 0x85,
      0b0_0000000_0011100_1111101,
      0b0_0000100_0011100_1111101,
      0b0_0000101_1011100_1111101,
      0b0_0010101_1011100_1111101,
      0b0_0110101_1011100_1111101,
      0b0_0111101_1011100_1111101,
      0b0_1000000_0000000_0100000,
      0b0_1011000_0000000_0100000,
      0b0_1011000_0000000_0100001,
      0b0_1011000_0000000_0101111,
      0b0_1011000_0000000_0111111,
      0b0_1011000_1110000_0111111,
      0b0_1011111_1110000_0111111,
      0b0_1111111_1110000_0111111,
      0b0_1111111_1110110_0111111,
      0b0_1111111_1111111_1111111,
    ];
    for (const int of integers) {
      test(String(int), () => {
        const buf = new Uint8Array(5);
        const offset = write(buf, 1, int);
        expect(offset).toBeLessThanOrEqual(4);
        const [value, newOffset] = read(buf, 1);
        expect(value).toEqual(int);
        expect(newOffset).toEqual(offset);
      });
    }
  });
});
