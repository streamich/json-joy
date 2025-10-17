import {Reader} from '../Reader';
import {StreamingReader} from '../StreamingReader';
import {StreamingOctetReader} from '../StreamingOctetReader';

describe('peak() and peek() methods', () => {
  describe('Reader', () => {
    test('peak() returns current byte without advancing cursor', () => {
      const reader = new Reader();
      reader.reset(new Uint8Array([1, 2, 3, 4, 5]));
      expect(reader.x).toBe(0);
      expect(reader.peak()).toBe(1);
      expect(reader.x).toBe(0); // cursor should not advance

      reader.u8(); // advance cursor
      expect(reader.x).toBe(1);
      expect(reader.peak()).toBe(2);
      expect(reader.x).toBe(1); // cursor should not advance
    });

    test('peek() returns current byte without advancing cursor', () => {
      const reader = new Reader();
      reader.reset(new Uint8Array([1, 2, 3, 4, 5]));

      expect(reader.x).toBe(0);
      expect(reader.peek()).toBe(1);
      expect(reader.x).toBe(0); // cursor should not advance

      reader.u8(); // advance cursor
      expect(reader.x).toBe(1);
      expect(reader.peek()).toBe(2);
      expect(reader.x).toBe(1); // cursor should not advance
    });

    test('peak() and peek() return the same value', () => {
      const reader = new Reader();
      reader.reset(new Uint8Array([42, 100, 255]));

      expect(reader.peak()).toBe(reader.peek());
      reader.u8(); // advance cursor
      expect(reader.peak()).toBe(reader.peek());
      reader.u8(); // advance cursor
      expect(reader.peak()).toBe(reader.peek());
    });
  });

  describe('StreamingReader', () => {
    test('peak() returns current byte without advancing cursor', () => {
      const reader = new StreamingReader();
      reader.push(new Uint8Array([10, 20, 30]));

      expect(reader.x).toBe(0);
      expect(reader.peak()).toBe(10);
      expect(reader.x).toBe(0); // cursor should not advance

      reader.u8(); // advance cursor
      expect(reader.x).toBe(1);
      expect(reader.peak()).toBe(20);
      expect(reader.x).toBe(1); // cursor should not advance
    });

    test('peek() returns current byte without advancing cursor', () => {
      const reader = new StreamingReader();
      reader.push(new Uint8Array([10, 20, 30]));

      expect(reader.x).toBe(0);
      expect(reader.peek()).toBe(10);
      expect(reader.x).toBe(0); // cursor should not advance

      reader.u8(); // advance cursor
      expect(reader.x).toBe(1);
      expect(reader.peek()).toBe(20);
      expect(reader.x).toBe(1); // cursor should not advance
    });

    test('peak() and peek() return the same value', () => {
      const reader = new StreamingReader();
      reader.push(new Uint8Array([42, 100, 255]));

      expect(reader.peak()).toBe(reader.peek());
      reader.u8(); // advance cursor
      expect(reader.peak()).toBe(reader.peek());
      reader.u8(); // advance cursor
      expect(reader.peak()).toBe(reader.peek());
    });
  });

  describe('StreamingOctetReader', () => {
    test('peak() returns current byte without advancing cursor', () => {
      const reader = new StreamingOctetReader();
      reader.push(new Uint8Array([100, 200, 150]));

      expect(reader.peak()).toBe(100);

      reader.u8(); // advance cursor internally
      expect(reader.peak()).toBe(200);
    });

    test('peek() returns current byte without advancing cursor', () => {
      const reader = new StreamingOctetReader();
      reader.push(new Uint8Array([100, 200, 150]));

      expect(reader.peek()).toBe(100);

      reader.u8(); // advance cursor internally
      expect(reader.peek()).toBe(200);
    });

    test('peak() and peek() return the same value', () => {
      const reader = new StreamingOctetReader();
      reader.push(new Uint8Array([42, 100, 255]));

      expect(reader.peak()).toBe(reader.peek());
      reader.u8(); // advance cursor
      expect(reader.peak()).toBe(reader.peek());
      reader.u8(); // advance cursor
      expect(reader.peak()).toBe(reader.peek());
    });
  });
});
