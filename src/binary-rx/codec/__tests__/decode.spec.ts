import {CompleteMessage} from '../../messages/CompleteMessage';
import {DataMessage} from '../../messages/DataMessage';
import {ErrorMessage} from '../../messages/ErrorMessage';
import {NotificationMessage} from '../../messages/NotificationMessage';
import {SubscribeMessage} from '../../messages/SubscribeMessage';
import {UnsubscribeMessage} from '../../messages/UnsubscribeMessage';
import {Encoder} from '../Encoder';
import {decodeFullMessages} from '../decode';

const encoder = new Encoder();

test('decodes a simple un-subscribe message', () => {
  const messages1 = [new UnsubscribeMessage(5)];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0);
  expect(messages2).toEqual(messages1);
});

test('decodes all message types', () => {
  const messages1 = [
    new UnsubscribeMessage(5),
    new SubscribeMessage(0xfafb, 'lala', new Uint8Array([1, 2, 3])),
    new SubscribeMessage(0xf1, '', new Uint8Array([])),
    new NotificationMessage('ag.util', new Uint8Array([123, 123, 123])),
    new NotificationMessage('ag.util2', new Uint8Array([])),
    new DataMessage(0x0, new Uint8Array([])),
    new DataMessage(0xaaaa, new Uint8Array([0, 0, 0])),
    new UnsubscribeMessage(0xaaaa),
    new ErrorMessage(0xabba, new Uint8Array('1'.repeat(11).split('').map(Number))),
    new UnsubscribeMessage(0xaaaa),
    new CompleteMessage(123, new Uint8Array([1])),
    new UnsubscribeMessage(0xaaaa),
    new CompleteMessage(123, new Uint8Array('1'.repeat(17).split('').map(Number))),
    new CompleteMessage(123, new Uint8Array('1'.repeat(333).split('').map(Number))),
    new UnsubscribeMessage(0xaaaa),
  ];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0);
  expect(messages2).toEqual(messages1);
});

test('decodes long messages', () => {
  const messages1 = [
    new UnsubscribeMessage(0xaaaa),
    new CompleteMessage(123, new Uint8Array('1'.repeat(0b1_0000).split('').map(Number))),
    new UnsubscribeMessage(0xaaaa),
  ];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0);
  expect(messages2).toEqual(messages1);
});

test('decodes long messages - 2', () => {
  const messages1 = [
    new UnsubscribeMessage(0xaaaa),
    new SubscribeMessage(
      4,
      'asdfasdfasdlfkajs0923lskjdfasdf',
      new Uint8Array('1'.repeat(0b1_0000000_0000).split('').map(Number)),
    ),
    new UnsubscribeMessage(0xaaaa),
  ];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0);
  expect(messages2).toEqual(messages1);
});

test('decodes long messages - 3', () => {
  const messages1 = [
    new UnsubscribeMessage(0xaaaa),
    new SubscribeMessage(
      0x1234,
      'google.who',
      new Uint8Array('1'.repeat(0b1_1111111_0000000_0000).split('').map(Number)),
    ),
    new UnsubscribeMessage(0xaaaa),
  ];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0);
  expect(messages2).toEqual(messages1);
});
