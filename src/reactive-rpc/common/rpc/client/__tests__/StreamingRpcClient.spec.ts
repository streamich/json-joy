import {StreamingRpcClient} from '../StreamingRpcClient';
import {
  NotificationMessage,
  RequestCompleteMessage,
  RequestDataMessage,
  RequestErrorMessage,
  RequestUnsubscribeMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
} from '../../../messages';
import {firstValueFrom, Subject} from 'rxjs';
import {until} from '../../../../../__tests__/util';
import {RpcValue} from '../../../messages/Value';

test('can create client', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
});

test('does not send any messages on initialization', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
});

test('sends notification message on .notify() call', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  client.notify('foo', Buffer.from('bar'));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const value = new RpcValue(Buffer.from('bar'), undefined);
  expect(send).toHaveBeenCalledWith([new NotificationMessage('foo', value)]);
});

test('sends notification with no payload', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  client.notify('foo', undefined);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const value = new RpcValue(undefined, undefined);
  expect(send).toHaveBeenCalledWith([new NotificationMessage('foo', value)]);
});

test('returns Observable on new execution', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(typeof result.subscribe).toBe('function');
});

test('observable does not emit before it receives messages from server', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  const sub = jest.fn();
  result.subscribe(sub);
  await new Promise((r) => setTimeout(r, 2));
  expect(sub).toHaveBeenCalledTimes(0);
});

test('sends Request Complete Message to the server', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const value = new RpcValue(Buffer.from("{foo: 'bar'}"), undefined);
  expect(send).toHaveBeenCalledWith([new RequestCompleteMessage(1, 'test', value)]);
});

test('sends Request Un-subscribe Message to the server on unsubscribe', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  const sub = jest.fn();
  const subscription = result.subscribe(sub);
  await new Promise((r) => setTimeout(r, 2));
  subscription.unsubscribe();
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledWith([new RequestUnsubscribeMessage(1)]);
});

test('server can immediately complete the subscription', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  result.subscribe({next, error, complete});
  await new Promise((r) => setTimeout(r, 2));
  const completeMsg = new ResponseCompleteMessage(1, undefined);
  client.onMessages([completeMsg]);
  await new Promise((r) => setTimeout(r, 2));
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
});

test('server can immediately complete the subscription with payload', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  result.subscribe({next, error, complete});
  await new Promise((r) => setTimeout(r, 20));
  const value = new RpcValue(Buffer.from("{x: 'y'}"), undefined);
  const completeMsg = new ResponseCompleteMessage(1, value);
  client.onMessages([completeMsg]);
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(Buffer.from("{x: 'y'}"));
});

test('server can send multiple values before completing', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  result.subscribe({next, error, complete});
  await new Promise((r) => setTimeout(r, 20));
  const value1 = new RpcValue(Buffer.from("{x: 'y'}"), undefined);
  client.onMessages([new ResponseDataMessage(1, value1)]);
  await new Promise((r) => setTimeout(r, 20));
  const value2 = new RpcValue(Buffer.from("{z: 'a'}"), undefined);
  client.onMessages([new ResponseDataMessage(1, value2)]);
  await new Promise((r) => setTimeout(r, 20));
  const value3 = new RpcValue(Buffer.from("{b: 'c'}"), undefined);
  client.onMessages([new ResponseCompleteMessage(1, value3)]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(3);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(Buffer.from("{x: 'y'}"));
  expect(next).toHaveBeenCalledWith(Buffer.from("{z: 'a'}"));
  expect(next).toHaveBeenCalledWith(Buffer.from("{b: 'c'}"));
});

test('values are not emitted after observable is unsubscribed', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe({next, error, complete});
  await new Promise((r) => setTimeout(r, 20));
  client.onMessages([new ResponseDataMessage(1, new RpcValue(Buffer.from([1]), undefined))]);
  await new Promise((r) => setTimeout(r, 20));
  client.onMessages([new ResponseDataMessage(1, new RpcValue(Buffer.from([2]), undefined))]);
  await new Promise((r) => setTimeout(r, 20));
  subscription.unsubscribe();
  client.onMessages([new ResponseCompleteMessage(1, new RpcValue(Buffer.from([3]), undefined))]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledWith(Buffer.from([1]));
  expect(next).toHaveBeenCalledWith(Buffer.from([2]));
});

test('can subscribe to multiple methods', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});

  const result1 = client.call$('foo', Buffer.from([1]));
  const next1 = jest.fn();
  const error1 = jest.fn();
  const complete1 = jest.fn();
  const subscription1 = result1.subscribe({next: next1, error: error1, complete: complete1});

  await new Promise((r) => setTimeout(r, 2));

  const result2 = client.call$('bar', Buffer.from([2]));
  const next2 = jest.fn();
  const error2 = jest.fn();
  const complete2 = jest.fn();
  const subscription2 = result2.subscribe({next: next2, error: error2, complete: complete2});

  await new Promise((r) => setTimeout(r, 2));

  expect(send).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledWith([new RequestCompleteMessage(1, 'foo', new RpcValue(Buffer.from([1]), undefined))]);
  expect(send).toHaveBeenCalledWith([new RequestCompleteMessage(2, 'bar', new RpcValue(Buffer.from([2]), undefined))]);

  client.onMessages([new ResponseDataMessage(2, new RpcValue(Buffer.from('gg'), undefined))]);
  await new Promise((r) => setTimeout(r, 20));

  expect(next1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledWith(Buffer.from('gg'));

  client.onMessages([new ResponseDataMessage(1, new RpcValue(Buffer.from('lala'), undefined))]);
  await new Promise((r) => setTimeout(r, 20));

  expect(next1).toHaveBeenCalledWith(Buffer.from('lala'));
  expect(next1).toHaveBeenCalledTimes(1);
  expect(next2).toHaveBeenCalledTimes(1);

  client.onMessages([new ResponseCompleteMessage(1, new RpcValue(Buffer.from('1'), undefined))]);
  client.onMessages([new ResponseCompleteMessage(2, undefined)]);

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
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe({next, error, complete});
  await new Promise((r) => setTimeout(r, 20));
  client.onMessages([new ResponseErrorMessage(1, new RpcValue(Buffer.from([1]), undefined))]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledWith(Buffer.from([1]));
});

test('response can complete without sending any data', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe({next, error, complete});
  await new Promise((r) => setTimeout(r, 4));
  client.onMessages([new ResponseCompleteMessage(1, undefined)]);
  await new Promise((r) => setTimeout(r, 3));
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
});

test('does not send unsubscribe when complete has been received', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const result = client.call$('test', Buffer.from("{foo: 'bar'}"));
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = result.subscribe({next, error, complete});
  await new Promise((r) => setTimeout(r, 20));
  expect(send).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledTimes(0);
  client.onMessages([new ResponseCompleteMessage(1, new RpcValue(Buffer.from([1]), undefined))]);
  await new Promise((r) => setTimeout(r, 20));
  expect(next).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(1);
});

test('does not send unsubscribe when complete has been received - 2', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable = client.call$('test', Buffer.from("{foo: 'bar'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const promise = firstValueFrom(observable);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const value = new RpcValue(Buffer.from([25]), undefined);
  client.onMessages([new ResponseCompleteMessage(1, value)]);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const result = await promise;
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(result).toEqual(Buffer.from([25]));
});

test('does not send unsubscribe when error has been received', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable = client.call$('test', Buffer.from("{foo: 'bar'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const promise = firstValueFrom(observable);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const value = new RpcValue(Buffer.from([25]), undefined);
  client.onMessages([new ResponseErrorMessage(1, value)]);
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
  const client = new StreamingRpcClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable = client.call$('test', Buffer.from('{}'));
  const data = jest.fn();
  observable.subscribe(data);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(data).toHaveBeenCalledTimes(0);
  client.onMessages([new ResponseDataMessage(1, new RpcValue(Buffer.from([1]), undefined))]);
  expect(data).toHaveBeenCalledTimes(1);
  client.onMessages([new ResponseDataMessage(1, new RpcValue(Buffer.from([2]), undefined))]);
  expect(data).toHaveBeenCalledTimes(2);
  client.stop();
  client.onMessages([new ResponseDataMessage(1, new RpcValue(Buffer.from([3]), undefined))]);
  expect(data).toHaveBeenCalledTimes(2);
});

test('combines multiple messages in a batch', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable1 = client.call$('test', Buffer.from('{}'));
  const observable2 = client.call$('test2', Buffer.from("{foo: 'bar'}"));
  client.notify('test3', Buffer.from("{gg: 'bet'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  const messages = send.mock.calls[0][0];
  expect(messages[0]).toBeInstanceOf(RequestCompleteMessage);
  expect((messages[0] as any).id).toBe(1);
  expect((messages[0] as any).method).toBe('test');
  expect(messages[1]).toBeInstanceOf(RequestCompleteMessage);
  expect((messages[1] as any).id).toBe(2);
  expect((messages[1] as any).method).toBe('test2');
  expect(messages[2]).toBeInstanceOf(NotificationMessage);
  expect((messages[2] as any).method).toBe('test3');
});

test('can receive and process a batch from server', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  const observable1 = client.call$('test', Buffer.from('{}'));
  const observable2 = client.call$('test2', Buffer.from("{foo: 'bar'}"));
  const data1 = jest.fn();
  const data2 = jest.fn();
  const error1 = jest.fn();
  const error2 = jest.fn();
  const complete1 = jest.fn();
  const complete2 = jest.fn();
  observable1.subscribe({next: data1, error: error1, complete: complete1});
  observable2.subscribe({next: data2, error: error2, complete: complete2});
  client.notify('test3', Buffer.from("{gg: 'bet'}"));
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(1);
  expect(data1).toHaveBeenCalledTimes(0);
  expect(data2).toHaveBeenCalledTimes(0);
  const value1 = new RpcValue(Buffer.from("{foo: 'bar'}"), undefined);
  const value2 = new RpcValue(Buffer.from("{foo: 'baz'}"), undefined);
  client.onMessages([new ResponseCompleteMessage(1, value1), new ResponseCompleteMessage(2, value2)]);
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

test('subscribing twice to call$ does not execute request twice', async () => {
  const send = jest.fn();
  const client = new StreamingRpcClient({send, bufferTime: 1});
  const observable = client.call$('test', {});
  observable.subscribe(() => {});
  observable.subscribe(() => {});
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
});

describe('streaming request', () => {
  test('request payload can be streamed', async () => {
    const send = jest.fn();
    const client = new StreamingRpcClient({send, bufferTime: 1});
    const data$ = new Subject();
    await new Promise((r) => setTimeout(r, 2));
    expect(send).toHaveBeenCalledTimes(0);
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    client.call$('a.b', data$).subscribe({next, error, complete});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(0);
    const value1 = new RpcValue('1', undefined);
    data$.next('1');
    await until(() => send.mock.calls.length === 1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith([new RequestDataMessage(1, 'a.b', value1)]);
    data$.next('1.1');
    await until(() => send.mock.calls.length === 2);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenCalledWith([new RequestDataMessage(1, '', new RpcValue('1.1', undefined))]);
    data$.next('1.1.1');
    data$.complete();
    await until(() => send.mock.calls.length === 3);
    expect(send).toHaveBeenCalledTimes(3);
    expect(send).toHaveBeenCalledWith([new RequestDataMessage(1, '', new RpcValue('1.1.1', undefined))]);
  });

  test('request payload error is sent to server', async () => {
    const send = jest.fn();
    const client = new StreamingRpcClient({send, bufferTime: 1});
    const data$ = new Subject();
    await new Promise((r) => setTimeout(r, 2));
    expect(send).toHaveBeenCalledTimes(0);
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    client.call$('a.b', data$).subscribe({next, error, complete});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(0);
    data$.next('1');
    await until(() => send.mock.calls.length === 1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(RequestDataMessage);
    expect(send).toHaveBeenCalledWith([new RequestDataMessage(1, 'a.b', new RpcValue('1', undefined))]);
    data$.error('1.1');
    await until(() => send.mock.calls.length === 2);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[1][0][0]).toBeInstanceOf(RequestErrorMessage);
    expect(send).toHaveBeenCalledWith([new RequestErrorMessage(1, '', new RpcValue('1.1', undefined))]);
    data$.next('1.1.1');
    expect(send).toHaveBeenCalledTimes(2);
  });

  test('request payload complete is sent to server', async () => {
    const send = jest.fn();
    const client = new StreamingRpcClient({send, bufferTime: 1});
    const data$ = new Subject();
    await new Promise((r) => setTimeout(r, 2));
    expect(send).toHaveBeenCalledTimes(0);
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    client.call$('a.b', data$).subscribe({next, error, complete});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(0);
    data$.next('1');
    await until(() => send.mock.calls.length === 1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(RequestDataMessage);
    expect(send).toHaveBeenCalledWith([new RequestDataMessage(1, 'a.b', new RpcValue('1', undefined))]);
    data$.complete();
    await until(() => send.mock.calls.length === 2);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[1][0][0]).toBeInstanceOf(RequestCompleteMessage);
    expect(send).toHaveBeenCalledWith([new RequestErrorMessage(1, '', new RpcValue(undefined, undefined))]);
    data$.next('1.1.1');
    expect(send).toHaveBeenCalledTimes(2);
  });

  test('can send error as the first request stream message', async () => {
    const send = jest.fn();
    const client = new StreamingRpcClient({send, bufferTime: 1});
    const data$ = new Subject();
    await new Promise((r) => setTimeout(r, 2));
    expect(send).toHaveBeenCalledTimes(0);
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    client.call$('a.b', data$).subscribe({next, error, complete});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(0);
    data$.error({foo: 'bar'});
    await until(() => send.mock.calls.length === 1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(RequestErrorMessage);
    expect(send).toHaveBeenCalledWith([new RequestErrorMessage(1, 'a.b', new RpcValue({foo: 'bar'}, undefined))]);
    data$.complete();
    data$.next('1.1.1');
    await new Promise((r) => setTimeout(r, 4));
    expect(send).toHaveBeenCalledTimes(1);
  });

  test('can send complete as the first request stream message', async () => {
    const send = jest.fn();
    const client = new StreamingRpcClient({send, bufferTime: 1});
    const data$ = new Subject();
    await new Promise((r) => setTimeout(r, 2));
    expect(send).toHaveBeenCalledTimes(0);
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    client.call$('a.b', data$).subscribe({next, error, complete});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(0);
    data$.complete();
    await new Promise((r) => setTimeout(r, 4));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(RequestCompleteMessage);
    expect(send).toHaveBeenCalledWith([new RequestCompleteMessage(1, 'a.b', new RpcValue(undefined, undefined))]);
    data$.complete();
    data$.error(123);
    data$.next('1.1.1');
    await new Promise((r) => setTimeout(r, 4));
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe('memory leaks', () => {
  test('removes calls when request and response complete', async () => {
    const send = jest.fn();
    const client = new StreamingRpcClient({send, bufferTime: 1});
    expect(client.getInflightCallCount()).toBe(0);
    const data$ = new Subject();
    await new Promise((r) => setTimeout(r, 2));
    expect(send).toHaveBeenCalledTimes(0);
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    client.call$('a.b', data$).subscribe({next, error, complete});
    expect(client.getInflightCallCount()).toBe(1);
    data$.complete();
    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(client.getInflightCallCount()).toBe(1);
    client.onMessages([new ResponseCompleteMessage(1, new RpcValue('gaga', undefined))]);
    await new Promise((r) => setTimeout(r, 4));
    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(client.getInflightCallCount()).toBe(0);
  });
});
