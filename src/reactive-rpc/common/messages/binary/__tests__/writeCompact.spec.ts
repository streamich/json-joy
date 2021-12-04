import {BinaryMessage, BinaryNotificationMessage, BinaryRequestCompleteMessage, BinaryRequestDataMessage, BinaryRequestErrorMessage, BinaryRequestUnsubscribeMessage, BinaryResponseCompleteMessage, BinaryResponseDataMessage, BinaryResponseErrorMessage, BinaryResponseUnsubscribeMessage} from '..';
import {encode, encoder, decode} from '../../../../../json-pack/util';
import {MsgPack} from '../../../../../json-pack';

const payloadJson = [1, 2, 3];
const payload = encode(payloadJson);

const check = (msg: BinaryMessage, expected: unknown) => {
  encoder.reset();
  msg.writeCompact(encoder);
  const encoded = encoder.flush();
  const decoded = decode(encoded as MsgPack<unknown>);
  expect(decoded).toStrictEqual(expected);
};

test('BinaryNotificationMessage no payload', () => {
  const msg = new BinaryNotificationMessage('method', undefined);
  check(msg, ['method']);
});

test('BinaryNotificationMessage with payload', () => {
  const msg = new BinaryNotificationMessage('method', payload);
  check(msg, ['method', payloadJson]);
});

test('BinaryRequestCompleteMessage no payload', () => {
  const msg = new BinaryRequestCompleteMessage(5, 'method', undefined);
  check(msg, [5, 'method']);
});

test('BinaryRequestCompleteMessage with payload', () => {
  const msg = new BinaryRequestCompleteMessage(5, 'method', payload);
  check(msg, [5, 'method', payloadJson]);
});

test('BinaryRequestDataMessage no payload', () => {
  const msg = new BinaryRequestDataMessage(5, 'method', undefined);
  check(msg, [5, 0, 'method']);
});

test('BinaryRequestDataMessage with payload', () => {
  const msg = new BinaryRequestDataMessage(5, 'method', payload);
  check(msg, [5, 0, 'method', payloadJson]);
});

test('BinaryRequestErrorMessage with payload', () => {
  const msg = new BinaryRequestErrorMessage(55, 'method', payload);
  check(msg, [55, 1, 'method', payloadJson]);
});

test('BinaryRequestUnsubscribeMessage with payload', () => {
  const msg = new BinaryRequestUnsubscribeMessage(123);
  check(msg, [123, 2]);
});

test('BinaryResponseCompleteMessage with payload', () => {
  const msg = new BinaryResponseCompleteMessage(32, undefined);
  check(msg, [0, 32]);
});

test('BinaryResponseCompleteMessage with payload', () => {
  const msg = new BinaryResponseCompleteMessage(32, payload);
  check(msg, [0, 32, payloadJson]);
});

test('BinaryResponseDataMessage with payload', () => {
  const msg = new BinaryResponseDataMessage(32, payload);
  check(msg, [-2, 32, payloadJson]);
});

test('BinaryResponseErrorMessage with payload', () => {
  const msg = new BinaryResponseErrorMessage(32, payload);
  check(msg, [-1, 32, payloadJson]);
});

test('BinaryResponseUnsubscribeMessage with payload', () => {
  const msg = new BinaryResponseUnsubscribeMessage(33);
  check(msg, [-3, 33]);
});
