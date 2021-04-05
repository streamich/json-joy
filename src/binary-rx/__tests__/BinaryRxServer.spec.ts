import {BinaryRxServer, BinaryRxServerError} from '../BinaryRxServer';
import {of, from, Subject, Observable, Subscriber} from 'rxjs';
import {decodeCompleteMessage, decodeCompleteMessages, Encoder} from '../codec';
import {CompleteMessage, DataMessage, ErrorMessage, NotificationMessage, SubscribeMessage, UnsubscribeMessage} from '../messages';
import {Defer} from '../../json-rx/__tests__/util';

const encoder = new Encoder();

test('can create server', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
});

test('does not execute any methods on initialization', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  expect(send).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('executes notification callback on notification message', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  const arr = encoder.encode([new NotificationMessage('test', new Uint8Array([1, 2, 3]))]);
  server.onArray(arr, {});
  expect(send).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledWith('test', new Uint8Array([1, 2, 3]), {});
});

test('can receive multiple notifications', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  server.onMessages([new NotificationMessage('1', new Uint8Array([1]))], undefined);
  server.onMessages([new NotificationMessage('2', new Uint8Array([2]))], undefined);
  server.onMessages([new NotificationMessage('3', new Uint8Array([3]))], undefined);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(3);
  expect(notify).toHaveBeenCalledWith('1', new Uint8Array([1]), undefined);
  expect(notify).toHaveBeenCalledWith('2', new Uint8Array([2]), undefined);
  expect(notify).toHaveBeenCalledWith('3', new Uint8Array([3]), undefined);
});

test('throws on empty notification name', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  expect(() =>
    server.onMessages([new NotificationMessage('', new Uint8Array([1]))], undefined),
  ).toThrowErrorMatchingInlineSnapshot(`"Invalid method."`);
});

test('throws when notification name longer than 128 chars', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  const name =
    '012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678';
  expect(() =>
    server.onMessages([new NotificationMessage(name, new Uint8Array([1]))], undefined),
  ).toThrowErrorMatchingInlineSnapshot(`"Invalid method."`);
});

test('throws when "notify" callback throws', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn(() => {
    throw new Error('test');
  });
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  const name = 'aga';
  expect(() =>
    server.onMessages([new NotificationMessage(name, new Uint8Array([1]))], undefined),
  ).toThrowErrorMatchingInlineSnapshot(`"test"`);
});

test('if "call" callback throws, sends back error message', async () => {
  const send = jest.fn();
  const call = jest.fn(() => {
    throw new Error('gg');
  });
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  expect(send).toHaveBeenCalledTimes(0);
  const message = new SubscribeMessage(1, 'a', new Uint8Array([2]));
  server.onMessages([message], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new ErrorMessage(1, new Uint8Array([0]))]));
  expect(call).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('sends complete message if observable immediately completes after emitting one value', async () => {
  const send = jest.fn();
  const call = (jest.fn(() => of(Buffer.from('"go go"'))) as any) as (
    name: string,
    payload: unknown,
    ctx: any,
  ) => Observable<Uint8Array>;
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  server.onMessages([new SubscribeMessage(25, 'method', undefined)], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('method', undefined, undefined);
  expect(send).toHaveBeenCalledTimes(1);
  const arr = send.mock.calls[0][0];
  const msg = decodeCompleteMessage(arr, 0)[0] as CompleteMessage;
  expect(msg).toBeInstanceOf(CompleteMessage);
  expect(msg.id).toBe(25);
  expect(Buffer.from(msg.data!).toString()).toBe('"go go"');
});

test('when observable completes synchronously, sends payload in complete message', async () => {
  const send = jest.fn();
  const call = jest.fn(() => from([
    new Uint8Array([1]),
    new Uint8Array([2]),
    new Uint8Array([3]),
  ])) as any;
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  server.onMessages([new SubscribeMessage(123, 'foo', new Uint8Array([0]))], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('foo', new Uint8Array([0]), undefined);
  expect(send).toHaveBeenCalledTimes(3);
  expect(decodeCompleteMessage(send.mock.calls[0][0], 0)[0]).toEqual(new DataMessage(123, new Uint8Array([1])));
  expect(decodeCompleteMessage(send.mock.calls[0][0], 0)[0]).toBeInstanceOf(DataMessage);
  expect(decodeCompleteMessage(send.mock.calls[1][0], 0)[0]).toEqual(new DataMessage(123, new Uint8Array([2])));
  expect(decodeCompleteMessage(send.mock.calls[1][0], 0)[0]).toBeInstanceOf(DataMessage);
  expect(decodeCompleteMessage(send.mock.calls[2][0], 0)[0]).toEqual(new CompleteMessage(123, new Uint8Array([3])));
  expect(decodeCompleteMessage(send.mock.calls[2][0], 0)[0]).toBeInstanceOf(CompleteMessage);
});

test('when observable completes asynchronously, sends empty complete message', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call: any = jest.fn(() => subject);
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  server.onMessages([new SubscribeMessage(123, 'foo', new Uint8Array([0]))], undefined);
  subject.next(new Uint8Array([1]));
  subject.next(new Uint8Array([2]));
  subject.next(new Uint8Array([3]));
  await new Promise((r) => setTimeout(r, 1));
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('foo', new Uint8Array([0]), undefined);
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new DataMessage(123, new Uint8Array([1]))]));
  expect(send.mock.calls[1][0]).toEqual(encoder.encode([new DataMessage(123, new Uint8Array([2]))]));
  expect(send.mock.calls[2][0]).toEqual(encoder.encode([new DataMessage(123, new Uint8Array([3]))]));
  expect(send.mock.calls[3][0]).toEqual(encoder.encode([new CompleteMessage(123, undefined)]));
});

test('when observable completes asynchronously and emits asynchronously, sends empty complete message', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call: any = jest.fn(() => subject);
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  server.onMessages([new SubscribeMessage(123, 'foo', new Uint8Array([0]))], undefined);
  subject.next(new Uint8Array([1]));
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  subject.next(new Uint8Array([2]));
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(2);
  subject.next(new Uint8Array([3]));
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(3);
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call).toHaveBeenCalledWith('foo', new Uint8Array([0]), undefined);
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new DataMessage(123, new Uint8Array([1]))]));
  expect(send.mock.calls[1][0]).toEqual(encoder.encode([new DataMessage(123, new Uint8Array([2]))]));
  expect(send.mock.calls[2][0]).toEqual(encoder.encode([new DataMessage(123, new Uint8Array([3]))]));
  expect(send.mock.calls[3][0]).toEqual(encoder.encode([new CompleteMessage(123, undefined)]));
});

test('sends error when subscription limit is exceeded', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call: any = jest.fn(() => subject);
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, maxActiveSubscriptions: 5, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(1, '1', new Uint8Array([1]))], undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(2, '2', new Uint8Array([2]))], undefined);
  expect(call).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(3, '3', new Uint8Array([3]))], undefined);
  expect(call).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(4, '4', new Uint8Array([4]))], undefined);
  expect(call).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(5, '5', new Uint8Array([5]))], undefined);
  expect(call).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(6, '6', new Uint8Array([6]))], undefined);
  expect(call).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new ErrorMessage(6, new Uint8Array([BinaryRxServerError.TooManySubscriptions]))]));
});

test('subscription counter goes down on unsubscribe', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call: any = jest.fn(() => subject);
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, maxActiveSubscriptions: 5, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(1, '1', new Uint8Array([1]))], undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(2, '2', new Uint8Array([2]))], undefined);
  expect(call).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(3, '3', new Uint8Array([3]))], undefined);
  expect(call).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(4, '4', new Uint8Array([4]))], undefined);
  expect(call).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(5, '5', new Uint8Array([5]))], undefined);
  server.onMessages([new UnsubscribeMessage(5)], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new SubscribeMessage(6, '6', new Uint8Array([6]))], undefined);
  expect(call).toHaveBeenCalledTimes(6);
  expect(send).toHaveBeenCalledTimes(0);
});

test('call can return a promise', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call: any = jest.fn(async () => Buffer.from("{foo: 'bar'}"));
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  server.onArray(encoder.encode([
    new SubscribeMessage(3, 'gg', new Uint8Array([1, 2, 3]))
  ]), undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new CompleteMessage(3, Buffer.from("{foo: 'bar'}"))]));
});

test('sends error message if promise throws', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn(async () => {
    throw Buffer.from('asdf');
  });
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  server.onArray(encoder.encode([
    new SubscribeMessage(3, 'gg', new Uint8Array([1, 2, 3]))
  ]), undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  // expect(send.mock.calls[0][0]).toEqual(encoder.encode([new ErrorMessage(3, Buffer.from("asdf"))]));
});

test('sends error message if promise throws arbitrary payload', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call = jest.fn(async () => {
    throw 666;
  });
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  expect(call).toHaveBeenCalledTimes(0);
  server.onArray(encoder.encode([
    new SubscribeMessage(3, 'gg', new Uint8Array([1, 2, 3]))
  ]), undefined);
  expect(call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new ErrorMessage(3, new Uint8Array([BinaryRxServerError.Unknown]))]));
});

test('can create custom API from promises and observables', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const call: any = jest.fn((method, payload) => {
    if (method === 'echo') return Promise.resolve(payload);
    else if (method === 'double') return of(new Uint8Array([2 * payload[0]]));
    throw Buffer.from(`Unknown method [${method}].`);
  });
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  await new Promise((r) => setTimeout(r, 1));
  server.onArray(encoder.encode([
    new SubscribeMessage(1, 'echo', Buffer.from('hello'))
  ]), undefined);
  await new Promise((r) => setTimeout(r, 1));
  server.onArray(encoder.encode([
    new SubscribeMessage(2, 'double', new Uint8Array([1]))
  ]), undefined);
  await new Promise((r) => setTimeout(r, 1));
  server.onArray(encoder.encode([
    new SubscribeMessage(3, 'double', new Uint8Array([10]))
  ]), undefined);
  await new Promise((r) => setTimeout(r, 1));
  server.onArray(encoder.encode([
    new SubscribeMessage(4, 'drop_table', new Uint8Array([]))
  ]), undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new CompleteMessage(1, Buffer.from('hello'))]));
  expect(send.mock.calls[1][0]).toEqual(encoder.encode([new CompleteMessage(2, new Uint8Array([2]))]));
  expect(send.mock.calls[2][0]).toEqual(encoder.encode([new CompleteMessage(3, new Uint8Array([20]))]));
  expect(send.mock.calls[3][0]).toEqual(encoder.encode([new ErrorMessage(4, Buffer.from('Unknown method [drop_table].'))]));
});

test('can add authentication on as higher level API', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const ctx = {password: ''};
  const call: any = jest.fn((method, payload) => {
    if (ctx.password !== 'hello hello') throw Buffer.from('UNAUTHENTICATED');
    if (method === 'double') return of(new Uint8Array([2 * payload]));
    throw Buffer.from(`Unknown method [${method}].`);
  });
  const notify = (method: string, payload: Uint8Array | undefined, cc: any): void => {
    if (!payload) return;
    if (method === 'auth') ctx.password = Buffer.from(payload).toString();
  };
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  server.onArray(encoder.encode([
    new SubscribeMessage(2, 'double', Buffer.from([1]))
  ]), undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new ErrorMessage(2, Buffer.from('UNAUTHENTICATED'))]));
  server.onArray(encoder.encode([
    new NotificationMessage('auth', Buffer.from('hello hello'))
  ]), undefined);
  server.onArray(encoder.encode([
    new SubscribeMessage(3, 'double', Buffer.from([1]))
  ]), undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(2);
  expect(send.mock.calls[1][0]).toEqual(encoder.encode([new CompleteMessage(3, Buffer.from([2]))]));
});

test('subscription can return observable in a promise', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const ctx = {password: ''};
  const call: any = jest.fn(async (method, payload) => from([
    new Uint8Array([1]),
    new Uint8Array([2]),
    new Uint8Array([3]),
  ]));
  const notify = (method: any, payload: any) => {};
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  expect(send).toHaveBeenCalledTimes(0);
  server.onArray(encoder.encode([
    new SubscribeMessage(1, 'something', undefined)
  ]), undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(3);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new DataMessage(1, Buffer.from([1]))]));
  expect(send.mock.calls[1][0]).toEqual(encoder.encode([new DataMessage(1, Buffer.from([2]))]));
  expect(send.mock.calls[2][0]).toEqual(encoder.encode([new CompleteMessage(1, Buffer.from([3]))]));
});

test('enforces maximum number of active subscriptions', async () => {
  const send = jest.fn();
  const subject = new Subject<unknown>();
  const ctx = {password: ''};
  const call: any = jest.fn(() => new Promise(r => setTimeout(() => r(new Uint8Array([0])), 20)));
  const notify = (method: any, payload: any) => {};
  const server = new BinaryRxServer({send, call, notify, maxActiveSubscriptions: 3, bufferTime: 0});
  server.onArray(encoder.encode([
    new SubscribeMessage(1, 'test', undefined),
  ]), undefined);
  server.onArray(encoder.encode([
    new SubscribeMessage(2, 'test', undefined),
  ]), undefined);
  server.onArray(encoder.encode([
    new SubscribeMessage(3, 'test', undefined),
  ]), undefined);
  await new Promise(r => setTimeout(r, 5));
  expect(send).toHaveBeenCalledTimes(0);
  server.onArray(encoder.encode([
    new SubscribeMessage(4, 'test', undefined),
  ]), undefined);
  await new Promise(r => setTimeout(r, 5));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new ErrorMessage(4, Buffer.from([BinaryRxServerError.TooManySubscriptions]))]));
  await new Promise(r => setTimeout(r, 30));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[1][0]).toEqual(encoder.encode([new CompleteMessage(1, Buffer.from([0]))]));
  expect(send.mock.calls[2][0]).toEqual(encoder.encode([new CompleteMessage(2, Buffer.from([0]))]));
  expect(send.mock.calls[3][0]).toEqual(encoder.encode([new CompleteMessage(3, Buffer.from([0]))]));
});

test('resets subscription count when subscriptions complete', async () => {
  const send = jest.fn();
  const d1 = new Defer<Buffer>();
  const d2 = new Defer<Buffer>();
  const d3 = new Defer<Buffer>();
  const d = [d1, d2, d3];
  const call: any = jest.fn(() => d.shift()!.promise);
  const server = new BinaryRxServer({send, call, notify: () => {}, maxActiveSubscriptions: 1, bufferTime: 0});
  server.onArray(encoder.encode([
    new SubscribeMessage(1, 'foo', undefined),
  ]), undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(0);
  d1.resolve(Buffer.from('null'));
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new CompleteMessage(1, Buffer.from('null'))]));
  server.onArray(encoder.encode([
    new SubscribeMessage(2, 'foo', undefined),
  ]), undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  server.onArray(encoder.encode([
    new SubscribeMessage(3, 'foo', undefined),
  ]), undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(2);
  expect(send.mock.calls[1][0]).toEqual(encoder.encode([new ErrorMessage(3, new Uint8Array([BinaryRxServerError.TooManySubscriptions]))]));
  d2.reject(new Uint8Array([123]));
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(3);
  expect(send.mock.calls[2][0]).toEqual(encoder.encode([new ErrorMessage(2, new Uint8Array([123]))]));
  server.onArray(encoder.encode([
    new SubscribeMessage(4, 'foo', undefined),
  ]), undefined);
  await new Promise(r => setTimeout(r, 1));
  d3.resolve(Buffer.from('null'));
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[3][0]).toEqual(encoder.encode([new CompleteMessage(4, Buffer.from('null'))]));
});

test('sends error on subscription with already active ID', async () => {
  const send = jest.fn();
  const call: any = jest.fn(() => new Promise(r => setTimeout(() => r(1), 10)));
  const server = new BinaryRxServer({send, call, notify: () => {}, bufferTime: 0});
  server.onArray(encoder.encode([
    new SubscribeMessage(1, 'foo', undefined),
  ]), undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(0);
  server.onArray(encoder.encode([
    new SubscribeMessage(1, 'bar', undefined),
  ]), undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(encoder.encode([new ErrorMessage(1, new Uint8Array([BinaryRxServerError.IdTaken]))]));
  await new Promise(r => setTimeout(r, 20));
  expect(send).toHaveBeenCalledTimes(1);
});

test('can pass through context object to subscription', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const server = new BinaryRxServer({send, call, notify: () => {}, bufferTime: 0});
  server.onArray(encoder.encode([
    new SubscribeMessage(1, 'foo', undefined),
  ]), {foo: 'bar'});
  await new Promise(r => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(1);
  expect(call.mock.calls[0][0]).toBe('foo');
  expect(Buffer.from(call.mock.calls[0][1]).toString()).toBe("");
  expect(call.mock.calls[0][2]).toEqual({foo: 'bar'});
});

test('can pass through context object to notification', async () => {
  const send = jest.fn();
  const call = jest.fn();
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  server.onArray(encoder.encode([
    new NotificationMessage('foo', undefined),
  ]), {foo: 'bar'});
  await new Promise(r => setTimeout(r, 1));
  expect(call).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify.mock.calls[0][0]).toBe('foo');
  expect(Buffer.from(notify.mock.calls[0][1]).toString()).toBe("");
  expect(notify.mock.calls[0][2]).toEqual({foo: 'bar'});
});

test('stops sending messages after server stop()', async () => {
  const send = jest.fn();
  let sub: Subscriber<any>;
  const call: any = jest.fn(() => new Observable(subscriber => {
    sub = subscriber;
  }));
  const notify = jest.fn();
  const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
  expect(!!sub!).toBe(false);
  server.onArray(encoder.encode([
    new SubscribeMessage(1, 'foo', undefined),
  ]), undefined);
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
  server.onArray(encoder.encode([
    new SubscribeMessage(1, 'foo', undefined),
  ]), undefined);
  await new Promise(r => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
});

describe('buffering', () => {
  test('batches messages received within buffering window', async () => {
    const send = jest.fn();
    const call: any = jest.fn(async (name, payload, ctx) => Buffer.from(JSON.stringify([name, payload[0], ctx])));
    const notify = jest.fn();
    const server = new BinaryRxServer({send, call, notify, bufferTime: 1});
    server.onArray(encoder.encode([
      new SubscribeMessage(1, 'a', Buffer.from('a')),
    ]), {ctx: 1});
    server.onArray(encoder.encode([
      new SubscribeMessage(2, 'b', Buffer.from('b')),
    ]), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual(encoder.encode([
      new CompleteMessage(1, Buffer.from(JSON.stringify(['a', Buffer.from('a')[0], {ctx: 1}]))),
      new CompleteMessage(2, Buffer.from(JSON.stringify(['b', Buffer.from('b')[0], {ctx: 2}]))),
    ]));
  });

  test('batches errors received within buffering window', async () => {
    const send = jest.fn();
    const call: any = jest.fn(async (name, payload, ctx) => {
      // tslint:disable-next-line
      throw Buffer.from('foo');
    });
    const notify = jest.fn();
    const server = new BinaryRxServer({send, call, notify, bufferTime: 1});
    server.onArray(encoder.encode([
      new SubscribeMessage(1, 'a', Buffer.from('a')),
    ]), {ctx: 1});
    server.onArray(encoder.encode([
      new SubscribeMessage(2, 'b', Buffer.from('b')),
    ]), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual(encoder.encode([
      new ErrorMessage(1, Buffer.from('foo')),
      new ErrorMessage(2, Buffer.from('foo')),
    ]));
  });

  test('does not batch consecutive messages when buffering is disabled', async () => {
    const send = jest.fn();
    const call: any = jest.fn(async (name, payload, ctx) => Buffer.from(JSON.stringify([name, payload[0], ctx])));
    const notify = jest.fn();
    const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
    server.onArray(encoder.encode([
      new SubscribeMessage(1, 'a', Buffer.from('a')),
    ]), {ctx: 1});
    server.onArray(encoder.encode([
      new SubscribeMessage(2, 'b', Buffer.from('b')),
    ]), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual(encoder.encode([
      new CompleteMessage(1, Buffer.from(JSON.stringify(['a', Buffer.from('a')[0], {ctx: 1}]))),
    ]));
    expect(send.mock.calls[1][0]).toEqual(encoder.encode([
      new CompleteMessage(2, Buffer.from(JSON.stringify(['b', Buffer.from('b')[0], {ctx: 2}]))),
    ]));
  });

  test('does not batch messages when they are far apart', async () => {
    const send = jest.fn();
    const call: any = jest.fn(async (name, payload, ctx) => Buffer.from(JSON.stringify([name, payload[0], ctx])));
    const notify = jest.fn();
    const server = new BinaryRxServer({send, call, notify, bufferTime: 1});
    server.onArray(encoder.encode([
      new SubscribeMessage(1, 'a', Buffer.from('a')),
    ]), {ctx: 1});
    await new Promise(r => setTimeout(r, 10));
    server.onArray(encoder.encode([
      new SubscribeMessage(2, 'b', Buffer.from('b')),
    ]), {ctx: 2});
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual(encoder.encode([
      new CompleteMessage(1, Buffer.from(JSON.stringify(['a', Buffer.from('a')[0], {ctx: 1}]))),
    ]));
    expect(send.mock.calls[1][0]).toEqual(encoder.encode([
      new CompleteMessage(2, Buffer.from(JSON.stringify(['b', Buffer.from('b')[0], {ctx: 2}]))),
    ]));
  });

  test('batches and sends out messages when buffer is filled up', async () => {
    const send = jest.fn();
    const call: any = jest.fn(async (name, payload, ctx) => Buffer.from(JSON.stringify([name, payload[0], ctx])));
    const notify = jest.fn();
    const server = new BinaryRxServer({send, call, notify, bufferTime: 1, bufferSize: 2});
    server.onArray(encoder.encode([
      new SubscribeMessage(1, 'a', Buffer.from('a')),
    ]), {ctx: 1});
    server.onArray(encoder.encode([
      new SubscribeMessage(2, 'b', Buffer.from('b')),
    ]), {ctx: 2});
    await new Promise(r => setImmediate(r));
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual(encoder.encode([
      new CompleteMessage(1, Buffer.from(JSON.stringify(['a', Buffer.from('a')[0], {ctx: 1}]))),
      new CompleteMessage(2, Buffer.from(JSON.stringify(['b', Buffer.from('b')[0], {ctx: 2}]))),
    ]));
  });
});
