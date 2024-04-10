import {
  NotificationMessage,
  ReactiveRpcMessage,
  RequestDataMessage,
  RequestUnsubscribeMessage,
  ResponseDataMessage,
} from '../../../messages';
import {RpcValue} from '../../../messages/Value';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';

const cborCodec = new CborJsonValueCodec(new Writer(64));
const encoder = cborCodec.encoder;
const val = <T>(v: T) => new RpcValue<T>(v, undefined);
const encode = (msg: ReactiveRpcMessage) => {
  msg.encodeBinary(cborCodec);
  return encoder.writer.flush();
};

describe('notification message', () => {
  test('encodes notification message with no method and no payload', () => {
    cborCodec.encoder.writer.x0 = 61;
    cborCodec.encoder.writer.x = 61;
    const msg = new NotificationMessage('', val(undefined));
    const buf = encode(msg);
    expect(buf).toMatchInlineSnapshot(`
      Uint8Array [
        0,
        0,
        0,
        0,
      ]
    `);
  });

  test('encodes notification message with no payload', () => {
    const msg = new NotificationMessage('abc', val(undefined));
    const buf = encode(msg);
    expect(buf).toMatchInlineSnapshot(`
      Uint8Array [
        0,
        0,
        0,
        3,
        97,
        98,
        99,
      ]
    `);
  });

  test('encodes notification message with payload', () => {
    const msg = new NotificationMessage('abc', val(123));
    const buf = encode(msg);
    expect(buf).toMatchInlineSnapshot(`
      Uint8Array [
        0,
        0,
        2,
        3,
        97,
        98,
        99,
        24,
        123,
      ]
    `);
  });
});

describe('request', () => {
  describe('data message', () => {
    test('empty method name', () => {
      const msg = new RequestDataMessage(0x0abc, '', val(undefined));
      const buf = encode(msg);
      expect(buf).toMatchInlineSnapshot(`
        Uint8Array [
          32,
          0,
          10,
          188,
          0,
        ]
      `);
    });

    test('no payload', () => {
      const msg = new RequestDataMessage(0x1, 'foo', val(undefined));
      const buf = encode(msg);
      expect(buf).toMatchInlineSnapshot(`
        Uint8Array [
          32,
          0,
          0,
          1,
          3,
          102,
          111,
          111,
        ]
      `);
    });

    test('with payload', () => {
      cborCodec.encoder.writer.x0 = 49;
      cborCodec.encoder.writer.x = 49;
      const msg = new RequestDataMessage(0x1, 'aaa', val('bbb'));
      const buf = encode(msg);
      expect(buf).toMatchInlineSnapshot(`
        Uint8Array [
          32,
          4,
          0,
          1,
          3,
          97,
          97,
          97,
          99,
          98,
          98,
          98,
        ]
      `);
    });
  });

  describe('unsubscribe message', () => {
    test('encodes a simple un-subscribe message', () => {
      const msg = new RequestUnsubscribeMessage(0x7);
      const buf = encode(msg);
      expect(buf).toMatchInlineSnapshot(`
        Uint8Array [
          224,
          0,
          0,
          7,
        ]
      `);
    });
  });
});

describe('response', () => {
  describe('data message', () => {
    test('encodes a data message', () => {
      cborCodec.encoder.writer.x0 = 49;
      cborCodec.encoder.writer.x = 49;
      const msg = new ResponseDataMessage(0x3, val('bbb'));
      const buf = encode(msg);
      expect(buf).toMatchInlineSnapshot(`
        Uint8Array [
          128,
          4,
          0,
          3,
          99,
          98,
          98,
          98,
        ]
      `);
    });
  });
});
