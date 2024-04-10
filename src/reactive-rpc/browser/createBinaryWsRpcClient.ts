import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {RpcPersistentClient, WebSocketChannel} from '../common';
import {RpcCodec} from '../common/codec/RpcCodec';
import {BinaryRpcMessageCodec} from '../common/codec/binary';

/**
 * Constructs a JSON Reactive RPC client.
 * @param url RPC endpoint.
 * @param token Authentication token.
 * @returns An RPC client.
 */
export const createBinaryWsRpcClient = (url: string, token: string) => {
  const writer = new Writer(1024 * 4);
  const msg = new BinaryRpcMessageCodec();
  const req = new CborJsonValueCodec(writer);
  const codec = new RpcCodec(msg, req, req);
  const client = new RpcPersistentClient({
    codec,
    channel: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () => new WebSocket(url, [codec.specifier(), token]),
        }),
    },
  });
  client.start();
  return client;
};
