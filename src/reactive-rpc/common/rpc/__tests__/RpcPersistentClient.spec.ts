import {WebSocketChannel} from '../../channel';
import {RpcPersistentClient} from '../RpcPersistentClient';
import {Encoder, Decoder} from '../../codec/compact-json';
import {createWebSocketMock} from '../../channel/mock';
import {RequestCompleteMessage} from '../..';

test('on remote method execution, sends message over WebSocket only once', async () => {
  const onSend = jest.fn();
  const Ws = createWebSocketMock({onSend});
  const ws = new Ws('');
  const decoder = new Decoder();
  const client = new RpcPersistentClient({
    channel: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () => ws,
        }),
    },
    codec: {
      encoder: new Encoder(),
      decoder,
    },
  });
  client.start();
  setTimeout(() => {
    ws._open();
  }, 1);
  const observable = client.call$('foo.bar', {foo: 'bar'});
  observable.subscribe(() => {});
  observable.subscribe(() => {});
  observable.subscribe(() => {});
  await new Promise((r) => setTimeout(r, 25));

  expect(onSend).toHaveBeenCalledTimes(1);

  const batch = decoder.decode(onSend.mock.calls[0][0]);

  expect(batch).toBeInstanceOf(RequestCompleteMessage);
  expect(batch).toMatchObject(new RequestCompleteMessage(1, 'foo.bar', {foo: 'bar'}));
});
