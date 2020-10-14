import {JsonRxServer} from '../JsonRxServer';
import {of, from, Subject, Observable, Subscriber} from 'rxjs';
import { Defer } from './util';

test('can create server', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
});

test('does not execute any methods on initialization', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  expect(send).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('executes notification callback on notification message', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  server.onMessage(['test', {foo: 'bar'}], undefined);
  expect(send).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledWith('test', {foo: 'bar'}, undefined);
});

test('can receive multiple notifications', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  server.onMessage(['1', 1], undefined);
  server.onMessage(['2', 2], undefined);
  server.onMessage(['3', 3], undefined);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(3);
  expect(notify).toHaveBeenCalledWith('1', 1, undefined);
  expect(notify).toHaveBeenCalledWith('2', 2, undefined);
  expect(notify).toHaveBeenCalledWith('3', 3, undefined);
});

test('throws on empty notification name', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  expect(() => server.onMessage(['', 1], undefined)).toThrowErrorMatchingInlineSnapshot(`"Invalid method."`);
});

test('throws when notification name longer than 128 chars', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  const name =
    '012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678';
  expect(() => server.onMessage([name, 1], undefined)).toThrowErrorMatchingInlineSnapshot(`"Invalid method."`);
});

test('throws when "notify" callback throws', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn(() => {
    throw new Error('test');
  });
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  const name = 'aga';
  expect(() => server.onMessage([name, 1], undefined)).toThrowErrorMatchingInlineSnapshot(`"test"`);
});

test('if "call" callback throws, sends back error message', async () => {
  const send = jest.fn();
  const call = jest.fn(() => {
    throw new Error('gg');
  });
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([1, 'a', 'b'], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toMatchInlineSnapshot(`
    Array [
      -1,
      1,
      Object {
        "message": "gg",
      },
    ]
  `);
  expect(call).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('sends complete message if observable immediately completes after emitting one value', async () => {
  const send = jest.fn();
  const call = jest.fn(() => of('go go'));
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  server.onMessage([25, 'method'], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('method', undefined, undefined);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith([0, 25, 'go go']);
});

test('when observable completes synchronously, sends payload in complete message', async () => {
  const send = jest.fn();
  const call = jest.fn(() => from([1, 2, 3]));
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  server.onMessage([123, 'foo', 0], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('foo', 0, undefined);
  expect(send).toHaveBeenCalledTimes(3);
  expect(send.mock.calls[0][0]).toEqual([-2, 123, 1]);
  expect(send.mock.calls[1][0]).toEqual([-2, 123, 2]);
  expect(send.mock.calls[2][0]).toEqual([0, 123, 3]);
});

test('when observable completes asynchronously, sends empty complete message', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn(() => subject);
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  server.onMessage([123, 'foo', 0], undefined);
  subject.next(1);
  subject.next(2);
  subject.next(3);
  await new Promise((r) => setTimeout(r, 1));
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('foo', 0, undefined);
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual([-2, 123, 1]);
  expect(send.mock.calls[1][0]).toEqual([-2, 123, 2]);
  expect(send.mock.calls[2][0]).toEqual([-2, 123, 3]);
  expect(send.mock.calls[3][0]).toEqual([0, 123]);
});

test('when observable completes asynchronously and emits asynchronously, sends empty complete message', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn(() => subject);
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  server.onMessage([123, 'foo', 0], undefined);
  subject.next(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  subject.next(2);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(2);
  subject.next(3);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(3);
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('foo', 0, undefined);
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual([-2, 123, 1]);
  expect(send.mock.calls[1][0]).toEqual([-2, 123, 2]);
  expect(send.mock.calls[2][0]).toEqual([-2, 123, 3]);
  expect(send.mock.calls[3][0]).toEqual([0, 123]);
});

test('sends error when subscription limit is exceeded', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn(() => subject);
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, maxActiveSubscriptions: 5, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([1, '1', 1], undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([2, '2', 2], undefined);
  expect(call).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([3, '3', 3], undefined);
  expect(call).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([4, '4', 4], undefined);
  expect(call).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([5, '5', 5], undefined);
  expect(call).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([6, '6', 6], undefined);
  expect(call).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Array [
        -1,
        6,
        Object {
          "message": "Too many subscriptions.",
        },
      ],
    ]
  `);
});

test('subscription counter goes down on unsubscribe', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn(() => subject);
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, maxActiveSubscriptions: 5, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([1, '1', 1], undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([2, '2', 2], undefined);
  expect(call).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([3, '3', 3], undefined);
  expect(call).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([4, '4', 4], undefined);
  expect(call).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([5, '5', 5], undefined);
  server.onMessage([-3, 5], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([6, '6', 6], undefined);
  expect(call).toHaveBeenCalledTimes(6);
  expect(send).toHaveBeenCalledTimes(0);
});

test('call can return a promise', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn(async () => ({foo: 'bar'}));
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  server.onMessage([3, 'gg', 123], undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([0, 3, {foo: 'bar'}]);
});

test('sends error message if promise throws', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn(async () => {
    throw new Error('asdf');
  });
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  server.onMessage([3, 'gg', 123], undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([-1, 3, {message: 'asdf'}]);
});

test('sends error message if promise throws arbitrary payload', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn(async () => {
    throw 666;
  });
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  server.onMessage([3, 'gg', 123], undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([-1, 3, 666]);
});

test('can create custom API from promises and observables', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn((method, payload) => {
    if (method === 'echo') return Promise.resolve(payload);
    else if (method === 'double') return of(2 * payload);
    throw new Error(`Unknown method [${method}].`);
  });
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  await new Promise((r) => setTimeout(r, 1));
  server.onMessage([1, 'echo', 'hello'], undefined);
  await new Promise((r) => setTimeout(r, 1));
  server.onMessage([2, 'double', 1], undefined);
  await new Promise((r) => setTimeout(r, 1));
  server.onMessage([3, 'double', -5], undefined);
  await new Promise((r) => setTimeout(r, 1));
  server.onMessage([4, 'drop_table', {}], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledWith([0, 1, 'hello']);
  expect(send).toHaveBeenCalledWith([0, 2, 2]);
  expect(send).toHaveBeenCalledWith([0, 3, -10]);
  expect(send).toHaveBeenCalledWith([-1, 4, {message: `Unknown method [drop_table].`}]);
});

test('can add authentication on as higher level API', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const ctx = {password: ''};
  const call = jest.fn((method, payload) => {
    if (ctx.password !== 'hello hello') throw new Error('UNAUTHENTICATED');
    if (method === 'double') return of(2 * payload);
    throw new Error(`Unknown method [${method}].`);
  });
  const notify = (method: any, payload: any) => {
    if (method === 'auth') ctx.password = payload;
  };
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  server.onMessage([2, 'double', 1], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith([-1, 2, {message: 'UNAUTHENTICATED'}]);
  server.onMessage(['auth', 'hello hello'], undefined);
  server.onMessage([3, 'double', 1], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledWith([0, 3, 2]);
});

test('subscription can return observable in a promise', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const ctx = {password: ''};
  const call = jest.fn(async (method, payload) => from([1, 2, 3]));
  const notify = (method: any, payload: any) => {};
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([1, 'something'], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledWith([-2, 1, 1]);
  expect(send).toHaveBeenCalledWith([-2, 1, 2]);
  expect(send).toHaveBeenCalledWith([0, 1, 3]);
});

test('enforces maximum number of active subscriptions', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const ctx = {password: ''};
  const call = jest.fn(() => new Promise(r => setTimeout(() => r(0), 20)));
  const notify = (method: any, payload: any) => {};
  const server = new JsonRxServer({send, call, notify, maxActiveSubscriptions: 3, bufferTime: 0});
  server.onMessage([1, "test"], undefined);
  server.onMessage([2, "test"], undefined);
  server.onMessage([3, "test"], undefined);
  await new Promise(r => setTimeout(r, 5));
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([4, "test"], undefined);
  await new Promise(r => setTimeout(r, 5));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith([-1, 4, {message: 'Too many subscriptions.'}]);
  await new Promise(r => setTimeout(r, 30));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledWith([0, 1, 0]);
  expect(send).toHaveBeenCalledWith([0, 2, 0]);
  expect(send).toHaveBeenCalledWith([0, 3, 0]);
});

test('enforces maximum number of active subscriptions', async () => {
  const send = jest.fn();
  const call = jest.fn(() => new Promise(r => setTimeout(() => r(0), 20)));
  const notify = (method: any, payload: any) => {};
  const server = new JsonRxServer({send, call, notify, maxActiveSubscriptions: 3, bufferTime: 0});
  server.onMessage([1, "test"], undefined);
  server.onMessage([2, "test"], undefined);
  server.onMessage([3, "test"], undefined);
  await new Promise(r => setTimeout(r, 5));
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([4, "test"], undefined);
  await new Promise(r => setTimeout(r, 5));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith([-1, 4, {message: 'Too many subscriptions.'}]);
  await new Promise(r => setTimeout(r, 30));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledWith([0, 1, 0]);
  expect(send).toHaveBeenCalledWith([0, 2, 0]);
  expect(send).toHaveBeenCalledWith([0, 3, 0]);
});

test('resets subscription count when subscriptions complete', async () => {
  const send = jest.fn();
  const d1 = new Defer<null>();
  const d2 = new Defer<null>();
  const d3 = new Defer<null>();
  const d = [d1, d2, d3];
  const call = jest.fn(() => d.shift()!.promise);
  const server = new JsonRxServer({send, call, notify: () => {}, maxActiveSubscriptions: 1, bufferTime: 0});
  server.onMessage([1, 'foo'], undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(0);
  d1.resolve(null);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith([0, 1, null]);
  server.onMessage([2, 'foo'], undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  server.onMessage([3, 'foo'], undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledWith([-1, 3, {message: 'Too many subscriptions.'}]);
  d2.reject(123);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledWith([-1, 2, 123]);
  server.onMessage([4, 'foo'], undefined);
  await new Promise(r => setTimeout(r, 1));
  d3.resolve(null);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledWith([0, 4, null]);
});

test('sends error on subscription with already active ID', async () => {
  const send = jest.fn();
  const call = jest.fn(() => new Promise(r => setTimeout(() => r(1), 10)));
  const server = new JsonRxServer({send, call, notify: () => {}, bufferTime: 0});
  server.onMessage([1, 'foo'], undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage([1, 'bar'], undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith([-1, 1, {message: 'ID already active.'}]);
  await new Promise(r => setTimeout(r, 20));
  expect(send).toHaveBeenCalledTimes(1);
});

test('can pass through context object to subscription', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const server = new JsonRxServer({send, call, notify: () => {}, bufferTime: 0});
  server.onMessage([1, 'foo'], {foo: 'bar'});
  await new Promise(r => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('foo', undefined, {foo: 'bar'});
});

test('can pass through context object to notification', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  server.onMessage(['foo'], {foo: 'bar'});
  await new Promise(r => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledWith('foo', undefined, {foo: 'bar'});
});

test('stops sending messages after server stop()', async () => {
  const send = jest.fn();
  let sub: Subscriber<any>;
  const call = jest.fn(() => new Observable(subscriber => {
    sub = subscriber;
  }));
  const notify = jest.fn();
  const server = new JsonRxServer({send, call, notify, bufferTime: 0});
  expect(!!sub!).toBe(false);
  server.onMessage([1, 'foo'], undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(0);
  expect(!!sub!).toBe(true);
  sub!.next(1);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  server.stop();
  sub!.next(2);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  server.onMessage([1, 'foo'], undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
});

describe('buffering', () => {
  test('batches messages received within buffering window', async () => {
    const send = jest.fn();
    const call = jest.fn(async (name, payload, ctx) => [name, payload, ctx]);
    const notify = jest.fn();
    const server = new JsonRxServer({send, call, notify, bufferTime: 1});
    server.onMessage([1, 'a', 'a'], {ctx: 1});
    server.onMessage([2, 'b', 'b'], {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual([
      [0, 1, ['a', 'a', {ctx: 1}]],
      [0, 2, ['b', 'b', {ctx: 2}]],
    ]);
  });

  test('does not batch consecutive messages when buffering is disabled', async () => {
    const send = jest.fn();
    const call = jest.fn(async (name, payload, ctx) => [name, payload, ctx]);
    const notify = jest.fn();
    const server = new JsonRxServer({send, call, notify, bufferTime: 0});
    server.onMessage([1, 'a', 'a'], {ctx: 1});
    server.onMessage([2, 'b', 'b'], {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual([0, 1, ['a', 'a', {ctx: 1}]]);
    expect(send.mock.calls[1][0]).toEqual([0, 2, ['b', 'b', {ctx: 2}]]);
  });

  test('does not batch messages when they are far apart', async () => {
    const send = jest.fn();
    const call = jest.fn(async (name, payload, ctx) => [name, payload, ctx]);
    const notify = jest.fn();
    const server = new JsonRxServer({send, call, notify, bufferTime: 1});
    server.onMessage([1, 'a', 'a'], {ctx: 1});
    await new Promise(r => setTimeout(r, 10));
    server.onMessage([2, 'b', 'b'], {ctx: 2});
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual([0, 1, ['a', 'a', {ctx: 1}]]);
    expect(send.mock.calls[1][0]).toEqual([0, 2, ['b', 'b', {ctx: 2}]]);
  });

  test('batches and sends out messages when buffer is filled up', async () => {
    const send = jest.fn();
    const call = jest.fn(async (name, payload, ctx) => [name, payload, ctx]);
    const notify = jest.fn();
    const server = new JsonRxServer({send, call, notify, bufferTime: 1, bufferSize: 2});
    server.onMessage([1, 'a', 'a'], {ctx: 1});
    server.onMessage([2, 'b', 'b'], {ctx: 2});
    await new Promise(r => setImmediate(r));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual([
      [0, 1, ['a', 'a', {ctx: 1}]],
      [0, 2, ['b', 'b', {ctx: 2}]],
    ]);
  });
});
