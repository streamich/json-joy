import {CompleteMessage} from '../../messages/CompleteMessage';
import {DataMessage} from '../../messages/DataMessage';
import {ErrorMessage} from '../../messages/ErrorMessage';
import {NotificationMessage} from '../../messages/NotificationMessage';
import {SubscribeMessage} from '../../messages/SubscribeMessage';
import {UnsubscribeMessage} from '../../messages/UnsubscribeMessage';
import {MessageCode} from '../constants';
import {Encoder} from '../Encoder';

const encoder = new Encoder();

describe('unsubscribe message', () => {
  test('encodes a simple un-subscribe message', () => {
    const buf = encoder.encode([
      new UnsubscribeMessage(5),
    ]);
    expect(buf.byteLength).toBe(3);
    expect(buf[0] >> 5).toBe(MessageCode.Unsubscribe);
    expect(buf[1]).toBe(0);
    expect(buf[2]).toBe(5);
  });

  test('three un-subscribe messages', () => {
    const buf = encoder.encode([
      new UnsubscribeMessage(0xFA),
      new UnsubscribeMessage(0),
      new UnsubscribeMessage(0xBAFF),
    ]);
    expect(buf.byteLength).toBe(9);
    expect(buf[0] >> 5).toBe(MessageCode.Unsubscribe);
    expect(buf[1]).toBe(0);
    expect(buf[2]).toBe(0xFA);
    expect(buf[3] >> 5).toBe(MessageCode.Unsubscribe);
    expect(buf[4]).toBe(0);
    expect(buf[5]).toBe(0);
    expect(buf[6] >> 5).toBe(MessageCode.Unsubscribe);
    expect(buf[7]).toBe(0xBA);
    expect(buf[8]).toBe(0xFF);
  });
});

describe('notification message', () => {
  test('encodes notification message with no method and no payload', () => {
    const buf = encoder.encode([
      new NotificationMessage('', undefined),
    ]);
    expect(buf.byteLength).toBe(2);
    expect(buf[0] >> 5).toBe(MessageCode.Notification);
    expect(buf[1]).toBe(0);
  });

  test('encodes notification message with no payload', () => {
    const buf = encoder.encode([
      new NotificationMessage('abc', undefined),
    ]);
    expect(buf.byteLength).toBe(5);
    expect(buf[0] >> 5).toBe(MessageCode.Notification);
    expect(buf[1]).toBe(3);
    expect(buf[2]).toBe(97);
    expect(buf[3]).toBe(98);
    expect(buf[4]).toBe(99);
  });

  test('encodes notification message with payload', () => {
    const buf = encoder.encode([
      new NotificationMessage('abc', new Uint8Array([1, 2, 3])),
    ]);
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

describe('subscribe message', () => {
  test('encodes notification message with no method and no payload', () => {
    const buf = encoder.encode([
      new SubscribeMessage(0x0ABC, '', undefined),
    ]);
    expect(buf.byteLength).toBe(4);
    expect(buf[0]).toBe(MessageCode.Subscribe << 5);
    expect(buf[1]).toBe(0x0A);
    expect(buf[2]).toBe(0xBC);
    expect(buf[3]).toBe(0);
  });

  test('encodes notification message with no payload', () => {
    const buf = encoder.encode([
      new SubscribeMessage(0x0ABC, 'foo', undefined),
    ]);
    expect(buf.byteLength).toBe(7);
    expect(buf[0]).toBe((MessageCode.Subscribe << 5) | 0);
    expect(buf[1]).toBe(0x0A);
    expect(buf[2]).toBe(0xBC);
    expect(buf[3]).toBe(3);
    expect(buf[4]).toBe(102);
    expect(buf[5]).toBe(111);
    expect(buf[6]).toBe(111);
  });

  test('encodes notification message with payload', () => {
    const buf = encoder.encode([
      new SubscribeMessage(0x0ABC, 'foo', new Uint8Array([0, 1, 0xFF, 0x7F])),
    ]);
    expect(buf.byteLength).toBe(11);
    expect(buf[0]).toBe((MessageCode.Subscribe << 5) | 4);
    expect(buf[1]).toBe(0x0A);
    expect(buf[2]).toBe(0xBC);
    expect(buf[3]).toBe(3);
    expect(buf[4]).toBe(102);
    expect(buf[5]).toBe(111);
    expect(buf[6]).toBe(111);
    expect(buf[7]).toBe(0);
    expect(buf[8]).toBe(1);
    expect(buf[9]).toBe(0xFF);
    expect(buf[10]).toBe(0x7F);
  });
});

describe('data message', () => {
  test('encodes a data message', () => {
    const buf = encoder.encode([
      new DataMessage(0xCCCC, new Uint8Array([55])),
    ]);
    expect(buf.byteLength).toBe(4);
    expect(buf[0]).toBe((MessageCode.Data << 5) | 1);
    expect(buf[1]).toBe(0xCC);
    expect(buf[2]).toBe(0xCC);
    expect(buf[3]).toBe(55);
  });
});

describe('complete message', () => {
  test('encodes a complete message', () => {
    const buf = encoder.encode([
      new CompleteMessage(0xCCCC, new Uint8Array([55])),
    ]);
    expect(buf.byteLength).toBe(4);
    expect(buf[0]).toBe((MessageCode.Complete << 5) | 1);
    expect(buf[1]).toBe(0xCC);
    expect(buf[2]).toBe(0xCC);
    expect(buf[3]).toBe(55);
  });

  test('encodes a complete message with no payload', () => {
    const buf = encoder.encode([
      new CompleteMessage(0xCCDD, undefined),
    ]);
    expect(buf.byteLength).toBe(3);
    expect(buf[0]).toBe((MessageCode.Complete << 5) | 0);
    expect(buf[1]).toBe(0xCC);
    expect(buf[2]).toBe(0xDD);
  });
});

describe('error message', () => {
  test('encodes a error message', () => {
    const buf = encoder.encode([
      new ErrorMessage(0xCCCC, new Uint8Array([55])),
    ]);
    expect(buf.byteLength).toBe(4);
    expect(buf[0]).toBe((MessageCode.Error << 5) | 1);
    expect(buf[1]).toBe(0xCC);
    expect(buf[2]).toBe(0xCC);
    expect(buf[3]).toBe(55);
  });
});
