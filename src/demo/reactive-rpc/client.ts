import WS from 'isomorphic-ws';
import {RpcClient} from '../../reactive-rpc/common/rpc/RpcClient';
import {Encoder, Decoder} from '../../reactive-rpc/common/codec/binary-msgpack';
import {toUint8Array} from '../../util/toUint8Array';
import {ReactiveRpcResponseMessage} from '../../reactive-rpc/common';

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
  console.log('connected');
  client.call('ping', {})
    .subscribe(res => {
      console.log('res', res);
    });
};

ws.onclose = function close() {
  console.log('disconnected');
};

ws.onmessage = function incoming(event: any) {
  const uint8 = toUint8Array(event.data);
  const messages = decoder.decode(uint8, 0, uint8.byteLength);
  client.onMessages(messages as ReactiveRpcResponseMessage[]);
};
