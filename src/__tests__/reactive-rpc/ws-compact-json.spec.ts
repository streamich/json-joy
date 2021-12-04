import {ApiTestSetup, runApiTests} from '../../reactive-rpc/common/rpc/__tests__/api';
import WS from 'isomorphic-ws';
import {RpcClient} from '../../reactive-rpc/common/rpc/RpcClient';
import {Encoder, Decoder} from '../../reactive-rpc/common/codec/compact-json';
import {ReactiveRpcResponseMessage} from '../../reactive-rpc/common';
import {Defer} from '../../json-rx/__tests__/util';

if (process.env.TEST_E2E) {
  const connected = new Defer<void>();
  const ws: WebSocket = new WS('ws://localhost:9999/rpc/compact');
  const encoderJson = new Encoder();
  const decoderJson = new Decoder();
  const clientJson = new RpcClient({
    send: (messages) => {
      const encoded = encoderJson.encode(messages as any);
      ws.send(encoded);
    },
    bufferTime: 5,
  });
  ws.onopen = function open() {
    // console.log('onopen');
    connected.resolve();
  };
  ws.onmessage = function incoming(event: any) {
    const messages = decoderJson.decode(event.data);
    if (messages instanceof Array) clientJson.onMessages(messages as ReactiveRpcResponseMessage[]);
    else clientJson.onMessage(messages as ReactiveRpcResponseMessage);
  };
  const setup: ApiTestSetup = async () => {
    await connected;
    await new Promise((r) => setTimeout(r, 1));
    return {
      client: {
        call$: (method: string, data: any) => clientJson.call$(method, data),
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
