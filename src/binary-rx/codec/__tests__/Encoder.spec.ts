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
