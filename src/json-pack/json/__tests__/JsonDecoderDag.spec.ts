import {Writer} from '../../../util/buffers/Writer';
import {utf8} from '../../../util/buffers/strings';
import {JsonEncoderDag} from '../JsonEncoderDag';
import {JsonDecoderDag} from '../JsonDecoderDag';

const writer = new Writer(16);
const encoder = new JsonEncoderDag(writer);
const decoder = new JsonDecoderDag();

test('can decode a simple buffer in object', () => {
  const buf = utf8`hello world`;
  const data = {foo: buf};
  const encoded = encoder.encode(data);
  const decoded = decoder.decode(encoded);
  expect(decoded).toEqual(data);
});

test('can decode buffers inside an array', () => {
  const data = [0, utf8``, utf8`asdf`, 1];
  const encoded = encoder.encode(data);
  const decoded = decoder.decode(encoded);
  expect(decoded).toEqual(data);
});

test('can decode buffer with whitespace surrounding literals', () => {
  const json = '  { "foo"  : {  "/"    :  {   "bytes" :    "aGVsbG8gd29ybGQ" }  }    }  ';
  const encoded = Buffer.from(json);
  const decoded = decoder.decode(encoded);
  expect(decoded).toEqual({foo: utf8`hello world`});
});
