import {WebSocketChannel} from '../../channel';
import {RpcPersistentClient} from '../RpcPersistentClient';
import {createWebSocketMock} from '../../channel/mock';
import {RequestCompleteMessage} from '../..';
import {until} from '../../../../__tests__/util';
import {RpcValue} from '../../messages/Value';
import {RpcCodec} from '../../codec/RpcCodec';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {RpcMessageCodecs} from '../../codec/RpcMessageCodecs';

test('on remote method execution, sends message over WebSocket only once', async () => {
  const onSend = jest.fn();
  const Ws = createWebSocketMock({onSend});
  const ws = new Ws('');
  const valueCodecs = new Codecs(new Writer(128));
  const messageCodecs = new RpcMessageCodecs();
  const codec = new RpcCodec(messageCodecs.compact, valueCodecs.cbor, valueCodecs.cbor);
  const client = new RpcPersistentClient({
    channel: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () => ws,
        }),
    },
    codec,
  });
  client.start();
  setTimeout(() => {
    ws._open();
  }, 1);
  const observable = client.call$('foo.bar', {foo: 'bar'});
  observable.subscribe(() => {});
  observable.subscribe(() => {});
  observable.subscribe(() => {});
  await until(() => onSend.mock.calls.length === 1);
  expect(onSend).toHaveBeenCalledTimes(1);
  const message = onSend.mock.calls[0][0];
  const decoded = codec.decode(message, codec.req);
  const messageDecoded = decoded[0];
  expect(messageDecoded).toBeInstanceOf(RequestCompleteMessage);
  expect(messageDecoded).toMatchObject(new RequestCompleteMessage(1, 'foo.bar', new RpcValue({foo: 'bar'}, undefined)));
  client.stop();
});
