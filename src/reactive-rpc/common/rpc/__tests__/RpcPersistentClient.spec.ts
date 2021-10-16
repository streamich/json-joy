import {WebSocketChannel} from '../../channel';
import {RpcPersistentClient} from '../RpcPersistentClient';
import {Encoder, Decoder} from '../../codec/compact-json';
import {createWebSocketMock} from '../../channel/mock';

test('on remote method execution, sends message over WebSocket only once', async () => {
  const onSend = jest.fn();
  const Ws = createWebSocketMock({onSend});
  const ws = new Ws('');
  const client = new RpcPersistentClient({
    channel: {
      newChannel: () => new WebSocketChannel({
        newSocket: () => ws,
      }),
    },
    codec: {
      encoder: new Encoder(),
      decoder: new Decoder(),
    },
  });
  client.start();
  setTimeout(() => {
    ws._open();
  }, 1);
  const observable = client.call$('foo.bar', {foo: 'bar'});
  observable.subscribe(() => {});
  observable.subscribe(() => {});
  await new Promise(r => setTimeout(r, 225));
  expect(onSend).toHaveBeenCalledTimes(1);
});
