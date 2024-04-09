import {JsonRpc2RpcMessageCodec} from '..';
import {JsonJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/json';
import {Writer} from '@jsonjoy.com/json-pack/lib/util/buffers/Writer';
import {ReactiveRpcMessage} from '../../../messages';
import {messages} from '../../../messages/__tests__/fixtures';

const filteredMessages: [string, ReactiveRpcMessage][] = [
  ['notification1', messages.notification1],
  ['notification2', messages.notification2],
  ['notification3', messages.notification3],
  ['notification4', messages.notification4],

  ['reqComplete1', messages.reqComplete1],
  ['reqComplete1', messages.reqComplete2],
  ['reqComplete2', messages.reqComplete3],
  ['reqComplete3', messages.reqComplete4],
  ['reqComplete4', messages.reqComplete5],
  ['reqComplete5', messages.reqComplete6],

  ['resComplete3', messages.resComplete3],
  ['resComplete4', messages.resComplete4],
  ['resComplete5', messages.resComplete5],
  ['resComplete6', messages.resComplete6],

  ['resError1', messages.resError1],
  ['resError2', messages.resError2],
];

const codec = new JsonRpc2RpcMessageCodec();
const valueCodec = new JsonJsonValueCodec(new Writer(24));

describe('encode, decode', () => {
  for (const [name, message] of filteredMessages) {
    test(name, () => {
      // console.log(message);
      codec.encodeBatch(valueCodec, [message]);
      const encoded = valueCodec.encoder.writer.flush();
      // console.log(Buffer.from(encoded).toString('utf8'));
      const [decoded] = codec.decodeBatch(valueCodec, encoded);
      expect(decoded).toStrictEqual(message);
    });
  }
});
