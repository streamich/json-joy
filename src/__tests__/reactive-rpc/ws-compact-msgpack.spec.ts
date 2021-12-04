import {ApiTestSetup, runApiTests} from '../../reactive-rpc/common/rpc/__tests__/api';
import WS from 'isomorphic-ws';
import {RpcClient} from '../../reactive-rpc/common/rpc/RpcClient';
import {Encoder, Decoder} from '../../reactive-rpc/common/codec/compact-msgpack';
import {ReactiveRpcResponseMessage} from '../../reactive-rpc/common';
import {Defer} from '../../json-rx/__tests__/util';

if (process.env.TEST_E2E) {
  const connected = new Defer<void>();
  const ws: WebSocket = new WS('ws://localhost:9999/rpc/compact', 'MsgPack');
  const encoder = new Encoder();
  const decoder = new Decoder();
  const clientJson = new RpcClient({
    send: (messages) => {
      const encoded = encoder.encode(messages);
      ws.send(encoded);
    },
  });
  ws.onopen = function open() {
    // console.log('onopen');
    connected.resolve();
  };
  ws.onmessage = function incoming(event: any) {
    const messages = decoder.decode(event.data);
    if (messages instanceof Array) clientJson.onMessages(messages as ReactiveRpcResponseMessage[]);
    else clientJson.onMessage(messages as ReactiveRpcResponseMessage);
  };
  const setup: ApiTestSetup = async () => {
    await connected;
    return {
      client: {
        call$: (name: string, data: any) => clientJson.call$(name, data),
      },
    };
  };

  runApiTests(setup);

  afterAll(() => {
    ws.close();
  });
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
