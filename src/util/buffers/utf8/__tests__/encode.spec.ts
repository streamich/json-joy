import {RandomJson} from '../../../../json-random';
import {encodeUtf8Write, encodeFrom, encodeNative, encodeTe, encode, EncodeString} from '../encode';

describe('can encode JavaScript string as UTF-8 string', () => {
  const runEncodingTest = (name: string, encode: EncodeString) => {
    test(name, () => {
      const arr = new Uint8Array(50);
      for (let i = 0; i < 1000; i++) {
        const str = RandomJson.genString(10);
        const len = encode(arr, str, str.length, str.length * 4);
        const slice = arr.subarray(10, 10 + len);
        const decoded = Buffer.from(slice).toString();
        expect(decoded).toBe(str);
      }
    });
  };

  runEncodingTest('encodeUtf8Write', encodeUtf8Write);
  runEncodingTest('encodeFrom', encodeFrom);
  runEncodingTest('encodeNative', encodeNative);
  runEncodingTest('encodeTe', encodeTe);
  runEncodingTest('encode', encode);
});
