import WebSocket from 'ws';
import {RxPersistentCaller} from '@jsonjoy.com/rpc-calls/lib/caller/RxPersistentCaller';
import {FetchCaller} from '@jsonjoy.com/rpc-calls/lib/caller/FetchCaller';
import {WebSocketChannel} from '@jsonjoy.com/channel/lib/WebSocketChannel';
import {RpcBinBatchCodec} from '@jsonjoy.com/rpc-codec/lib/RpcBinBatchCodec';
import type {RpcCodec} from '@jsonjoy.com/rpc-codec';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';

const secure = true;
const host = 'pub-1-api.jsonjoy.org';

export const setupWsClient = (codec: RpcCodec<RxMessage>) => {
  const url = `ws${secure ? 's' : ''}://${host}/rx`;
  const caller = new RxPersistentCaller({
    codec,
    physical: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () => new WebSocket(url, [codec.specifier()]) as any,
        }),
    },
  });
  caller.start();
  const call = caller.call.bind(caller);
  const call$ = caller.call$.bind(caller);
  return {caller: caller as any, call, call$, stop: async () => void caller.stop()};
};

export const setupHttpClient = (codec: RpcCodec<RxMessage>) => {
  const url = `http${secure ? 's' : ''}://${host}/rx`;
  const caller = new FetchCaller({
    url,
    codec: new RpcBinBatchCodec(codec),
    headers: {
      'Content-Type': `application/x.${codec.specifier()}`,
    },
  });
  const call = caller.call.bind(caller);
  const call$ = caller.call$.bind(caller);
  return {caller: caller as any, call, call$, stop: async () => void caller.stop()};
};
