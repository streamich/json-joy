import {encode} from '../encode';

const generateBlob = (): Uint8Array => {
  const length = Math.floor(Math.random() * 100) + 1;
  const uint8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8[i] = Math.floor(Math.random() * 256);
  }
  return uint8;
};

test('works', () => {
  for (let i= 0; i < 100; i++) {
    const blob = generateBlob();
    const result = encode(blob);
    const expected = Buffer.from(blob).toString('base64');
    expect(result).toBe(expected);
  }
});
