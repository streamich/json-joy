import {ApiTestSetup, runApiTests} from '../../reactive-rpc/common/rpc/__tests__/api';
import WS from 'isomorphic-ws';
import {RpcClient} from '../../reactive-rpc/common/rpc/RpcClient';
import {Encoder, Decoder} from '../../reactive-rpc/common/codec/binary-msgpack';
import {toUint8Array} from '../../util/toUint8Array';
import {ReactiveRpcResponseMessage} from '../../reactive-rpc/common';
import {Defer} from '../../json-rx/__tests__/util';
import {tick, until} from '../util';

if (process.env.TEST_E2E) {
  const connected = new Defer<void>();
  const ws: WebSocket = new WS('ws://localhost:9999/rpc/binary');
  const encoder = new Encoder();
  const decoder = new Decoder();
  const client = new RpcClient({
    send: (messages) => {
      const uint8 = encoder.encode(messages);
      ws.send(uint8);
    },
  });

  ws.onopen = function open() {
    // console.log('onopen');
    connected.resolve();
  };

  ws.onmessage = function incoming(event: any) {
    const uint8 = toUint8Array(event.data);
    const messages = decoder.decode(uint8);
    client.onMessages(messages as ReactiveRpcResponseMessage[]);
  };

  const setup: ApiTestSetup = async () => {
    await connected;
    await tick(10);
    await until(() => ws.readyState === ws.OPEN);
    return {
      client: {
        call$: (method: string, data: any) => client.call$(method, data),
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
