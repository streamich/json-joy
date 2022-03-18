import {Encoder, Decoder} from '..';
import {documents} from '../../__tests__/json-documents';

const encoder = new Encoder();
const decoder = new Decoder();
const encode = (x: unknown) => encoder.encode(x);
const decode = (x: Uint8Array) => decoder.decode(x);

for (const t of documents) {
  test(t.name, () => {
    const buf = encode(t.json);
    const res = decode(buf);
    expect(res).toEqual(t.json);
  });
}
