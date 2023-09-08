import {CompactRpcMessageCodec} from '..';
import {Writer} from '../../../../../util/buffers/Writer';
import {Codecs} from '../../../../../json-pack/codecs/Codecs';
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
import {Value} from '../../../messages/Value';
import {RpcError} from '../../../rpc/caller/error';

const writer = new Writer(8 * Math.round(Math.random() * 100));
const codecs = new Codecs(writer);
const codec = new CompactRpcMessageCodec();

// const codecList = [codecs.msgpack];
const codecList = [codecs.cbor, codecs.msgpack, codecs.json];

for (const jsonCodec of codecList) {
  const assertMessage = (message: ReactiveRpcMessage) => {
    const encoded = codec.encode(jsonCodec, [message]);
    const decoded = jsonCodec.decoder.read(encoded);
    expect(decoded).toStrictEqual([message.toCompact()]);
  };

  describe(jsonCodec.id, () => {
    test('Notification message', () => {
      const value = new Value({foo: 'bar'}, undefined);
      const message = new NotificationMessage('abc', value);
      assertMessage(message);
    });

    test('Request Data message', () => {
      const value = new Value([1, 2, 3], undefined);
      const message = new RequestDataMessage(123456, 'a', value);
      assertMessage(message);
    });

    test('Request Complete message', () => {
      const value = new Value(true, undefined);
      const message = new RequestCompleteMessage(3, 'abc', value);
      assertMessage(message);
    });

    test('Request Error message', () => {
      const value = new Value({message: 'Error!', errno: 123, code: 'ERROR'}, undefined);
      const message = new RequestErrorMessage(0, 'wtf', value);
      assertMessage(message);
    });

    test('Request Unsubscribe message', () => {
      const message = new RequestUnsubscribeMessage(98765);
      assertMessage(message);
    });

    test('Response Data message', () => {
      const value = new Value([1, 2, 3], undefined);
      const message = new ResponseDataMessage(123456, value);
      assertMessage(message);
    });

    test('Response Complete message', () => {
      const value = new Value(true, undefined);
      const message = new ResponseCompleteMessage(3, value);
      assertMessage(message);
    });

    test('Response Error message', () => {
      const value = new Value({message: 'Error!', errno: 123, code: 'ERROR'}, undefined);
      const message = new ResponseErrorMessage(0, value);
      assertMessage(message);
    });

    test('Response Unsubscribe message', () => {
      const message = new ResponseUnsubscribeMessage(98765);
      assertMessage(message);
    });

    test('Response Error typed', () => {
      const value = RpcError.internalErrorValue();
      const message = new ResponseErrorMessage(123, value);
      const encoded = codec.encode(jsonCodec, [message]);
      const decoded1 = jsonCodec.decoder.read(encoded);
      const decoded2 = codec.decodeBatch(jsonCodec, encoded);
      expect((decoded1 as any)[0]).toEqual(decoded2[0].toCompact());
      expect((decoded2 as any)[0].value.data.message).toEqual(message.value.data.message);
    });
  });
}

describe('batch of messages', () => {
  const value = new Value({foo: 'bar'}, undefined);
  const message1 = new NotificationMessage('abc', value);
  const message2 = new RequestDataMessage(123456, 'a', value);
  const message3 = new ResponseCompleteMessage(3, value);

  for (const jsonCodec of codecList) {
    describe(jsonCodec.id, () => {
      test('two messages', () => {
        const encoded = codec.encode(jsonCodec, [message1, message2]);
        const decoded = jsonCodec.decoder.read(encoded);
        expect(decoded).toStrictEqual([message1.toCompact(), message2.toCompact()]);
      });

      test('three messages', () => {
        const encoded = codec.encode(jsonCodec, [message3, message1, message2]);
        const decoded = jsonCodec.decoder.read(encoded);
        expect(decoded).toStrictEqual([message3.toCompact(), message1.toCompact(), message2.toCompact()]);
      });
    });
  }
});
