import {BinaryRpcMessageCodec} from '..';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {
  NotificationMessage,
  ReactiveRpcMessage,
  RequestCompleteMessage,
  RequestDataMessage,
  RequestErrorMessage,
  RequestUnsubscribeMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
} from '../../../messages';
import {RpcValue} from '../../../messages/Value';
import {messages} from '../../../messages/__tests__/fixtures';

const writer = new Writer(8 * Math.round(Math.random() * 100));
const codecs = new Codecs(writer);
const codec = new BinaryRpcMessageCodec();

const codecList = [codecs.cbor, codecs.msgpack, codecs.json];

for (const jsonCodec of codecList) {
  const assertMessage = (message: ReactiveRpcMessage) => {
    const encoded = codec.encode(jsonCodec, [message]);
    const decoded = codec.decodeBatch(jsonCodec, encoded);
    expect(decoded).toStrictEqual([message]);
  };

  describe(jsonCodec.id, () => {
    test('Notification message', () => {
      const value = new RpcValue({foo: 'bar'}, undefined);
      const message = new NotificationMessage('abc', value);
      assertMessage(message);
    });

    test('Request Data message', () => {
      const value = new RpcValue([1, 2, 3], undefined);
      const message = new RequestDataMessage(9999, 'a', value);
      assertMessage(message);
    });

    test('Request Complete message', () => {
      const value = new RpcValue(true, undefined);
      const message = new RequestCompleteMessage(3, 'abc', value);
      assertMessage(message);
    });

    test('Request Error message', () => {
      const value = new RpcValue({message: 'Error!', errno: 123, code: 'ERROR'}, undefined);
      const message = new RequestErrorMessage(0, 'wtf', value);
      assertMessage(message);
    });

    test('Request Unsubscribe message', () => {
      const message = new RequestUnsubscribeMessage(8383);
      assertMessage(message);
    });

    test('Response Data message', () => {
      const value = new RpcValue([1, 2, 3], undefined);
      const message = new ResponseDataMessage(30000, value);
      assertMessage(message);
    });

    test('Response Complete message', () => {
      const value = new RpcValue(true, undefined);
      const message = new ResponseCompleteMessage(3, value);
      assertMessage(message);
    });

    test('Response Error message', () => {
      const value = new RpcValue({message: 'Error!', errno: 123, code: 'ERROR'}, undefined);
      const message = new ResponseErrorMessage(0, value);
      assertMessage(message);
    });

    test('Response Unsubscribe message', () => {
      const message = new ResponseUnsubscribeMessage(16000);
      assertMessage(message);
    });
  });
}

describe('batch of messages', () => {
  const value = new RpcValue({foo: 'bar'}, undefined);
  const message1 = new NotificationMessage('abc', value);
  const message2 = new RequestDataMessage(888, 'a', value);
  const message3 = new ResponseCompleteMessage(3, value);

  for (const jsonCodec of codecList) {
    describe(jsonCodec.id, () => {
      test('two messages', () => {
        const encoded = codec.encode(jsonCodec, [message1, message2]);
        const decoded = codec.decodeBatch(jsonCodec, encoded);
        expect(decoded).toStrictEqual([message1, message2]);
      });

      test('three messages', () => {
        const encoded = codec.encode(jsonCodec, [message3, message1, message2]);
        const decoded = codec.decodeBatch(jsonCodec, encoded);
        expect(decoded).toStrictEqual([message3, message1, message2]);
      });

      test('three messages - 2', () => {
        const encoded = codec.encode(jsonCodec, [message1, message2, message3]);
        const decoded = codec.decodeBatch(jsonCodec, encoded);
        expect(decoded).toStrictEqual([message1, message2, message3]);
      });

      test('four messages', () => {
        const encoded = codec.encode(jsonCodec, [message1, message2, message1, message3]);
        const decoded = codec.decodeBatch(jsonCodec, encoded);
        expect(decoded).toStrictEqual([message1, message2, message1, message3]);
      });

      test('many messages', () => {
        const list = Object.values(messages);
        const encoded = codec.encode(jsonCodec, list);
        const decoded = codec.decodeBatch(jsonCodec, encoded);
        expect(decoded).toStrictEqual(list);
      });

      test('notification messages', () => {
        const list = [
          messages.notification1,
          messages.notification3,
          messages.notification3,
          messages.notification3,
          messages.notification3,
          messages.notification2,
          messages.notification1,
          messages.notification2,
          messages.notification2,
          messages.notification2,
          messages.notification3,
          messages.notification4,
          messages.notification3,
          messages.notification4,
        ];
        const encoded = codec.encode(jsonCodec, list);
        const decoded = codec.decodeBatch(jsonCodec, encoded);
        expect(decoded).toStrictEqual(list);
      });
    });
  }
});
