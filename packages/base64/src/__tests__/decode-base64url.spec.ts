import {toBase64} from '../toBase64';
import {fromBase64Url} from '../fromBase64Url';

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
    const encoded = toBase64(blob).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const decoded2 = fromBase64Url(encoded);
    expect(decoded2).toEqual(blob);
  }
});
