import {toBase64} from '../toBase64';
import {createToBase64Bin} from '../createToBase64Bin';
import {createToBase64BinUint8} from '../createToBase64BinUint8';
import {bufferToUint8Array} from '../util/buffers/bufferToUint8Array';
import {copy} from '../util/buffers/copy';

const encode = createToBase64Bin('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', '=');
const encodeUint8 = createToBase64BinUint8('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', '=');
const encodeNoPadding = createToBase64Bin('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');

const generateBlob = (): Uint8Array => {
  const length = Math.floor(Math.random() * 100) + 1;
  const uint8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8[i] = Math.floor(Math.random() * 256);
  }
  return uint8;
};

test('works', () => {
  for (let i = 0; i < 100; i++) {
    const blob = generateBlob();
    const result = bufferToUint8Array(Buffer.from(toBase64(blob)));
    const binWithBuffer = new Uint8Array(result.length + 3);
    encode(blob, 0, blob.length, new DataView(binWithBuffer.buffer), 3);
    const dupe = copy(blob);
    encodeNoPadding(blob, 0, blob.length, new DataView(binWithBuffer.buffer), 3);
    expect(dupe).toEqual(blob);
    const dupe2 = copy(blob);
    encodeUint8(blob, 0, blob.length, binWithBuffer, 3);
    expect(dupe2).toEqual(blob);
    const encoded = binWithBuffer.subarray(3);
    // console.log(result);
    // console.log(binWithBuffer);
    // console.log(encoded);
    expect(result).toEqual(encoded);
  }
});
