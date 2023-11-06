import {Codecs} from '../../../../../../json-pack/codecs/Codecs';
import {Writer} from '../../../../../../util/buffers/Writer';
import {RpcError} from '../RpcError';
import {RpcErrorType} from '../RpcErrorType';

const codecs = new Codecs(new Writer(16));

test('can encode an internal error', () => {
  const error = RpcError.internal();
  const encoded = RpcErrorType.encode(codecs.json, error);
  // console.log(RpcErrorType.encoder(EncodingFormat.Json).toString());
  const json = JSON.parse(Buffer.from(encoded).toString());
  expect(json).toEqual({
    message: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    errno: 0,
  });
});
