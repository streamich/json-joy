import {compactMessages} from '../../compact/__tests__/compact-messages';
import {decode} from '../../compact/decode';
import {Encoder, Decoder} from '..';

const encoder = new Encoder();
const decoder = new Decoder();

describe('Encoder/Decoder', () => {
  for (const [name, message] of Object.entries(compactMessages)) {
    // if (name !== 'notification1') continue;
    test(name, () => {
      const messages = decode([message]);
      const encoded = encoder.encode(messages);
      const decoded = decoder.decode(encoded);
      expect(decoded).toEqual(messages[0]);
    });
  }
});
