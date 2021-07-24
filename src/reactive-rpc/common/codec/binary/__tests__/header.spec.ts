import {getHeaderSize, writeHeader} from '../header';

describe('getHeaderSize()', () => {
  test('one byte for short messages', () => {
    expect(getHeaderSize(0b1)).toBe(1);
    expect(getHeaderSize(0b11)).toBe(1);
    expect(getHeaderSize(0b111)).toBe(1);
    expect(getHeaderSize(0b1111)).toBe(1);
  });

  test('two bytes for longer messages', () => {
    expect(getHeaderSize(0b1_0000)).toBe(2);
    expect(getHeaderSize(0b11_0000)).toBe(2);
    expect(getHeaderSize(0b111_0000)).toBe(2);
    expect(getHeaderSize(0b1111_0000)).toBe(2);
    expect(getHeaderSize(0b11111_0000)).toBe(2);
    expect(getHeaderSize(0b111111_0000)).toBe(2);
    expect(getHeaderSize(0b1111111_0000)).toBe(2);
  });

  test('three bytes for messages that size exceeds 11 bits', () => {
    expect(getHeaderSize(0b1_1111111_0000)).toBe(3);
    expect(getHeaderSize(0b10_1111111_0000)).toBe(3);
    expect(getHeaderSize(0b100_1111111_0000)).toBe(3);
    expect(getHeaderSize(0b1000_1111111_0000)).toBe(3);
    expect(getHeaderSize(0b10000_1111111_0000)).toBe(3);
    expect(getHeaderSize(0b100000_1111111_0000)).toBe(3);
    expect(getHeaderSize(0b1000000_1111111_0000)).toBe(3);
  });

  test('multiple bytes for long messages', () => {
    expect(getHeaderSize(0b1000000_1111111_0000)).toBe(3);
    expect(getHeaderSize(0b1_1000000_1111111_0000)).toBe(4);
  });
});

describe('writeHeader()', () => {
  test('encodes type in the header', () => {
    const uint8 = new Uint8Array(3);
    writeHeader(uint8, 1, 0b101, 0);
    expect(uint8[1]).toBe(0b10100000);
    writeHeader(uint8, 1, 0b111, 0);
    expect(uint8[1]).toBe(0b11100000);
    writeHeader(uint8, 1, 0b001, 0);
    expect(uint8[1]).toBe(0b00100000);
    writeHeader(uint8, 1, 0b000, 1);
    expect(uint8[1]).toBe(0b00000001);
  });

  test('encodes header with length <= 0b1111 in a single byte', () => {
    const uint8 = new Uint8Array(5);
    const offset1 = writeHeader(uint8, 2, 0b101, 0);
    expect(uint8[2]).toBe(0b10100000);
    expect(offset1).toBe(3);
    const offset2 = writeHeader(uint8, 2, 0b101, 0b1);
    expect(uint8[2]).toBe(0b10100001);
    expect(offset2).toBe(3);
    const offset3 = writeHeader(uint8, 2, 0b101, 0b11);
    expect(uint8[2]).toBe(0b10100011);
    expect(offset3).toBe(3);
    const offset4 = writeHeader(uint8, 2, 0b101, 0b111);
    expect(uint8[2]).toBe(0b10100111);
    expect(offset4).toBe(3);
    const offset5 = writeHeader(uint8, 2, 0b101, 0b1111);
    expect(uint8[2]).toBe(0b10101111);
    expect(offset5).toBe(3);
    expect(uint8[0]).toBe(0);
    expect(uint8[1]).toBe(0);
    expect(uint8[3]).toBe(0);
    expect(uint8[4]).toBe(0);
  });

  test('encodes header with length <= 0b1111111_1111 in two bytes', () => {
    const uint8 = new Uint8Array(5);
    const offset1 = writeHeader(uint8, 2, 0b111, 0b10000);
    expect(uint8[2]).toBe(0b11110000);
    expect(uint8[3]).toBe(0b1);
    expect(offset1).toBe(4);
    const offset2 = writeHeader(uint8, 2, 0b111, 0b101010);
    expect(uint8[2]).toBe(0b11111010);
    expect(uint8[3]).toBe(0b10);
    expect(offset2).toBe(4);
    const offset3 = writeHeader(uint8, 2, 0b111, 0b1100110_0101);
    expect(uint8[2]).toBe(0b11110101);
    expect(uint8[3]).toBe(0b1100110);
    expect(offset3).toBe(4);
    expect(uint8[0]).toBe(0);
    expect(uint8[1]).toBe(0);
    expect(uint8[4]).toBe(0);
  });

  test('encodes header with length <= 0b1111111_1111111_1111 in three bytes', () => {
    const uint8 = new Uint8Array(6);
    const offset1 = writeHeader(uint8, 2, 0b000, 0b1001001_1111111_0001);
    expect(uint8[2]).toBe(0b00010001);
    expect(uint8[3]).toBe(0b11111111);
    expect(uint8[4]).toBe(0b01001001);
    expect(offset1).toBe(5);
    expect(uint8[0]).toBe(0);
    expect(uint8[1]).toBe(0);
    expect(uint8[5]).toBe(0);
  });

  test('encodes header with length <= 0b1111111_1111111_1111111_1111 in four bytes', () => {
    const uint8 = new Uint8Array(7);
    const offset1 = writeHeader(uint8, 2, 0b100, 0b1000000_1000001_1000010_1000);
    expect(uint8[2]).toBe(0b10011000);
    expect(uint8[3]).toBe(0b11000010);
    expect(uint8[4]).toBe(0b11000001);
    expect(uint8[5]).toBe(0b01000000);
    expect(offset1).toBe(6);
    expect(uint8[0]).toBe(0);
    expect(uint8[1]).toBe(0);
    expect(uint8[6]).toBe(0);
  });

  test('throws when encoding length larger than 0b1111111_1111111_1111111_1111111_1111', () => {
    const uint8 = new Uint8Array(8);
    expect(() => writeHeader(uint8, 2, 0b100, 0b1111111_1111111_1111111_1111111_1111)).toThrow();
  });
});
