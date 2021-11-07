import {operations} from '../../json/__tests__/sample-operations';
import {Encoder, Decoder} from '..';
import {decode as decodeJson, encode as encodeJson} from '../../json';

const encoder = new Encoder();
const decoder = new Decoder({});

for (const [name, operation] of Object.entries(operations)) {
  // if (name !== 'and1') continue;
  test(name, () => {
    const ops = decodeJson([operation], {});
    const uint8 = encoder.encode(ops);
    const ops2 = decoder.decode(uint8);
    const operations = encodeJson(ops2);
    expect(operations[0]).toEqual(operation);
  });
}
