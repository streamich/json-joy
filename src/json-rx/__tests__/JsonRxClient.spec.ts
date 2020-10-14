import {JsonRxClient} from '../JsonRxClient';
import {take} from 'rxjs/operators';

test('can create client', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
});

test('does not send any messages on initialization', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
});

test('sends notification message on .notify() call', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  client.notify('foo', 'bar');
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith(['foo', 'bar']);
});

test('sends notification with no payload', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  client.notify('foo');
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith(['foo']);
});

test('returns Observable on new execution', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(typeof result.subscribe).toBe('function');
});

test('observable does not emit before it receives messages from server', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  const sub = jest.fn();
  result.subscribe(sub);
  await new Promise((r) => setTimeout(r, 2));
  expect(sub).toHaveBeenCalledTimes(0);
});

test('sends subscription message to the server', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith([1, 'test', {foo: 'bar'}]);
});

test('sends un-subscription message to the server on unsubscribe', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  const sub = jest.fn();
  const subscription = result.subscribe(sub);
  await new Promise((r) => setTimeout(r, 2));
  subscription.unsubscribe();
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledWith([-3, 1]);
});

test('server can immediately complete the subscription', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 2));
  client.onMessage([0, 1]);
  await new Promise((r) => setTimeout(r, 2));
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
});

test('server can immediately complete the subscription with payload', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessage([0, 1, {x: 'y'}]);
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith({x: 'y'});
});

test('server can send multiple values before completing', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessage([-2, 1, 1]);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessage([-2, 1, 2]);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessage([0, 1, 3]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(3);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(1);
  expect(next).toHaveBeenCalledWith(2);
  expect(next).toHaveBeenCalledWith(3);
});

test('values are not emitted after observable is unsubscribed', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessage([-2, 1, 1]);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessage([-2, 1, 2]);
  await new Promise((r) => setTimeout(r, 20));
  subscription.unsubscribe();
  client.onMessage([0, 1, 3]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledWith(1);
  expect(next).toHaveBeenCalledWith(2);
});

test('can subscribe to multiple methods', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});

  const result1 = client.call('foo', 1);
  const next1 = jest.fn();
  const error1 = jest.fn();
  const complete1 = jest.fn();
  const subscription1 = result1.subscribe(next1, error1, complete1);

  await new Promise((r) => setTimeout(r, 2));

  const result2 = client.call('bar', 2);
  const next2 = jest.fn();
  const error2 = jest.fn();
  const complete2 = jest.fn();
  const subscription2 = result2.subscribe(next2, error2, complete2);

  await new Promise((r) => setTimeout(r, 2));

  expect(send).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledWith([1, 'foo', 1]);
  expect(send).toHaveBeenCalledWith([2, 'bar', 2]);

  client.onMessage([-2, 2, 'gg']);
  await new Promise((r) => setTimeout(r, 20));

  expect(next1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledWith('gg');

  client.onMessage([-2, 1, 'lala']);
  await new Promise((r) => setTimeout(r, 20));

  expect(next1).toHaveBeenCalledWith('lala');
  expect(next1).toHaveBeenCalledTimes(1);
  expect(next2).toHaveBeenCalledTimes(1);

  client.onMessage([0, 1, '1']);
  client.onMessage([0, 2]);

  expect(next1).toHaveBeenCalledWith('1');
  expect(next1).toHaveBeenCalledTimes(2);
  expect(next2).toHaveBeenCalledTimes(1);

  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(1);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(1);
});

test('can respond with error', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessage([-1, 1, 1]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledWith(1);
});

test('does not send unsubscribe when complete has been received', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  const result = client.call('test', {foo: 'bar'});
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe(next, error, complete);
  await new Promise((r) => setTimeout(r, 20));
  expect(send).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledTimes(0);
  client.onMessage([0, send.mock.calls[0][0][0], 1]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(1);
});

test('does not send unsubscribe when complete has been received - 2', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable = client.call('test', {foo: 'bar'});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const promise = observable.pipe(take(1)).toPromise();
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  client.onMessage([0, send.mock.calls[0][0][0], 25]);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const result = await promise;
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(result).toBe(25);
});

test('does not send unsubscribe when error has been received', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable = client.call('test', {foo: 'bar'});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const promise = observable.pipe(take(1)).toPromise();
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  client.onMessage([-1, send.mock.calls[0][0][0], 25]);
  expect(send).toHaveBeenCalledTimes(1);
  let error;
  try {
    await promise;
  } catch (err) {
    error = err;
  }
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(error).toBe(25);
});

test('after .stop() completes subscriptions', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable = client.call('test', {});
  const data = jest.fn();
  observable.subscribe(data);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(data).toHaveBeenCalledTimes(0);
  client.onMessage([-2, 1, 1]);
  expect(data).toHaveBeenCalledTimes(1);
  client.onMessage([-2, 1, 2]);
  expect(data).toHaveBeenCalledTimes(2);
  client.stop();
  client.onMessage([-2, 1, 3]);
  expect(data).toHaveBeenCalledTimes(2);
});

test('combines multiple messages in a batch', async () => {
  const send = jest.fn();
  const client = new JsonRxClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable1 = client.call('test', {});
  const observable2 = client.call('test2', {foo: 'bar'});
  client.notify('test3', {gg: 'bet'});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([
    [1, 'test', {}],
    [2, 'test2', {foo: 'bar'}],
    ['test3', {gg: 'bet'}],
  ]);
});
