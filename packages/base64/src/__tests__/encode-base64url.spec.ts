import {toBase64Url} from '../toBase64Url';

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
    const expected = Buffer.from(blob).toString('base64');
    const base64url = toBase64Url(blob, blob.length);
    let encoded = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const mod = encoded.length % 4;
    if (mod === 2) encoded += '==';
    else if (mod === 3) encoded += '=';
    expect(encoded).toEqual(expected);
  }
});
