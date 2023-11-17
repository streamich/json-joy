import {CborJsonValueCodec} from '../../json-pack/codecs/cbor';
import {Writer} from '../../util/buffers/Writer';
import {RpcPersistentClient, WebSocketChannel} from '../common';
import {RpcCodec} from '../common/codec/RpcCodec';
import {BinaryRpcMessageCodec} from '../common/codec/binary';

export const createBinaryWsRpcClient = (url: string) => {
  const writer = new Writer(1024 * 4);
  const msg = new BinaryRpcMessageCodec();
  const req = new CborJsonValueCodec(writer);
  const codec = new RpcCodec(msg, req, req);
  const client = new RpcPersistentClient({
    codec,
    channel: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () => new WebSocket(url, [codec.specifier()]),
        }),
    },
  });
  client.start();
  return client;
};
