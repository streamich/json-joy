import {BinaryRpcMessageCodec} from '..';
import {CborJsonValueCodec} from '../../../../../json-pack/codecs/cbor';
import {Writer} from '../../../../../util/buffers/Writer';
import {messages} from '../../../messages/__tests__/fixtures';

const codec = new BinaryRpcMessageCodec();
const cborCodec = new CborJsonValueCodec(new Writer());

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
