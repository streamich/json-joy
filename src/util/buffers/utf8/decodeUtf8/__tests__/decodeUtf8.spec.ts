import v1 from '../v1';
import v2 from '../v2';
import v3 from '../v3';
import v4 from '../v4';
import v5 from '../v5';
import v6 from '../v6';
import v7 from '../v7';
import v8 from '../v8';
import v9 from '../v9';
import v10 from '../v10';
import v11 from '../v11';
import v12 from '../v12';
import v13 from '../v13';

type Decoder = (buf: Uint8Array, start: number, length: number) => string;

const runTests = (name: string, decodeUtf8: Decoder) => {
  describe(name, () => {
    test('can decode basic string', () => {
      const arr = new ArrayBuffer(8);
      const buf = new Uint8Array(arr);
      buf[0] = 1;
      buf[1] = 0x61;
      buf[2] = 0x62;
      buf[3] = 0x63;
      buf[4] = 0x64;
      buf[5] = 0x65;
      buf[6] = 0x66;
      buf[7] = 1;
      const uint8 = buf.subarray(1, 7);
      const str = decodeUtf8(uint8, 1, 2);
      expect(str).toBe('bc');
    });

    test('can decode emoji', () => {
      const arr = new ArrayBuffer(8);
      const buf = new Uint8Array(arr);
      buf[0] = 1;
      buf[1] = 0x61;
      buf[2] = 0xf0;
      buf[3] = 0x9f;
      buf[4] = 0x98;
      buf[5] = 0x80;
      buf[6] = 0x62;
      buf[7] = 1;
      const uint8 = buf.subarray(1, 7);
      const str = decodeUtf8(uint8, 1, 4);
      expect(str).toBe('😀');
    });

    test('can decode a long string', () => {
      const str = 'a'.repeat(33333);
      const buf = Buffer.from(str);
      const arr = new Uint8Array(buf.length);
      for (let i = 0; i < arr.length; i++) arr[i] = buf[i];
      const str2 = decodeUtf8(arr, 0, arr.length);
      expect(str2).toBe(str);
    });
  });
};

runTests('v1', v1);
runTests('v2', v2);
runTests('v3', v3);
runTests('v4', v4);
runTests('v5', v5);
runTests('v6', v6);
runTests('v7', v7);
runTests('v8', v8);
runTests('v9', v9);
runTests('v10', v10);
runTests('v11', v11);
runTests('v12', v12);
runTests('v13', v13);
