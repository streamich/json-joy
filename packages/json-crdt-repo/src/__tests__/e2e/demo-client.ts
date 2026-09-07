import WebSocket from 'ws';
import {RxPersistentCaller} from '@jsonjoy.com/rpc-calls/lib/caller/RxPersistentCaller';
import {FetchCaller} from '@jsonjoy.com/rpc-calls/lib/caller/FetchCaller';
import {WebSocketChannel} from '@jsonjoy.com/channel/lib/WebSocketChannel';
import {RpcBinBatchCodec} from '@jsonjoy.com/rpc-codec/lib/RpcBinBatchCodec';
import type {RpcCodec} from '@jsonjoy.com/rpc-codec/lib/RpcCodec';

const secure = true;
const host = 'pub-1-api.jsonjoy.org';
// const host = '127.0.0.1:8080';

export const setupDemoServerPersistentClient = (codec: RpcCodec<any>) => {
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
  const stop = async () => void caller.stop();
  return {caller, call, call$, stop};
};

export const setupDemoServerFetchClient = (codec: RpcCodec<any>) => {
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
  const stop = async () => void caller.stop();
  return {caller, call, call$, stop};
};
