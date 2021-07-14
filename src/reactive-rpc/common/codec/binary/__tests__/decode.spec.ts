import {Encoder} from '../Encoder';
import {decodeFullMessages} from '../decode';
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

const encoder = new Encoder();

test('decodes a simple un-subscribe message', () => {
  const messages1 = [new BinaryResponseUnsubscribeMessage(5)];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0, buf.length);
  expect(messages2).toEqual(messages1);
});

test('decodes all message types', () => {
  const messages1 = [
    new BinaryResponseUnsubscribeMessage(5),
    new BinaryRequestDataMessage(0xfafb, 'lala', new Uint8Array([1, 2, 3])),
    new BinaryRequestCompleteMessage(0xfafb, 'lala', new Uint8Array([1, 2, 3])),
    new BinaryRequestDataMessage(0xf1, '', new Uint8Array([])),
    new BinaryRequestCompleteMessage(0xf1, '', new Uint8Array([])),
    new BinaryRequestErrorMessage(0xdfdf, '', new Uint8Array([1, 2])),
    new BinaryRequestErrorMessage(0xdfdf, 'ma/super/method/name', new Uint8Array([])),
    new BinaryRequestUnsubscribeMessage(2312),
    new BinaryNotificationMessage('ag.util', new Uint8Array([123, 123, 123])),
    new BinaryNotificationMessage('ag.util2', new Uint8Array([])),
    new BinaryResponseDataMessage(0x0, new Uint8Array([])),
    new BinaryResponseDataMessage(0xaaaa, new Uint8Array([0, 0, 0])),
    new BinaryResponseUnsubscribeMessage(0xaaaa),
    new BinaryResponseErrorMessage(0xabba, new Uint8Array('1'.repeat(11).split('').map(Number))),
    new BinaryResponseUnsubscribeMessage(0xaaaa),
    new BinaryResponseCompleteMessage(123, new Uint8Array([1])),
    new BinaryResponseUnsubscribeMessage(0xaaaa),
    new BinaryResponseCompleteMessage(123, new Uint8Array('1'.repeat(17).split('').map(Number))),
    new BinaryResponseCompleteMessage(123, new Uint8Array('1'.repeat(333).split('').map(Number))),
    new BinaryResponseUnsubscribeMessage(0xaaaa),
  ];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0, buf.length);
  expect(messages2).toEqual(messages1);
});

test('decodes long messages', () => {
  const messages1 = [
    new BinaryResponseUnsubscribeMessage(0xaaaa),
    new BinaryResponseCompleteMessage(123, new Uint8Array('1'.repeat(0b1_0000).split('').map(Number))),
    new BinaryResponseUnsubscribeMessage(0xaaaa),
  ];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0, buf.length);
  expect(messages2).toEqual(messages1);
});

test('decodes long messages - 2', () => {
  const messages1 = [
    new BinaryResponseUnsubscribeMessage(0xaaaa),
    new BinaryRequestDataMessage(
      4,
      'asdfasdfasdlfkajs0923lskjdfasdf',
      new Uint8Array('1'.repeat(0b1_0000000_0000).split('').map(Number)),
    ),
    new BinaryResponseUnsubscribeMessage(0xaaaa),
  ];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0, buf.length);
  expect(messages2).toEqual(messages1);
});

test('decodes long messages - 3', () => {
  const messages1 = [
    new BinaryResponseUnsubscribeMessage(0xaaaa),
    new BinaryRequestDataMessage(
      0x1234,
      'google.who',
      new Uint8Array('1'.repeat(0b1_1111111_0000000_0000).split('').map(Number)),
    ),
    new BinaryResponseUnsubscribeMessage(0xaaaa),
  ];
  const buf = encoder.encode(messages1);
  const messages2 = decodeFullMessages(buf, 0, buf.length);
  expect(messages2).toEqual(messages1);
});
