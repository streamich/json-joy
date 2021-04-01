import {CompleteMessage} from '../../messages/CompleteMessage';
import {DataMessage} from '../../messages/DataMessage';
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

describe('DataMessage', () => {
  test('encodes data message with payload', () => {
    const payload = new Uint8Array([1, 2, 3, 4]);
    const message = new DataMessage(0, payload);
    const uint8 = encode(message);
    expect([...uint8]).toEqual([1, 6, 0, 0, 1, 2, 3, 4]);
  });
});
