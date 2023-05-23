import {toBase64Bin} from '../toBase64Bin';
import {fromBase64Bin} from '../fromBase64Bin';

const generateBlob = (): Uint8Array => {
  const length = Math.floor(Math.random() * 100);
  const uint8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8[i] = Math.floor(Math.random() * 256);
  }
  return uint8;
};

test('works', () => {
  for (let i = 0; i < 100; i++) {
    const blob = generateBlob();
    const dest = new Uint8Array(blob.length * 4);
    const length = toBase64Bin(blob, 0, blob.length, new DataView(dest.buffer), 0);
    const encoded = dest.subarray(0, length);
    const decoded = fromBase64Bin(new DataView(encoded.buffer), 0, encoded.length);
    // console.log('blob', blob);
    // console.log('encoded', encoded);
    // console.log('decoded', decoded);
    expect(decoded).toEqual(blob);
  }
});
