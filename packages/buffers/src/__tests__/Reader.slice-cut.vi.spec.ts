import {Reader} from '../Reader';

describe('Reader.slice() and Reader.cut() methods', () => {
  describe('slice()', () => {
    test('creates a new Reader with independent cursor', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
      const slice = reader.slice();
      // slice starts at the same absolute position as reader
      expect(slice.x).toBe(0);
      expect(slice.u8()).toBe(1);
      expect(slice.x).toBe(1);
      // original reader's cursor should not be affected
      expect(reader.x).toBe(0);
      expect(reader.u8()).toBe(1);
      expect(reader.x).toBe(1);
    });

    test('slice with no arguments returns full remaining buffer', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5]));
      reader.skip(2); // advance to position 2
      const slice = reader.slice();
      // slice starts at reader's current position and goes to end
      expect(slice.x).toBe(2);
      expect(slice.end).toBe(5);
      expect(slice.size()).toBe(3);
      expect(slice.buf()).toEqual(new Uint8Array([3, 4, 5]));
    });

    test('slice with start offset', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
      const slice = reader.slice(2);
      expect(slice.x).toBe(2);
      expect(slice.buf()).toEqual(new Uint8Array([3, 4, 5, 6, 7, 8]));
    });

    test('slice with start and end offsets', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
      const slice = reader.slice(2, 5);
      expect(slice.x).toBe(2);
      expect(slice.size()).toBe(3);
      expect(slice.buf()).toEqual(new Uint8Array([3, 4, 5]));
    });

    test('slice after advancing cursor', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
      reader.skip(2); // position is now at index 2 (value 3)
      const slice = reader.slice(1, 3);
      // slice should start at reader.x + 1 = 3, end at reader.x + 3 = 5
      expect(slice.x).toBe(3);
      expect(slice.size()).toBe(2);
      expect(slice.buf()).toEqual(new Uint8Array([4, 5]));
    });

    test('slice does not advance original reader cursor', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5]));
      const slice = reader.slice(1, 3);
      slice.u8();
      expect(reader.x).toBe(0);
    });

    test('slice shares underlying buffer', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5]));
      const slice = reader.slice();
      // Both should reference the same underlying Uint8Array
      expect(slice.uint8).toBe(reader.uint8);
      expect(slice.view).toBe(reader.view);
    });

    test('multiple slices are independent', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
      const slice1 = reader.slice(0, 4);
      const slice2 = reader.slice(4, 8);
      expect(slice1.u8()).toBe(1);
      expect(slice2.u8()).toBe(5);
      expect(slice1.u8()).toBe(2);
      expect(slice2.u8()).toBe(6);
    });

    test('slice with size() for bounds', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5]));
      reader.skip(1);
      const slice = reader.slice();
      expect(slice.x).toBe(1);
      expect(slice.size()).toBe(4);
      expect(slice.u8()).toBe(2);
    });
  });

  describe('cut()', () => {
    test('creates slice and advances cursor', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5]));
      const cut = reader.cut(3);
      // cut should contain first 3 bytes, starting at position 0
      expect(cut.x).toBe(0);
      expect(cut.end).toBe(3);
      expect(cut.size()).toBe(3);
      expect(cut.u8()).toBe(1);
      expect(cut.u8()).toBe(2);
      expect(cut.u8()).toBe(3);
      // original reader cursor should advance by 3
      expect(reader.x).toBe(3);
      expect(reader.u8()).toBe(4);
    });

    test('cut with no arguments cuts entire remaining buffer', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5]));
      reader.skip(2);
      const cut = reader.cut();
      expect(cut.x).toBe(2);
      expect(cut.size()).toBe(3);
      expect(cut.u8()).toBe(3);
      expect(cut.u8()).toBe(4);
      expect(cut.u8()).toBe(5);
      // original reader should be at the end
      expect(reader.x).toBe(5);
      expect(reader.size()).toBe(0);
    });

    test('multiple cuts partition the buffer', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
      const cut1 = reader.cut(2);
      const cut2 = reader.cut(3);
      const cut3 = reader.cut(3);

      expect(cut1.x).toBe(0);
      expect(cut1.u8()).toBe(1);
      expect(cut1.u8()).toBe(2);

      expect(cut2.x).toBe(2);
      expect(cut2.u8()).toBe(3);
      expect(cut2.u8()).toBe(4);
      expect(cut2.u8()).toBe(5);

      expect(cut3.x).toBe(5);
      expect(cut3.u8()).toBe(6);
      expect(cut3.u8()).toBe(7);
      expect(cut3.u8()).toBe(8);

      expect(reader.x).toBe(8);
      expect(reader.size()).toBe(0);
    });

    test('cut returns independent Reader instance', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5]));
      const cut = reader.cut(2);
      cut.u8(); // advance cut cursor
      expect(reader.x).toBe(2);
      expect(cut.x).toBe(1);
      expect(reader.buf()).toEqual(new Uint8Array([3, 4, 5]));
    });

    test('cut shares underlying buffer', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5]));
      const cut = reader.cut(3);
      // Both should reference the same underlying Uint8Array
      expect(cut.uint8).toBe(reader.uint8);
      expect(cut.view).toBe(reader.view);
    });

    test('cut can be used to parse structured data', () => {
      const reader = new Reader(new Uint8Array([3, 1, 2, 3, 2, 4, 5]));
      // Simulate a binary format with length-prefixed chunks
      // [length: 3][data: 1,2,3][length: 2][data: 4,5]

      const len1 = reader.u8();
      const chunk1 = reader.cut(len1);

      const len2 = reader.u8();
      const chunk2 = reader.cut(len2);

      expect(chunk1.x).toBe(1);
      expect(chunk1.size()).toBe(3);
      expect(chunk1.u8()).toBe(1);
      expect(chunk1.u8()).toBe(2);
      expect(chunk1.u8()).toBe(3);

      expect(chunk2.x).toBe(5);
      expect(chunk2.size()).toBe(2);
      expect(chunk2.u8()).toBe(4);
      expect(chunk2.u8()).toBe(5);

      expect(reader.x).toBe(7);
      expect(reader.size()).toBe(0);
    });

    test('cut with size zero', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3]));
      const cut = reader.cut(0);
      expect(cut.size()).toBe(0);
      expect(reader.x).toBe(0);
      expect(reader.u8()).toBe(1);
    });
  });

  describe('slice() and cut() integration', () => {
    test('slice then cut', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
      const slice = reader.slice(2, 6); // [3, 4, 5, 6]
      const cut = slice.cut(2); // [3, 4]

      expect(cut.u8()).toBe(3);
      expect(cut.u8()).toBe(4);
      expect(slice.u8()).toBe(5);
      expect(slice.u8()).toBe(6);

      // original reader should be unaffected
      expect(reader.x).toBe(0);
    });

    test('cut then slice', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
      const cut = reader.cut(4);
      const slice = cut.slice(1, 3);

      expect(slice.u8()).toBe(2);
      expect(slice.u8()).toBe(3);

      expect(reader.x).toBe(4);
      expect(reader.u8()).toBe(5);
    });

    test('nested cuts', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3, 4, 5, 6]));
      const outer = reader.cut(6);
      const inner1 = outer.cut(2);
      const inner2 = outer.cut(2);
      const inner3 = outer.cut(2);

      expect(inner1.u8()).toBe(1);
      expect(inner1.u8()).toBe(2);

      expect(inner2.u8()).toBe(3);
      expect(inner2.u8()).toBe(4);

      expect(inner3.u8()).toBe(5);
      expect(inner3.u8()).toBe(6);
    });
  });

  describe('DataView access in slices and cuts', () => {
    test('slice can use DataView methods', () => {
      const reader = new Reader(new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]));
      const slice = reader.slice(0, 4);
      expect(slice.u16()).toBe(0x0102);
      expect(slice.u16()).toBe(0x0304);
    });

    test('cut can use DataView methods', () => {
      const reader = new Reader(new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]));
      const cut = reader.cut(4);
      expect(cut.u16()).toBe(0x0102);
      expect(cut.u16()).toBe(0x0304);
      expect(reader.u16()).toBe(0x0506);
    });

    test('slice with u32 reads', () => {
      const buffer = new Uint8Array(8);
      const view = new DataView(buffer.buffer);
      view.setUint32(0, 0x12345678);
      view.setUint32(4, 0x9abcdef0);
      const reader = new Reader(buffer);
      const slice = reader.slice(0, 8);
      expect(slice.u32()).toBe(0x12345678);
      expect(slice.u32()).toBe(0x9abcdef0);
    });
  });

  describe('edge cases', () => {
    test('slice at the end of buffer', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3]));
      reader.skip(3);
      const slice = reader.slice();
      expect(slice.x).toBe(3);
      expect(slice.size()).toBe(0);
    });

    test('cut at the end of buffer', () => {
      const reader = new Reader(new Uint8Array([1, 2, 3]));
      reader.skip(3);
      const cut = reader.cut();
      expect(cut.x).toBe(3);
      expect(cut.size()).toBe(0);
      expect(reader.size()).toBe(0);
    });

    test('empty reader slice', () => {
      const reader = new Reader(new Uint8Array([]));
      const slice = reader.slice();
      expect(slice.size()).toBe(0);
    });

    test('empty reader cut', () => {
      const reader = new Reader(new Uint8Array([]));
      const cut = reader.cut();
      expect(cut.size()).toBe(0);
    });
  });
});
