import {RmRecordDecoder} from '../RmRecordDecoder';

describe('RmRecordDecoder', () => {
  describe('.readRecord()', () => {
    test('returns undefined when no data available', () => {
      const decoder = new RmRecordDecoder();
      const result = decoder.readRecord();
      expect(result).toBeUndefined();
    });

    test('decodes empty record', () => {
      const decoder = new RmRecordDecoder();
      decoder.push(new Uint8Array([0, 0, 0, 0]));
      expect(decoder.readRecord()).toBeUndefined();
    });

    test('decodes empty record', () => {
      const decoder = new RmRecordDecoder();
      decoder.push(new Uint8Array([0, 0, 0, 0, 0]));
      expect(decoder.readRecord()).toBeUndefined();
    });

    test('decodes empty record - 2', () => {
      const decoder = new RmRecordDecoder();
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0]));
      expect(decoder.readRecord()).toBeUndefined();
    });

    test('decodes two records streamed one byte at a time', () => {
      const decoder = new RmRecordDecoder();
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0b10000000]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([1]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([42]));
      expect(decoder.readRecord()?.buf()).toEqual(new Uint8Array([42]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0b10000000, 0, 0]));
      expect(decoder.readRecord()).toBeUndefined();
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([1, 43]));
      expect(decoder.readRecord()?.buf()).toEqual(new Uint8Array([43]));
      expect(decoder.readRecord()).toBeUndefined();
    });

    test('decodes single-byte record', () => {
      const decoder = new RmRecordDecoder();
      decoder.push(new Uint8Array([0b10000000, 0, 0, 1, 42]));
      const result = decoder.readRecord()?.buf();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result!.length).toBe(1);
      expect(result![0]).toBe(42);
    });

    test('decodes multi-byte record', () => {
      const decoder = new RmRecordDecoder();
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      decoder.push(new Uint8Array([0b10000000, 0, 0, data.length, ...data]));
      const result = decoder.readRecord()?.buf();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result!.length).toBe(data.length);
      expect(result).toEqual(data);
    });

    test('decodes ASCII string data', () => {
      const text = 'hello world';
      const data = new TextEncoder().encode(text);
      const decoder = new RmRecordDecoder();
      decoder.push(new Uint8Array([0b10000000, 0, 0, data.length, ...data]));
      const result = decoder.readRecord()?.buf();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result!.length).toBe(data.length);
      expect(result).toEqual(data);
    });

    test('decodes large record', () => {
      const size = 10000;
      const data = new Uint8Array(size);
      for (let i = 0; i < size; i++) data[i] = i % 256;
      const decoder = new RmRecordDecoder();
      decoder.push(new Uint8Array([0b10000000, (size >> 16) & 0xff, (size >> 8) & 0xff, size & 0xff, ...data]));
      const result = decoder.readRecord()?.buf();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result!.length).toBe(data.length);
      expect(result).toEqual(data);
    });
  });

  describe('fragmented records', () => {
    test('decodes record with two fragments', () => {
      const part1 = new Uint8Array([1, 2, 3]);
      const part2 = new Uint8Array([4, 5, 6]);
      const decoder = new RmRecordDecoder();
      decoder.push(new Uint8Array([0b00000000, 0, 0, part1.length, ...part1]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0b10000000, 0, 0, part2.length, ...part2]));
      const result = decoder.readRecord()?.buf();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result!.length).toBe(part1.length + part2.length);
      expect(result).toEqual(new Uint8Array([...part1, ...part2]));
    });

    test('decodes record with three fragments', () => {
      const part1 = new Uint8Array([1, 2]);
      const part2 = new Uint8Array([3, 4]);
      const part3 = new Uint8Array([5, 6]);
      const decoder = new RmRecordDecoder();
      decoder.push(new Uint8Array([0b00000000, 0, 0, part1.length, ...part1]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0b00000000, 0, 0, part2.length, ...part2]));
      expect(decoder.readRecord()).toBeUndefined();
      decoder.push(new Uint8Array([0b10000000, 0, 0, part3.length, ...part3]));
      const result = decoder.readRecord()?.buf();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result!.length).toBe(part1.length + part2.length + part3.length);
      expect(result).toEqual(new Uint8Array([...part1, ...part2, ...part3]));
    });
  });
});
