import {toBase64} from '../toBase64';
import {createToBase64Bin} from '../createToBase64Bin';
import {bufferToUint8Array} from '../../buffers/bufferToUint8Array';

const encode = createToBase64Bin();

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
    const encoded = binWithBuffer.subarray(3);
    // console.log(result);
    // console.log(binWithBuffer);
    // console.log(encoded);
    expect(result).toEqual(encoded);
  }
});
