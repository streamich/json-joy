import {
  NotificationMessage,
  ReactiveRpcMessage,
  RequestCompleteMessage,
  RequestDataMessage,
  RequestUnsubscribeMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
} from '../../../messages';
import {RpcValue} from '../../../messages/Value';
import {decode} from '../decode';
import {Reader} from '@jsonjoy.com/util/lib/buffers/Reader';
import {Uint8ArrayCut} from '@jsonjoy.com/util/lib/buffers/Uint8ArrayCut';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';

const codec = new CborJsonValueCodec(new Writer(64));
const encoder = codec.encoder;
const decoder = codec.decoder;
const val = <T>(v: T) => new RpcValue<T>(v, undefined);
const assertMessage = (msg: ReactiveRpcMessage) => {
  encoder.writer.reset();
  msg.encodeBinary(codec);
  const encoded = encoder.writer.flush();
  const reader = new Reader();
  reader.reset(encoded);
  const decoded = decode(reader);
  // console.log(decoded);
  if ((decoded as any).value) {
    const cut = (decoded as any).value.data as Uint8ArrayCut;
    const arr = cut.uint8.subarray(cut.start, cut.start + cut.size);
    (decoded as any).value.data = arr.length ? decoder.decode(arr) : undefined;
  }
  expect(decoded).toEqual(msg);
};

describe('decodes back various messages', () => {
  test('empty notification', () => {
    assertMessage(new NotificationMessage('', val(undefined)));
  });

  test('notification with empty payload', () => {
    assertMessage(new NotificationMessage('hello.world', val(undefined)));
  });

  test('notification with payload', () => {
    assertMessage(new NotificationMessage('foo', val({foo: 'bar'})));
  });

  test('empty Request Data message', () => {
    assertMessage(new RequestDataMessage(0, '', val(undefined)));
  });

  test('Request Data message', () => {
    assertMessage(new RequestDataMessage(123, 'abc', val({foo: 'bar'})));
  });

  test('Request Complete message', () => {
    assertMessage(new RequestCompleteMessage(23324, 'adfasdf', val({foo: 'bar'})));
  });

  test('Request Error message', () => {
    assertMessage(new RequestCompleteMessage(4321, '', val('asdf')));
  });

  test('Request Un-subscribe message', () => {
    assertMessage(new RequestUnsubscribeMessage(4321));
  });

  test('empty Response Data message', () => {
    assertMessage(new ResponseDataMessage(0, val(undefined)));
  });

  test('Response Data message', () => {
    assertMessage(new ResponseDataMessage(123, val({foo: 'bar'})));
  });

  test('Response Complete message', () => {
    assertMessage(new ResponseCompleteMessage(123, val({foo: 'bar'})));
  });

  test('Response Error message', () => {
    assertMessage(new ResponseErrorMessage(123, val({foo: 'bar'})));
  });

  test('Response Un-subscribe message', () => {
    assertMessage(new ResponseUnsubscribeMessage(4321));
  });
});
