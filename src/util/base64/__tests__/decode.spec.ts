import {toBase64, createToBase64} from '../encode';
import {createFromBase64} from '../decode';

const fromBase64_2 = createFromBase64();

const generateBlob = (): Uint8Array => {
  const length = Math.floor(Math.random() * 100) + 1;
  const uint8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8[i] = Math.floor(Math.random() * 256);
  }
  return uint8;
};

test('works', () => {
  for (let i = 0; i < 1; i++) {
    // const blob = generateBlob();
    const blob = new Uint8Array([1, 2, 3, 4]);
    console.log('blob', blob);
    const encoded = toBase64(blob);
    console.log('encoded', encoded);
    const decoded1 = fromBase64_2(encoded);
    console.log('decoded1', decoded1);
    expect(decoded1).toEqual(blob);
  }
});
