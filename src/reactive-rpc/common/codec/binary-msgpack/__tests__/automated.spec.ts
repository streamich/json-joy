import {compactMessages} from '../../compact/__tests__/compact-messages';
import {decode} from '../../compact/decode';
import {Encoder, Decoder} from '..';

const encoder = new Encoder();
const decoder = new Decoder();

for (const [name, message] of Object.entries(compactMessages)) {
  // if (name !== 'notification3') continue;
  test(name, () => {
    const [nominal] = decode([message]);
    const encoded = encoder.encode([nominal]);
    const decoded = decoder.decode(encoded, encoded.byteOffset, encoded.byteOffset + encoded.byteLength)
    expect(decoded[0]).toEqual(nominal);
  });
}
