import {
  BinaryNotificationMessage,
  BinaryRequestCompleteMessage,
  BinaryRequestDataMessage,
  BinaryRequestErrorMessage,
  BinaryRequestUnsubscribeMessage,
  BinaryResponseCompleteMessage,
  BinaryResponseDataMessage,
  BinaryResponseErrorMessage,
  BinaryResponseUnsubscribeMessage,
} from '../../../messages/binary';
import {MessageCode} from '../constants';
import {Encoder} from '../Encoder';

const encoder = new Encoder();

describe('notification message', () => {
  test('encodes notification message with no method and no payload', () => {
    const buf = encoder.encode([new BinaryNotificationMessage('', undefined)]);
    expect(buf.byteLength).toBe(2);
    expect(buf[0] >> 5).toBe(MessageCode.Notification);
    expect(buf[1]).toBe(0);
  });

  test('encodes notification message with no payload', () => {
    const buf = encoder.encode([new BinaryNotificationMessage('abc', undefined)]);
    expect(buf.byteLength).toBe(5);
    expect(buf[0] >> 5).toBe(MessageCode.Notification);
    expect(buf[1]).toBe(3);
    expect(buf[2]).toBe(97);
    expect(buf[3]).toBe(98);
    expect(buf[4]).toBe(99);
  });

  test('encodes notification message with payload', () => {
    const buf = encoder.encode([new BinaryNotificationMessage('abc', new Uint8Array([1, 2, 3]))]);
    expect(buf.byteLength).toBe(8);
    expect(buf[0] >> 5).toBe(MessageCode.Notification);
    expect(buf[1]).toBe(3);
    expect(buf[2]).toBe(97);
    expect(buf[3]).toBe(98);
    expect(buf[4]).toBe(99);
    expect(buf[5]).toBe(1);
    expect(buf[6]).toBe(2);
    expect(buf[7]).toBe(3);
  });
});

describe('request', () => {
  describe('data message', () => {
    test('empty method name', () => {
      const buf = encoder.encode([new BinaryRequestDataMessage(0x0abc, '', undefined)]);
      expect(buf.byteLength).toBe(4);
      expect(buf[0]).toBe(MessageCode.RequestData << 5);
      expect(buf[1]).toBe(0x0a);
      expect(buf[2]).toBe(0xbc);
      expect(buf[3]).toBe(0);
    });

    test('no payload', () => {
      const buf = encoder.encode([new BinaryRequestDataMessage(0x0abc, 'foo', undefined)]);
      expect(buf.byteLength).toBe(7);
      expect(buf[0]).toBe((MessageCode.RequestData << 5) | 0);
      expect(buf[1]).toBe(0x0a);
      expect(buf[2]).toBe(0xbc);
      expect(buf[3]).toBe(3);
      expect(buf[4]).toBe(102);
      expect(buf[5]).toBe(111);
      expect(buf[6]).toBe(111);
    });

    test('with payload', () => {
      const buf = encoder.encode([new BinaryRequestDataMessage(0x0abc, 'foo', new Uint8Array([0, 1, 0xff, 0x7f]))]);
      expect(buf.byteLength).toBe(11);
      expect(buf[0]).toBe((MessageCode.RequestData << 5) | 4);
      expect(buf[1]).toBe(0x0a);
      expect(buf[2]).toBe(0xbc);
      expect(buf[3]).toBe(3);
      expect(buf[4]).toBe(102);
      expect(buf[5]).toBe(111);
      expect(buf[6]).toBe(111);
      expect(buf[7]).toBe(0);
      expect(buf[8]).toBe(1);
      expect(buf[9]).toBe(0xff);
      expect(buf[10]).toBe(0x7f);
    });
  });

  describe('complete message', () => {
    test('empty method name', () => {
      const buf = encoder.encode([new BinaryRequestCompleteMessage(0x0abc, '', undefined)]);
      expect(buf.byteLength).toBe(4);
      expect(buf[0]).toBe(MessageCode.RequestComplete << 5);
      expect(buf[1]).toBe(0x0a);
      expect(buf[2]).toBe(0xbc);
      expect(buf[3]).toBe(0);
    });

    test('no payload', () => {
      const buf = encoder.encode([new BinaryRequestCompleteMessage(0x0abc, 'foo', undefined)]);
      expect(buf.byteLength).toBe(7);
      expect(buf[0]).toBe((MessageCode.RequestComplete << 5) | 0);
      expect(buf[1]).toBe(0x0a);
      expect(buf[2]).toBe(0xbc);
      expect(buf[3]).toBe(3);
      expect(buf[4]).toBe(102);
      expect(buf[5]).toBe(111);
      expect(buf[6]).toBe(111);
    });

    test('with payload', () => {
      const buf = encoder.encode([new BinaryRequestCompleteMessage(0x0abc, 'foo', new Uint8Array([0, 1, 0xff, 0x7f]))]);
      expect(buf.byteLength).toBe(11);
      expect(buf[0]).toBe((MessageCode.RequestComplete << 5) | 4);
      expect(buf[1]).toBe(0x0a);
      expect(buf[2]).toBe(0xbc);
      expect(buf[3]).toBe(3);
      expect(buf[4]).toBe(102);
      expect(buf[5]).toBe(111);
      expect(buf[6]).toBe(111);
      expect(buf[7]).toBe(0);
      expect(buf[8]).toBe(1);
      expect(buf[9]).toBe(0xff);
      expect(buf[10]).toBe(0x7f);
    });
  });

  describe('error message', () => {
    test('encodes an error message', () => {
      const buf = encoder.encode([new BinaryRequestErrorMessage(0xcccc, '', new Uint8Array([55]))]);
      expect(buf.byteLength).toBe(5);
      expect(buf[0]).toBe((MessageCode.RequestError << 5) | 1);
      expect(buf[1]).toBe(0xcc);
      expect(buf[2]).toBe(0xcc);
      expect(buf[3]).toBe(0);
      expect(buf[4]).toBe(55);
    });
  });

  describe('unsubscribe message', () => {
    test('encodes a simple un-subscribe message', () => {
      const buf = encoder.encode([new BinaryRequestUnsubscribeMessage(5)]);
      expect(buf.byteLength).toBe(3);
      expect(buf[0]).toBe(MessageCode.RequestUnsubscribe);
      expect(buf[1]).toBe(0);
      expect(buf[2]).toBe(5);
    });

    test('three un-subscribe messages', () => {
      const buf = encoder.encode([
        new BinaryRequestUnsubscribeMessage(0xfa),
        new BinaryRequestUnsubscribeMessage(0),
        new BinaryRequestUnsubscribeMessage(0xbaff),
      ]);
      expect(buf.byteLength).toBe(9);
      expect(buf[0]).toBe(MessageCode.RequestUnsubscribe);
      expect(buf[1]).toBe(0);
      expect(buf[2]).toBe(0xfa);
      expect(buf[3]).toBe(MessageCode.RequestUnsubscribe);
      expect(buf[4]).toBe(0);
      expect(buf[5]).toBe(0);
      expect(buf[6]).toBe(MessageCode.RequestUnsubscribe);
      expect(buf[7]).toBe(0xba);
      expect(buf[8]).toBe(0xff);
    });
  });
});

describe('response', () => {
  describe('data message', () => {
    test('encodes a data message', () => {
      const buf = encoder.encode([new BinaryResponseDataMessage(0xcccc, new Uint8Array([55]))]);
      expect(buf.byteLength).toBe(4);
      expect(buf[0]).toBe((MessageCode.ResponseData << 5) | 1);
      expect(buf[1]).toBe(0xcc);
      expect(buf[2]).toBe(0xcc);
      expect(buf[3]).toBe(55);
    });
  });

  describe('complete message', () => {
    test('encodes a complete message', () => {
      const buf = encoder.encode([new BinaryResponseCompleteMessage(0xcccc, new Uint8Array([55]))]);
      expect(buf.byteLength).toBe(4);
      expect(buf[0]).toBe((MessageCode.ResponseComplete << 5) | 1);
      expect(buf[1]).toBe(0xcc);
      expect(buf[2]).toBe(0xcc);
      expect(buf[3]).toBe(55);
    });

    test('encodes a complete message with no payload', () => {
      const buf = encoder.encode([new BinaryResponseCompleteMessage(0xccdd, undefined)]);
      expect(buf.byteLength).toBe(3);
      expect(buf[0]).toBe((MessageCode.ResponseComplete << 5) | 0);
      expect(buf[1]).toBe(0xcc);
      expect(buf[2]).toBe(0xdd);
    });
  });

  describe('error message', () => {
    test('encodes a error message', () => {
      const buf = encoder.encode([new BinaryResponseErrorMessage(0xcccc, new Uint8Array([55]))]);
      expect(buf.byteLength).toBe(4);
      expect(buf[0]).toBe((MessageCode.ResponseError << 5) | 1);
      expect(buf[1]).toBe(0xcc);
      expect(buf[2]).toBe(0xcc);
      expect(buf[3]).toBe(55);
    });
  });

  describe('unsubscribe message', () => {
    test('encodes a simple un-subscribe message', () => {
      const buf = encoder.encode([new BinaryResponseUnsubscribeMessage(5)]);
      expect(buf.byteLength).toBe(3);
      expect(buf[0]).toBe(MessageCode.ResponseUnsubscribe);
      expect(buf[1]).toBe(0);
      expect(buf[2]).toBe(5);
    });

    test('three un-subscribe messages', () => {
      const buf = encoder.encode([
        new BinaryResponseUnsubscribeMessage(0xfa),
        new BinaryResponseUnsubscribeMessage(0),
        new BinaryResponseUnsubscribeMessage(0xbaff),
      ]);
      expect(buf.byteLength).toBe(9);
      expect(buf[0]).toBe(MessageCode.ResponseUnsubscribe);
      expect(buf[1]).toBe(0);
      expect(buf[2]).toBe(0xfa);
      expect(buf[3]).toBe(MessageCode.ResponseUnsubscribe);
      expect(buf[4]).toBe(0);
      expect(buf[5]).toBe(0);
      expect(buf[6]).toBe(MessageCode.ResponseUnsubscribe);
      expect(buf[7]).toBe(0xba);
      expect(buf[8]).toBe(0xff);
    });
  });
});
