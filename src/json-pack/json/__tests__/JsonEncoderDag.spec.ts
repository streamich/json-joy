import {Writer} from '../../../util/buffers/Writer';
import {utf8} from '../../../util/buffers/strings';
import {JsonEncoderDag} from '../JsonEncoderDag';

const writer = new Writer(16);
const encoder = new JsonEncoderDag(writer);

test('can encode a simple buffer in object', () => {
  const buf = utf8`hello world`;
  const data = {foo: buf};
  const encoded = encoder.encode(data);
  const json = Buffer.from(encoded).toString();
  expect(json).toBe('{"foo":{"/":{"bytes":"aGVsbG8gd29ybGQ"}}}');
});

test('can encode a simple buffer in array', () => {
  const buf = utf8`hello world`;
  const data = [0, buf, 1];
  const encoded = encoder.encode(data);
  const json = Buffer.from(encoded).toString();
  expect(json).toBe('[0,{"/":{"bytes":"aGVsbG8gd29ybGQ"}},1]');
});
