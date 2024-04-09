import {compactMessages} from './compact-messages';
import {CompactRpcMessageCodec} from '..';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {Writer} from '@jsonjoy.com/json-pack/lib/util/buffers/Writer';
import {messages} from '../../../messages/__tests__/fixtures';

const codec = new CompactRpcMessageCodec();
const writer = new Writer(8 * Math.round(Math.random() * 100));
const cborCodec = new CborJsonValueCodec(writer);

describe('hydrate, encode, decode', () => {
  for (const [name, compact] of Object.entries(compactMessages)) {
    test(name, () => {
      const message = codec.fromJson(compact);
      codec.encodeBatch(cborCodec, [message]);
      const encoded = cborCodec.encoder.writer.flush();
      const [decoded] = codec.decodeBatch(cborCodec, encoded);
      expect(decoded).toStrictEqual(message);
    });
  }
});

describe('encode, decode', () => {
  for (const [name, message] of Object.entries(messages)) {
    test(name, () => {
      codec.encodeBatch(cborCodec, [message]);
      const encoded = cborCodec.encoder.writer.flush();
      const [decoded] = codec.decodeBatch(cborCodec, encoded);
      expect(decoded).toStrictEqual(message);
    });
  }
});
