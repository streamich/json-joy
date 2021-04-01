import {CompleteMessage} from '../../messages/CompleteMessage';
import {encode} from '../encode';

describe('CompleteMessage', () => {
  test('encodes complete message without payload', () => {
    const message = new CompleteMessage(5, undefined);
    const uint8 = encode(message);
    expect([...uint8]).toEqual([0, 2, 0, 5]);
  });

  test('encodes complete message with payload', () => {
    const payload = new Uint8Array([1, 2, 3]);
    const message = new CompleteMessage(6, payload);
    const uint8 = encode(message);
    expect([...uint8]).toEqual([0, 5, 0, 6, 1, 2, 3]);
  });
});
