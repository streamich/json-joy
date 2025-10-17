import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonEncoder} from '../JsonEncoder';
import {JsonDecoder} from '../JsonDecoder';

test('supports Buffer', () => {
  const encoder = new JsonEncoder(new Writer());
  const buf = Buffer.from([1, 2, 3]);
  const encoded = encoder.encode(buf);
  const decoder = new JsonDecoder();
  const decoded = decoder.decode(encoded);
  expect(decoded).toStrictEqual(new Uint8Array([1, 2, 3]));
});
