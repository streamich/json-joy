import {compactMessages} from './compact-messages';
import {encode, decode, Encoder, Decoder} from '..';

const encoder = new Encoder();
const decoder = new Decoder();

describe('encode()/decode()', () => {
  for (const [name, message] of Object.entries(compactMessages)) {
    test(name, () => {
      const [decoded] = decode([message]);
      const encoded = encode([decoded]);
      expect(encoded).toEqual(message);
    });
  }
});

describe('Encoder/Decoder', () => {
  for (const [name, message] of Object.entries(compactMessages)) {
    test(name, () => {
      const [decoded] = decoder.decode([message]);
      const encoded = encoder.encode([decoded]);
      expect(encoded).toEqual(message);
    });
  }
});
