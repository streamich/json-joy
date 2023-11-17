import {JsonJsonValueCodec} from "../../json-pack/codecs/json";
import {Writer} from "../../util/buffers/Writer";
import {RpcPersistentClient, WebSocketChannel} from "../common";
import {RpcCodec} from "../common/codec/RpcCodec";
import {CompactRpcMessageCodec} from "../common/codec/compact";

export const createJsonWsRpcClient = (url: string) => {
  const writer = new Writer(1024 * 4);
  const msg = new CompactRpcMessageCodec();
  const req = new JsonJsonValueCodec(writer);
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
