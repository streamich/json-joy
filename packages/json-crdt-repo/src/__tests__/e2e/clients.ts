import WebSocket from 'ws';
import {WebSocketChannel} from '@jsonjoy.com/channel/lib/WebSocketChannel';
import {RxPersistentCaller} from '@jsonjoy.com/rpc-calls/lib/caller/RxPersistentCaller';
import {FetchCaller} from '@jsonjoy.com/rpc-calls/lib/caller/FetchCaller';
import {RpcBinBatchCodec} from '@jsonjoy.com/rpc-codec/lib/RpcBinBatchCodec';
import type {RpcCodec} from '@jsonjoy.com/rpc-codec/lib/RpcCodec';

export const setupRpcPersistentClient = (codec: RpcCodec<any>) => {
  const port = +(process.env.PORT || 9999);
  const url = `ws://localhost:${port}/rx`;
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
  const stop = async () => void caller.stop();
  return {caller: caller as any, call, call$, stop};
};

export const setupFetchRpcClient = (codec: RpcCodec<any>) => {
  const port = +(process.env.PORT || 9999);
  const url = `http://localhost:${port}/rx`;
  const caller = new FetchCaller({
    url,
    codec: new RpcBinBatchCodec(codec),
    headers: {
      'Content-Type': `application/x.${codec.specifier()}`,
    },
  });
  const call = caller.call.bind(caller);
  const call$ = caller.call$.bind(caller);
  const stop = async () => void caller.stop();
  return {caller: caller as any, call, call$, stop};
};
