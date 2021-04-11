import {BinaryRxClient} from '../BinaryRxClient';
import {take} from 'rxjs/operators';
import {
  CompleteMessage,
  DataMessage,
  ErrorMessage,
  NotificationMessage,
  SubscribeMessage,
  UnsubscribeMessage,
} from '../messages';
import {decodeFullMessages, Encoder} from '../codec';

const encoder = new Encoder();

test('can create client', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
});

test('does not send any messages on initialization', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
});

test('sends notification message on .notify() call', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  client.notify('foo', Buffer.from('bar'));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const outgoing = encoder.encode([new NotificationMessage('foo', Buffer.from('bar'))]);
  expect(send).toHaveBeenCalledWith(outgoing);
});

test('sends notification with no payload', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  client.notify('foo', undefined);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const outgoing = encoder.encode([new NotificationMessage('foo', undefined)]);
  expect(send).toHaveBeenCalledWith(outgoing);
});

test('returns Observable on new execution', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(typeof result.subscribe).toBe('function');
});

test('observable does not emit before it receives messages from server', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  const sub = jest.fn();
  result.subscribe(sub);
  await new Promise((r) => setTimeout(r, 2));
  expect(sub).toHaveBeenCalledTimes(0);
});

test('sends subscription message to the server', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const outgoing = encoder.encode([new SubscribeMessage(1, 'test', Buffer.from("{foo: 'bar'}"))]);
  expect(send).toHaveBeenCalledWith(outgoing);
});

test('sends un-subscription message to the server on unsubscribe', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  const sub = jest.fn();
  const subscription = result.subscribe(sub);
  await new Promise((r) => setTimeout(r, 2));
  subscription.unsubscribe();
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(2);
  const outgoing = encoder.encode([new UnsubscribeMessage(1)]);
  expect(send).toHaveBeenCalledWith(outgoing);
});

test('server can immediately complete the subscription', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 2));
  const completeMsg = new CompleteMessage(1, undefined);
  client.onMessages([completeMsg]);
  await new Promise((r) => setTimeout(r, 2));
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
});

test('server can immediately complete the subscription with payload', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  const completeMsg = new CompleteMessage(1, Buffer.from("{x: 'y'}"));
  client.onMessages([completeMsg]);
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(Buffer.from("{x: 'y'}"));
});

test('server can send multiple values before completing', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessages([new DataMessage(1, Buffer.from([1]))]);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessages([new DataMessage(1, Buffer.from([2]))]);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessages([new CompleteMessage(1, Buffer.from([3]))]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(3);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(Buffer.from([1]));
  expect(next).toHaveBeenCalledWith(Buffer.from([2]));
  expect(next).toHaveBeenCalledWith(Buffer.from([3]));
});

test('values are not emitted after observable is unsubscribed', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessages([new DataMessage(1, Buffer.from([1]))]);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessages([new DataMessage(1, Buffer.from([2]))]);
  await new Promise((r) => setTimeout(r, 20));
  subscription.unsubscribe();
  client.onMessages([new CompleteMessage(1, Buffer.from([3]))]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledWith(Buffer.from([1]));
  expect(next).toHaveBeenCalledWith(Buffer.from([2]));
});

test('can subscribe to multiple methods', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});

  const result1 = client.call('foo', Buffer.from([1]));
  const next1 = jest.fn();
  const error1 = jest.fn();
  const complete1 = jest.fn();
  const subscription1 = result1.subscribe(next1, error1, complete1);

  await new Promise((r) => setTimeout(r, 2));

  const result2 = client.call('bar', Buffer.from([2]));
  const next2 = jest.fn();
  const error2 = jest.fn();
  const complete2 = jest.fn();
  const subscription2 = result2.subscribe(next2, error2, complete2);

  await new Promise((r) => setTimeout(r, 2));

  expect(send).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledWith(encoder.encode([new SubscribeMessage(1, 'foo', Buffer.from([1]))]));
  expect(send).toHaveBeenCalledWith(encoder.encode([new SubscribeMessage(2, 'bar', Buffer.from([2]))]));

  client.onMessages([new DataMessage(2, Buffer.from('gg'))]);
  await new Promise((r) => setTimeout(r, 20));

  expect(next1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledWith(Buffer.from('gg'));

  client.onMessages([new DataMessage(1, Buffer.from('lala'))]);
  await new Promise((r) => setTimeout(r, 20));

  expect(next1).toHaveBeenCalledWith(Buffer.from('lala'));
  expect(next1).toHaveBeenCalledTimes(1);
  expect(next2).toHaveBeenCalledTimes(1);

  client.onMessages([new CompleteMessage(1, Buffer.from('1'))]);
  client.onMessages([new CompleteMessage(2, undefined)]);

  expect(next1).toHaveBeenCalledWith(Buffer.from('1'));
  expect(next1).toHaveBeenCalledTimes(2);
  expect(next2).toHaveBeenCalledTimes(1);

  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(1);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(1);
});

test('can respond with error', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessages([new ErrorMessage(1, Buffer.from([1]))]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledWith(Buffer.from([1]));
});

test('does not send unsubscribe when complete has been received', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  const result = client.call('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  expect(send).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledTimes(0);
  client.onMessages([new CompleteMessage(1, Buffer.from([1]))]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(1);
});

test('does not send unsubscribe when complete has been received - 2', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable = client.call('test', Buffer.from("{foo: 'bar'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const promise = observable.pipe(take(1)).toPromise();
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  client.onMessages([new CompleteMessage(1, Buffer.from([25]))]);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const result = await promise;
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(result).toEqual(Buffer.from([25]));
});

test('does not send unsubscribe when error has been received', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable = client.call('test', Buffer.from("{foo: 'bar'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const promise = observable.pipe(take(1)).toPromise();
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  client.onMessages([new ErrorMessage(1, Buffer.from([25]))]);
  expect(send).toHaveBeenCalledTimes(1);
  let error;
  try {
    await promise;
  } catch (err) {
    error = err;
  }
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(error).toEqual(Buffer.from([25]));
});

test('after .stop() completes subscriptions', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable = client.call('test', Buffer.from('{}'));
  const data = jest.fn();
  observable.subscribe(data);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(data).toHaveBeenCalledTimes(0);
  client.onMessages([new DataMessage(1, Buffer.from([1]))]);
  expect(data).toHaveBeenCalledTimes(1);
  client.onMessages([new DataMessage(1, Buffer.from([2]))]);
  expect(data).toHaveBeenCalledTimes(2);
  client.stop();
  client.onMessages([new DataMessage(1, Buffer.from([3]))]);
  expect(data).toHaveBeenCalledTimes(2);
});

test('combines multiple messages in a batch', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable1 = client.call('test', Buffer.from('{}'));
  const observable2 = client.call('test2', Buffer.from("{foo: 'bar'}"));
  client.notify('test3', Buffer.from("{gg: 'bet'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const messages = decodeFullMessages(send.mock.calls[0][0], 0);

  expect(messages[0]).toBeInstanceOf(SubscribeMessage);
  expect((messages[0] as any).id).toBe(1);
  expect((messages[0] as any).method).toBe('test');
  expect(Buffer.from((messages[0] as any).data).toString()).toBe(Buffer.from('{}').toString());

  expect(messages[1]).toBeInstanceOf(SubscribeMessage);
  expect((messages[1] as any).id).toBe(2);
  expect((messages[1] as any).method).toBe('test2');
  expect(Buffer.from((messages[1] as any).data).toString()).toBe(Buffer.from("{foo: 'bar'}").toString());

  expect(messages[2]).toBeInstanceOf(NotificationMessage);
  expect((messages[2] as any).method).toBe('test3');
  expect(Buffer.from((messages[2] as any).data).toString()).toBe(Buffer.from("{gg: 'bet'}").toString());
});

test('can receive and process a batch from server', async () => {
  const send = jest.fn();
  const client = new BinaryRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable1 = client.call('test', Buffer.from('{}'));
  const observable2 = client.call('test2', Buffer.from("{foo: 'bar'}"));
  const data1 = jest.fn();
  const data2 = jest.fn();
  const error1 = jest.fn();
  const error2 = jest.fn();
  const complete1 = jest.fn();
  const complete2 = jest.fn();
  observable1.subscribe(data1, error1, complete1);
  observable2.subscribe(data2, error2, complete2);
  client.notify('test3', Buffer.from("{gg: 'bet'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(data1).toHaveBeenCalledTimes(0);
  expect(data2).toHaveBeenCalledTimes(0);
  client.onArray(
    encoder.encode([
      new CompleteMessage(1, Buffer.from("{foo: 'bar'}")),
      new CompleteMessage(2, Buffer.from("{foo: 'baz'}")),
    ]),
  );
  await new Promise((r) => setTimeout(r, 2));
  expect(data1).toHaveBeenCalledTimes(1);
  expect(data2).toHaveBeenCalledTimes(1);
  expect(Buffer.from(data1.mock.calls[0][0]).toString()).toBe("{foo: 'bar'}");
  expect(Buffer.from(data2.mock.calls[0][0]).toString()).toBe("{foo: 'baz'}");
  expect(error1).toHaveBeenCalledTimes(0);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(1);
  expect(complete2).toHaveBeenCalledTimes(1);
});
