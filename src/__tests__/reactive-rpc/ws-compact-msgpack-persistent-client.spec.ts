import {ApiTestSetup, runApiTests} from '../../reactive-rpc/common/rpc/__tests__/api';
import WS from 'isomorphic-ws';
import {WebSocketChannel} from '../../reactive-rpc/common/channel';
import {Encoder, Decoder} from '../../reactive-rpc/common/codec/compact-msgpack';
import {RpcPersistentClient} from '../../reactive-rpc/common/rpc';
import {Defer} from '../../json-rx/__tests__/util';

if (process.env.TEST_E2E) {
  const connected = new Defer<void>();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const rpc = new RpcPersistentClient({
    channel: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () => new WS('ws://localhost:9999/rpc/compact', 'MsgPack'),
        }),
    },
    codec: {
      encoder,
      decoder,
    },
  });

  rpc.start();

  const setup: ApiTestSetup = async () => {
    await connected;
    return {
      client: {
        call$: (name: string, data: any) => rpc.call$(name, data),
      },
    };
  };

  runApiTests(setup);

  afterAll(() => {
    rpc.stop();
  });
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
