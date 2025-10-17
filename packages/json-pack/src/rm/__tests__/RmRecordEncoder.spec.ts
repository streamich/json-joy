import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {RmRecordEncoder} from '../RmRecordEncoder';

describe('RmRecordEncoder', () => {
  describe('.encodeHdr()', () => {
    test('encodes header with fin=1 and length=0', () => {
      const encoder = new RmRecordEncoder(new Writer());
      const result = encoder.encodeHdr(1, 0);
      expect(result.length).toBe(4);
      expect(result[0]).toBe(0x80);
      expect(result[1]).toBe(0x00);
      expect(result[2]).toBe(0x00);
      expect(result[3]).toBe(0x00);
    });

    test('encodes header with fin=0 and length=0', () => {
      const encoder = new RmRecordEncoder(new Writer());
      const result = encoder.encodeHdr(0, 0);
      expect(result.length).toBe(4);
      expect(result[0]).toBe(0x00);
      expect(result[1]).toBe(0x00);
      expect(result[2]).toBe(0x00);
      expect(result[3]).toBe(0x00);
    });

    test('encodes header with fin=1 and length=100', () => {
      const encoder = new RmRecordEncoder(new Writer());
      const result = encoder.encodeHdr(1, 100);
      expect(result.length).toBe(4);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const value = view.getUint32(0, false);
      expect(value & 0x80000000).not.toBe(0);
      expect(value & 0x7fffffff).toBe(100);
    });

    test('encodes header with fin=0 and length=1000', () => {
      const encoder = new RmRecordEncoder(new Writer());
      const result = encoder.encodeHdr(0, 1000);
      expect(result.length).toBe(4);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const value = view.getUint32(0, false);
      expect(value & 0x80000000).toBe(0);
      expect(value & 0x7fffffff).toBe(1000);
    });

    test('encodes header with max length', () => {
      const encoder = new RmRecordEncoder(new Writer());
      const maxLength = 0x7fffffff;
      const result = encoder.encodeHdr(1, maxLength);
      expect(result.length).toBe(4);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const value = view.getUint32(0, false);
      expect(value & 0x80000000).not.toBe(0);
      expect(value & 0x7fffffff).toBe(maxLength);
    });
  });

  describe('.encodeRecord()', () => {
    test('encodes empty record', () => {
      const encoder = new RmRecordEncoder(new Writer());
      const record = new Uint8Array([]);
      const result = encoder.encodeRecord(record);
      expect(result.length).toBe(4);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const header = view.getUint32(0, false);
      expect(header & 0x80000000).not.toBe(0);
      expect(header & 0x7fffffff).toBe(0);
    });

    test('encodes single-byte record', () => {
      const record = new Uint8Array([0x42]);
      const encoder = new RmRecordEncoder(new Writer());
      const result = encoder.encodeRecord(record);
      expect(result.length).toBe(5);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const header = view.getUint32(0, false);
      expect(header & 0x80000000).not.toBe(0);
      expect(header & 0x7fffffff).toBe(1);
      expect(result[4]).toBe(0x42);
    });

    test('encodes multi-byte record', () => {
      const record = new Uint8Array([1, 2, 3, 4, 5]);
      const encoder = new RmRecordEncoder(new Writer());
      const result = encoder.encodeRecord(record);
      expect(result.length).toBe(9);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const header = view.getUint32(0, false);
      expect(header & 0x80000000).not.toBe(0);
      expect(header & 0x7fffffff).toBe(5);
      expect(Array.from(result.slice(4))).toEqual([1, 2, 3, 4, 5]);
    });

    test('encodes record with ASCII data', () => {
      const record = new TextEncoder().encode('hello');
      const encoder = new RmRecordEncoder(new Writer());
      const result = encoder.encodeRecord(record);
      expect(result.length).toBe(9);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const header = view.getUint32(0, false);
      expect(header & 0x80000000).not.toBe(0);
      expect(header & 0x7fffffff).toBe(5);
      expect(new TextDecoder().decode(result.slice(4))).toBe('hello');
    });

    test('encodes large record', () => {
      const size = 10000;
      const record = new Uint8Array(size);
      for (let i = 0; i < size; i++) record[i] = i % 256;
      const encoder = new RmRecordEncoder(new Writer());
      const result = encoder.encodeRecord(record);
      expect(result.length).toBe(4 + size);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const header = view.getUint32(0, false);
      expect(header & 0x80000000).not.toBe(0);
      expect(header & 0x7fffffff).toBe(size);
      expect(Array.from(result.slice(4))).toEqual(Array.from(record));
    });
  });

  describe('writeHdr', () => {
    test('writes header without flushing', () => {
      const encoder = new RmRecordEncoder(new Writer());
      encoder.writeHdr(1, 42);
      encoder.writeHdr(0, 100);
      const result = encoder.writer.flush();
      expect(result.length).toBe(8);
    });
  });

  describe('writeRecord', () => {
    test('writes record without flushing', () => {
      const encoder = new RmRecordEncoder(new Writer());
      const record1 = new Uint8Array([1, 2, 3]);
      const record2 = new Uint8Array([4, 5]);
      encoder.writeRecord(record1);
      encoder.writeRecord(record2);
      const result = encoder.writer.flush();
      expect(result.length).toBe(4 + 3 + 4 + 2);
    });
  });

  describe('.writeFragment()', () => {
    test('writes fragment from offset', () => {
      const encoder = new RmRecordEncoder(new Writer());
      const record = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      encoder.writeFragment(record, 2, 3, 0);
      const result = encoder.writer.flush();
      expect(result.length).toBe(7);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const header = view.getUint32(0, false);
      expect(header & 0x80000000).toBe(0);
      expect(header & 0x7fffffff).toBe(3);
      expect(Array.from(result.slice(4))).toEqual([3, 4, 5]);
    });

    test('writes fragment with fin=1', () => {
      const encoder = new RmRecordEncoder(new Writer());
      const record = new Uint8Array([10, 20, 30]);
      encoder.writeFragment(record, 0, 3, 1);
      const result = encoder.writer.flush();
      expect(result.length).toBe(7);
      const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const header = view.getUint32(0, false);
      expect(header & 0x80000000).not.toBe(0);
      expect(header & 0x7fffffff).toBe(3);
      expect(Array.from(result.slice(4))).toEqual([10, 20, 30]);
    });
  });
});
