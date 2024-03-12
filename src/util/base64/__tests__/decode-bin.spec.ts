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
    const view = new DataView(encoded.buffer);
    const decoded = fromBase64Bin(view, 0, encoded.length);
    let padding = 0;
    if (encoded.length > 0 && view.getUint8(encoded.length - 1) === 0x3d) padding++;
    if (encoded.length > 1 && view.getUint8(encoded.length - 2) === 0x3d) padding++;
    const decoded2 = fromBase64Bin(view, 0, encoded.length - padding);
    // console.log('blob', blob);
    // console.log('encoded', encoded);
    // console.log('decoded', decoded);
    expect(decoded).toEqual(blob);
    expect(decoded2).toEqual(blob);
  }
});
