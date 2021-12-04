import {RpcServer, RpcServerParams} from '../RpcServer';
import {RpcServerError} from '../constants';
import {of, from, Subject, Observable, Subscriber} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {RpcApiCaller, RpcApiCallerParams} from '../RpcApiCaller';
import {
  NotificationMessage,
  RequestCompleteMessage,
  RequestDataMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
} from '../../messages';
import {Defer} from '../../../../util/Defer';
import {until} from '../../../../__tests__/util';

const setup = (params: Partial<RpcServerParams> = {}, callerParams: Partial<RpcApiCallerParams<any, any>> = {}) => {
  const send = jest.fn();
  const subject = new Subject<any>();
  let token: string = '';
  const notify = jest.fn((method: string, request: unknown) => {
    switch (method) {
      case 'setToken': {
        token = String(request);
        return;
      }
    }
  });
  const ctx = {ip: '127.0.0.1'};
  const caller = new RpcApiCaller<any, any>({
    api: {
      ping: {
        isStreaming: false,
        call: async () => 'pong',
      },
      promise: {
        isStreaming: false,
        call: async () => 'this is promise result',
      },
      promiseError: {
        isStreaming: false,
        call: async () => {
          throw 'this promise can throw';
        },
      },
      promiseDelay: {
        isStreaming: false,
        call: async () => {
          await new Promise((r) => setTimeout(r, 5));
          return {};
        },
      },
      error: {
        isStreaming: false,
        call: async () => {
          throw {message: 'always throws'};
        },
      },
      emitOnceSync: {
        isStreaming: true,
        call$: (ctx: any, request$: any) => {
          const obs = request$.pipe(
            take(1),
            switchMap((request) => {
              return of(JSON.stringify({request, ctx}));
            }),
          );
          return obs;
        },
      },
      emitThreeSync: {
        isStreaming: true,
        call$: (ctx: any, request$: any) => {
          const obs = request$.pipe(
            take(1),
            switchMap((request) => from([new Uint8Array([1]), new Uint8Array([2]), new Uint8Array([3])])),
          );
          return obs;
        },
      },
      subject: {
        isStreaming: true,
        call$: (ctx: any, request$: any) => {
          return subject;
        },
      },
      echo: {
        isStreaming: false,
        call: (ctx: any, payload: any) => Promise.resolve(payload),
      },
      double: {
        isStreaming: true,
        call$: (ctx: any, request$: any) =>
          request$.pipe(
            take(1),
            switchMap((value: any) => of(2 * value)),
          ),
      },
      getToken: {
        isStreaming: false,
        call: async () => token,
      },
      streamDelay: {
        isStreaming: true,
        call$: () =>
          from(
            (async () => {
              await new Promise((r) => setTimeout(r, 5));
              return {};
            })(),
          ),
      },
    },
    ...callerParams,
  });
  const server = new RpcServer<any, any>({
    send,
    onNotification: notify,
    caller,
    bufferTime: 0,
    ...params,
  });
  return {server, send, caller, notify, ctx, subject};
};

test('can create server', async () => {
  setup();
});

test('does not execute any methods on initialization', async () => {
  const {send, caller, notify} = setup();
  jest.spyOn(caller, 'get');
  expect(send).toHaveBeenCalledTimes(0);
  expect(caller.get).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('executes notification callback on notification message', async () => {
  const {server, send, caller, notify, ctx} = setup();
  jest.spyOn(caller, 'get');
  const message = new NotificationMessage('test', new Uint8Array([1, 2, 3]));
  server.onMessages([message], ctx);
  expect(send).toHaveBeenCalledTimes(0);
  expect(caller.get).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledWith('test', new Uint8Array([1, 2, 3]), ctx);
});

test('can receive multiple notifications', async () => {
  const {server, send, caller, notify} = setup();
  jest.spyOn(caller, 'get');
  server.onMessages([new NotificationMessage('1', new Uint8Array([1]))], undefined);
  server.onMessages([new NotificationMessage('2', new Uint8Array([2]))], undefined);
  server.onMessages([new NotificationMessage('3', new Uint8Array([3]))], undefined);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  expect(caller.get).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(3);
  expect(notify).toHaveBeenCalledWith('1', new Uint8Array([1]), undefined);
  expect(notify).toHaveBeenCalledWith('2', new Uint8Array([2]), undefined);
  expect(notify).toHaveBeenCalledWith('3', new Uint8Array([3]), undefined);
});

test('sends error notification on empty notification name', async () => {
  const {server, send} = setup();
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new NotificationMessage('', new Uint8Array([1]))], undefined);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(NotificationMessage);
  expect(send.mock.calls[0][0][0].data).toEqual({
    code: 'InvalidNotificationName',
    errno: RpcServerError.InvalidNotificationName,
    message: 'PROTOCOL',
  });
});

test('sends error notification when notification name longer than 128 chars', async () => {
  const {server, send} = setup();
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages(
    [
      new NotificationMessage(
        '012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678',
        new Uint8Array([1]),
      ),
    ],
    undefined,
  );
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(NotificationMessage);
  expect(send.mock.calls[0][0][0].data).toEqual({
    code: 'InvalidNotificationName',
    errno: RpcServerError.InvalidNotificationName,
    message: 'PROTOCOL',
  });
});

test('sends error notification when "notify" callback throws', async () => {
  const {server, send} = setup({
    onNotification: jest.fn(() => {
      throw new Error('test');
    }),
  });
  const name = 'aga';
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new NotificationMessage(name, new Uint8Array([1]))], undefined),
    expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(NotificationMessage);
  expect(send.mock.calls[0][0][0].data).toEqual({
    message: 'test',
  });
});

test('if rpc method throws, sends back error message', async () => {
  const {server, send, caller, notify, ctx} = setup();
  jest.spyOn(caller, 'call');
  expect(send).toHaveBeenCalledTimes(0);
  const message = new RequestCompleteMessage(1, 'error', new Uint8Array([2]));
  server.onMessages([message], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseErrorMessage(1, {message: 'always throws'})]);
  expect(caller.call).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('sends complete message if observable immediately completes after emitting one value', async () => {
  const {server, send, caller, ctx} = setup();
  jest.spyOn(caller, 'createCall');
  server.onMessages([new RequestCompleteMessage(25, 'emitOnceSync', {foo: 'bar'})], ctx);
  await until(() => (caller.createCall as any).mock.calls.length === 1);
  expect(caller.createCall).toHaveBeenCalledTimes(1);
  expect(caller.createCall).toHaveBeenCalledWith('emitOnceSync', ctx, expect.any(Function), expect.any(Function));
  await until(() => send.mock.calls.length === 1);
  expect(send).toHaveBeenCalledTimes(1);
  const msg = send.mock.calls[0][0][0];
  expect(msg).toBeInstanceOf(ResponseCompleteMessage);
  expect(msg.id).toBe(25);
  expect(msg.data).toEqual(
    JSON.stringify({
      request: {foo: 'bar'},
      ctx: {ip: '127.0.0.1'},
    }),
  );
});

test('observable emits three values synchronously', async () => {
  const {server, send, caller} = setup();
  jest.spyOn(caller, 'createCall');
  server.onMessages([new RequestCompleteMessage(123, 'emitThreeSync', new Uint8Array([0]))], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(caller.createCall).toHaveBeenCalledTimes(1);
  expect(caller.createCall).toHaveBeenCalledWith(
    'emitThreeSync',
    undefined,
    expect.any(Function),
    expect.any(Function),
  );
  expect(send).toHaveBeenCalledTimes(3);
  expect(send.mock.calls[0][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([1]))]);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseDataMessage);
  expect(send.mock.calls[1][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([2]))]);
  expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseDataMessage);
  expect(send.mock.calls[2][0]).toEqual([new ResponseCompleteMessage(123, new Uint8Array([3]))]);
  expect(send.mock.calls[2][0][0]).toBeInstanceOf(ResponseCompleteMessage);
});

test('when observable completes asynchronously, sends empty complete message', async () => {
  const {server, send, caller, notify, ctx, subject} = setup();
  jest.spyOn(caller, 'createCall');
  server.onMessages([new RequestCompleteMessage(123, 'subject', new Uint8Array([0]))], undefined);
  subject.next(new Uint8Array([1]));
  subject.next(new Uint8Array([2]));
  subject.next(new Uint8Array([3]));
  await new Promise((r) => setTimeout(r, 1));
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(caller.createCall).toHaveBeenCalledTimes(1);
  expect(caller.createCall).toHaveBeenCalledWith('subject', undefined, expect.any(Function), expect.any(Function));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([1]))]);
  expect(send.mock.calls[1][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([2]))]);
  expect(send.mock.calls[2][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([3]))]);
  expect(send.mock.calls[3][0]).toEqual([new ResponseCompleteMessage(123, undefined)]);
});

test('when observable completes asynchronously and emits asynchronously, sends empty complete message', async () => {
  const {server, send, caller, notify, ctx, subject} = setup();
  jest.spyOn(caller, 'createCall');
  server.onMessages([new RequestCompleteMessage(123, 'subject', new Uint8Array([0]))], undefined);
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
  expect(caller.createCall).toHaveBeenCalledTimes(1);
  expect(caller.createCall).toHaveBeenCalledWith('subject', undefined, expect.any(Function), expect.any(Function));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([1]))]);
  expect(send.mock.calls[1][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([2]))]);
  expect(send.mock.calls[2][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([3]))]);
  expect(send.mock.calls[3][0]).toEqual([new ResponseCompleteMessage(123, undefined)]);
});

test('sends error when subscription limit is exceeded', async () => {
  const {server, send, caller} = setup({bufferTime: 0}, {maxActiveCalls: 5});
  jest.spyOn(caller, 'createCall');
  expect(caller.createCall).toHaveBeenCalledTimes(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(1, 'subject', new Uint8Array([1]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(2, 'subject', new Uint8Array([2]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'subject', new Uint8Array([3]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(4, 'subject', new Uint8Array([4]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(5, 'subject', new Uint8Array([5]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(6, 'subject', new Uint8Array([6]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(6);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0].data).toEqual({code: 'TooManyActiveCalls', errno: 2, message: 'PROTOCOL'});
});

test('sends error when subscription limit is exceeded including static calls', async () => {
  const {server, send, caller} = setup({bufferTime: 0}, {maxActiveCalls: 5});
  jest.spyOn(caller, 'call');
  jest.spyOn(caller, 'call$');
  jest.spyOn(caller, 'createCall');
  expect(caller.call).toHaveBeenCalledTimes(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(1, 'ping', new Uint8Array([1]))], undefined);
  expect(caller.call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(2, 'ping', new Uint8Array([2]))], undefined);
  expect(caller.call).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'subject', new Uint8Array([3]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(4, 'subject', new Uint8Array([4]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(5, 'subject', new Uint8Array([5]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(6, 'subject', new Uint8Array([6]))], undefined);
  expect(caller.createCall).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0].data).toEqual({code: 'TooManyActiveCalls', errno: 2, message: 'PROTOCOL'});
});

test('subscription counter goes down on unsubscribe', async () => {
  const {server, send, caller, subject} = setup({bufferTime: 0}, {maxActiveCalls: 5});
  expect(caller.activeCalls).toBe(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(1, 'subject', new Uint8Array([1]))], undefined);
  expect(caller.activeCalls).toBe(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(2, 'subject', new Uint8Array([2]))], undefined);
  expect(caller.activeCalls).toBe(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'subject', new Uint8Array([3]))], undefined);
  expect(caller.activeCalls).toBe(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestDataMessage(4, 'subject', new Uint8Array([4]))], undefined);
  expect(caller.activeCalls).toBe(4);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestDataMessage(5, 'subject', new Uint8Array([5]))], undefined);
  expect(caller.activeCalls).toBe(5);
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(caller.activeCalls).toBe(0);
  expect(send).toHaveBeenCalledTimes(5);
});

test('call can return a promise', async () => {
  const {server, send, caller, notify, ctx, subject} = setup();
  jest.spyOn(caller, 'call');
  expect(caller.call).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'promise', new Uint8Array([1, 2, 3]))], {});
  expect(caller.call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(3, 'this is promise result')]);
});

test('sends error message if promise throws', async () => {
  const {server, send, caller, notify, ctx, subject} = setup();
  jest.spyOn(caller, 'call');
  expect(caller.call).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'promiseError', new Uint8Array([1, 2, 3]))], {});
  expect(caller.call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseErrorMessage(3, {message: 'this promise can throw'})]);
});

test('can create custom API from promises and observables', async () => {
  const {server, send} = setup();
  await new Promise((r) => setTimeout(r, 1));
  server.onMessages([new RequestCompleteMessage(1, 'echo', Buffer.from('hello'))], undefined);
  await new Promise((r) => setTimeout(r, 1));
  server.onMessages([new RequestCompleteMessage(2, 'double', 1)], undefined);
  await new Promise((r) => setTimeout(r, 1));
  server.onMessages([new RequestCompleteMessage(3, 'double', 10)], undefined);
  await new Promise((r) => setTimeout(r, 1));
  server.onMessages([new RequestCompleteMessage(4, 'Unknown_method!', 10)], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, Buffer.from('hello'))]);
  expect(send.mock.calls[1][0]).toEqual([new ResponseCompleteMessage(2, 2)]);
  expect(send.mock.calls[2][0]).toEqual([new ResponseCompleteMessage(3, 20)]);
  expect(send.mock.calls[3][0][0].data).toEqual({
    code: 'MethodNotFound',
    errno: RpcServerError.MethodNotFound,
    message: 'PROTOCOL',
  });
});

test('can add authentication on as higher level API', async () => {
  const {server, send} = setup();
  server.onMessage(new NotificationMessage('setToken', '1234'), {});
  server.onMessage(new RequestCompleteMessage(1, 'getToken', {}), {});
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, '1234')]);
});

test('stops sending messages after server stop()', async () => {
  let sub: Subscriber<any>;
  const {server, send} = setup(
    {},
    {
      api: {
        foo: {
          isStreaming: true,
          call$: () => {
            return new Observable((subscriber) => {
              sub = subscriber;
            });
          },
        },
      },
    },
  );
  expect(!!sub!).toBe(false);
  server.onMessage(new RequestCompleteMessage(1, 'foo', {}), undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(0);
  expect(!!sub!).toBe(true);
  sub!.next(1);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  server.stop();
  sub!.next(2);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  server.onMessage(new RequestCompleteMessage(1, 'foo', undefined), undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
});

test('does not send subscription complete message from server when client cancels subscription', async () => {
  const subject = new Subject();
  const {server, send} = setup(
    {},
    {
      api: {
        foo: {
          isStreaming: true,
          call$: () => subject,
        },
      },
    },
  );
  server.onMessage(new RequestDataMessage(1, 'foo', {}), {});
  expect(send).toHaveBeenCalledTimes(0);
  subject.next(1);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  subject.next(2);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(2);
  server.onMessage(new ResponseUnsubscribeMessage(1), {});
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(2);
});

test.todo('can subscribe to streaming request twice');

describe('validation', () => {
  test('successfully validates a static call', async () => {
    const {server, send} = setup(
      {},
      {
        api: {
          test: {
            isStreaming: false,
            validate: (req: unknown) => {
              if (typeof req !== 'object') throw new Error('Invalid request.');
              if (!req) throw new Error('Invalid request.');
              if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
            },
            call: async (ctx: any, req: any) => (req as {num: number}).num * 2,
          },
        },
      },
    );
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'test', {num: 3}), {});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send).toHaveBeenCalledWith([new ResponseCompleteMessage(1, 6)]);
  });

  test('returns error on invalid input', async () => {
    const {server, send} = setup(
      {},
      {
        api: {
          test: {
            isStreaming: false,
            validate: (req: unknown) => {
              if (typeof req !== 'object') throw new Error('Invalid request.');
              if (!req) throw new Error('Invalid request.');
              if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
            },
            call: async (ctx: any, req: any) => (req as {num: number}).num * 2,
          },
        },
      },
    );
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'test', {gg: 3}), {});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
    expect(send).toHaveBeenCalledWith([
      new ResponseErrorMessage(1, {
        message: 'Invalid request.',
      }),
    ]);
  });

  describe('for streaming method', () => {
    test('successfully validates a streaming call', async () => {
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: true,
              validate: (req: unknown) => {
                if (typeof req !== 'object') throw new Error('Invalid request.');
                if (!req) throw new Error('Invalid request.');
                if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
              },
              call$: (ctx: any, req$: any) => req$.pipe(map((req) => (req as {num: number}).num * 2)),
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestDataMessage(1, 'test', {num: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseDataMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseDataMessage(1, 10));

      server.onMessage(new RequestDataMessage(1, 'test', {num: 25}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(2);
      expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseDataMessage);
      expect(send.mock.calls[1][0][0]).toEqual(new ResponseDataMessage(1, 50));
    });

    test('errors stream on first data message invalid', async () => {
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: true,
              validate: (req: unknown) => {
                if (typeof req !== 'object') throw new Error('Invalid request.');
                if (!req) throw new Error('Invalid request.');
                if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
              },
              call$: (ctx: any, req$: any) => req$.pipe(map((req) => (req as {num: number}).num * 2)),
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestDataMessage(1, 'test', {GG: 5}), {});
      await new Promise((r) => setTimeout(r, 1));

      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(
        new ResponseErrorMessage(1, {
          message: 'Invalid request.',
        }),
      );
    });

    test('errors stream on first data message invalid and is a complete message', async () => {
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: true,
              validate: (req: unknown) => {
                if (typeof req !== 'object') throw new Error('Invalid request.');
                if (!req) throw new Error('Invalid request.');
                if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
              },
              call$: (ctx: any, req$: any) => req$.pipe(map((req) => (req as {num: number}).num * 2)),
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestCompleteMessage(1, 'test', {GG: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(
        new ResponseErrorMessage(1, {
          message: 'Invalid request.',
        }),
      );
    });

    test('errors stream on second data message invalid', async () => {
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: true,
              validate: (req: unknown) => {
                if (typeof req !== 'object') throw new Error('Invalid request.');
                if (!req) throw new Error('Invalid request.');
                if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
              },
              call$: (ctx: any, req$: any) => req$.pipe(map((req) => (req as {num: number}).num * 2)),
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestDataMessage(1, 'test', {num: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseDataMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseDataMessage(1, 10));

      server.onMessage(new RequestDataMessage(1, 'test', {GG: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(2);
      expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[1][0][0]).toEqual(
        new ResponseErrorMessage(1, {
          message: 'Invalid request.',
        }),
      );
    });

    test('when second data message validation fails errors request$ observable', async () => {
      const next = jest.fn();
      const error = jest.fn();
      const complete = jest.fn();
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: true,
              validate: (req: unknown) => {
                if (typeof req !== 'object') throw new Error('Invalid request.');
                if (!req) throw new Error('Invalid request.');
                if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
              },
              call$: (ctx: any, req$: any) => {
                req$.subscribe({next, error, complete});
                const subject = new Subject();
                return subject;
              },
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestDataMessage(1, 'test', {num: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledTimes(0);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestDataMessage(1, 'test', {INVALID: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledTimes(1);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith(new Error('Invalid request.'));
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(
        new ResponseErrorMessage(1, {
          message: 'Invalid request.',
        }),
      );
    });

    test('when first data message validation fails errors response observable and does not start request observable', async () => {
      const next = jest.fn();
      const error = jest.fn();
      const complete = jest.fn();
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: true,
              validate: (req: unknown) => {
                if (typeof req !== 'object') throw new Error('Invalid request.');
                if (!req) throw new Error('Invalid request.');
                if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
              },
              call$: (ctx: any, req$: any) => {
                req$.subscribe({next, error, complete});
                const subject = new Subject();
                return subject;
              },
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestDataMessage(1, 'test', {INVALID: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(0);
      expect(error).toHaveBeenCalledTimes(0);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(
        new ResponseErrorMessage(1, {
          message: 'Invalid request.',
        }),
      );
    });

    test('when first RequestCompleteMessage validation fails errors response observable and does not start request observable', async () => {
      const next = jest.fn();
      const error = jest.fn();
      const complete = jest.fn();
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: true,
              validate: (req: unknown) => {
                if (typeof req !== 'object') throw new Error('Invalid request.');
                if (!req) throw new Error('Invalid request.');
                if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
              },
              call$: (ctx: any, req$: any) => {
                req$.subscribe({next, error, complete});
                const subject = new Subject();
                return subject;
              },
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestCompleteMessage(1, 'test', {INVALID: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(0);
      expect(error).toHaveBeenCalledTimes(0);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(
        new ResponseErrorMessage(1, {
          message: 'Invalid request.',
        }),
      );
    });
  });
});

describe('pre-call checks', () => {
  describe('static method', () => {
    test('proceeds with call when pre-call checks pass', async () => {
      const onPreCall = jest.fn(async (ctx, request) => {});
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: false,
              onPreCall,
              call: async (ctx: any, req: any) => (req as {num: number}).num * 2,
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      expect(onPreCall).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestCompleteMessage(1, 'test', {num: 6}), {foo: 'bar'});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseCompleteMessage(1, 12));

      expect(onPreCall).toHaveBeenCalledTimes(1);
      expect(onPreCall).toHaveBeenCalledWith({foo: 'bar'}, {num: 6});
    });

    test('fails call when pre-call checks fail', async () => {
      const onPreCall = jest.fn(async (ctx, request) => {
        throw new Error('fail...');
      });
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: false,
              onPreCall,
              call: async (ctx: any, req: any) => (req as {num: number}).num * 2,
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      expect(onPreCall).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestCompleteMessage(1, 'test', {num: 6}), {foo: 'bar'});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {message: 'fail...'}));

      expect(onPreCall).toHaveBeenCalledTimes(1);
      expect(onPreCall).toHaveBeenCalledWith({foo: 'bar'}, {num: 6});
    });
  });

  describe('streaming method', () => {
    test('proceeds with call when pre-call checks pass', async () => {
      const onPreCall = jest.fn(async (ctx, request) => {});
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: true,
              onPreCall,
              call$: (ctx: any, req$: any) => from([1, 2]),
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);

      expect(onPreCall).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestDataMessage(1, 'test', {a: 'b'}), {foo: 'bar'});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(2);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseDataMessage);
      expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseCompleteMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseDataMessage(1, 1));
      expect(send.mock.calls[1][0][0]).toEqual(new ResponseCompleteMessage(1, 2));

      expect(onPreCall).toHaveBeenCalledTimes(1);
      expect(onPreCall).toHaveBeenCalledWith({foo: 'bar'}, {a: 'b'});
    });

    describe('request buffer', () => {
      test('buffer size is 10 by default', async () => {
        const preCallFuture = new Defer();
        const onPreCall = jest.fn(async (ctx, request) => {
          await preCallFuture.promise;
        });
        const {server, send} = setup(
          {},
          {
            api: {
              test: {
                isStreaming: true,
                onPreCall,
                call$: (ctx: any, req$: any) => from([1, 2]),
                validate: () => {},
              },
            },
          },
        );
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '1'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '2'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '3'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '4'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '5'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '6'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '7'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '8'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '9'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '10'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '11'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {message: 'BufferSubjectOverflow'}));
      });

      test('buffer size can be set to 5 for the whole server', async () => {
        const preCallFuture = new Defer();
        const onPreCall = jest.fn(async (ctx, request) => {
          await preCallFuture.promise;
        });
        const {server, send} = setup(
          {},
          {
            preCallBufferSize: 5,
            api: {
              test: {
                onPreCall,
                isStreaming: true,
                call$: (ctx: any, req$: any) => from([1, 2]),
                validate: () => {},
              },
            },
          },
        );
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '1'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '2'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '3'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '4'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '5'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '6'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {message: 'BufferSubjectOverflow'}));
      });

      test('buffer size can be set to 5 per method', async () => {
        const preCallFuture = new Defer();
        const onPreCall = jest.fn(async (ctx, request) => {
          await preCallFuture.promise;
        });
        const {server, send} = setup(
          {},
          {
            api: {
              test: {
                isStreaming: true,
                onPreCall,
                call$: (ctx: any, req$: any) => from([1, 2]),
                validate: () => {},
                preCallBufferSize: 5,
              },
            },
          },
        );
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '1'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '2'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '3'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '4'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '5'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '6'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {message: 'BufferSubjectOverflow'}));
      });

      test('when pre-call checks finish just before buffer is full, can receive more request data', async () => {
        const preCallFuture = new Defer();
        const response$ = new Subject();
        const onPreCall = jest.fn(async (ctx, request) => {
          await preCallFuture.promise;
        });
        const next = jest.fn();
        const {server, send} = setup(
          {},
          {
            api: {
              test: {
                isStreaming: true,
                onPreCall,
                call$: (ctx: any, req$: any) => {
                  req$.subscribe({next, error: () => {}});
                  return response$;
                },
                validate: () => {},
                preCallBufferSize: 5,
              },
            },
          },
        );
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '1'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '2'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '3'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '4'}), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', {a: '5'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        expect(next).toHaveBeenCalledTimes(0);
        preCallFuture.resolve(undefined);
        await new Promise((r) => setTimeout(r, 1));
        expect(next).toHaveBeenCalledTimes(5);
        server.onMessage(new RequestDataMessage(1, 'test', {a: '6'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        server.onMessage(new RequestDataMessage(1, 'test', {a: '7'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        server.onMessage(new RequestDataMessage(1, 'test', {a: '8'}), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        response$.next(1);
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledTimes(8);
      });
    });
  });
});

describe('when server stops', () => {
  test('does not emit messages from static calls', async () => {
    const {server, send} = setup();
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'promiseDelay', {}), {});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    server.onMessage(new RequestCompleteMessage(2, 'promiseDelay', {}), {});
    expect(send).toHaveBeenCalledTimes(1);
    server.stop();
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
  });

  test('does not emit messages from streaming calls', async () => {
    const {server, send} = setup();
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'streamDelay', {}), {});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    server.onMessage(new RequestCompleteMessage(2, 'streamDelay', {}), {});
    expect(send).toHaveBeenCalledTimes(1);
    server.stop();
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe('buffering', () => {
  test('batches messages received within buffering window', async () => {
    const {server, send} = setup(
      {
        bufferTime: 1,
      },
      {
        api: {
          method1: {
            isStreaming: false,
            call: async () => 123,
          },
          method2: {
            isStreaming: false,
            call: async () => 123,
          },
        },
      },
    );
    server.onMessage(new RequestCompleteMessage(1, 'method1', Buffer.from('a')), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'method2', Buffer.from('b')), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, 123), new ResponseCompleteMessage(2, 123)]);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[0][0][1]).toBeInstanceOf(ResponseCompleteMessage);
  });

  test('batches errors received within buffering window', async () => {
    const {server, send} = setup({bufferTime: 1});
    server.onMessage(new RequestCompleteMessage(1, 'not_exist_1', Buffer.from('a')), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'not_exist_2', Buffer.from('b')), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toEqual(
      new ResponseErrorMessage(1, {
        code: 'MethodNotFound',
        errno: RpcServerError.MethodNotFound,
        message: 'PROTOCOL',
      }),
    );
    expect(send.mock.calls[0][0][1]).toEqual(
      new ResponseErrorMessage(2, {
        code: 'MethodNotFound',
        errno: RpcServerError.MethodNotFound,
        message: 'PROTOCOL',
      }),
    );
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
    expect(send.mock.calls[0][0][1]).toBeInstanceOf(ResponseErrorMessage);
  });

  test('does not batch consecutive messages when buffering is disabled', async () => {
    const {server, send} = setup(
      {
        bufferTime: 0,
      },
      {
        api: {
          method1: {
            isStreaming: false,
            call: async () => 123,
          },
          method2: {
            isStreaming: false,
            call: async () => 123,
          },
        },
      },
    );
    server.onMessage(new RequestCompleteMessage(1, 'method1', Buffer.from('a')), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'method2', Buffer.from('b')), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, 123)]);
    expect(send.mock.calls[1][0]).toEqual([new ResponseCompleteMessage(2, 123)]);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseCompleteMessage);
  });

  test('does not batch messages when they are far apart', async () => {
    const {server, send} = setup(
      {
        bufferTime: 1,
      },
      {
        api: {
          method1: {
            isStreaming: false,
            call: async () => 123,
          },
          method2: {
            isStreaming: false,
            call: async () => 123,
          },
        },
      },
    );
    server.onMessage(new RequestCompleteMessage(1, 'method1', Buffer.from('a')), {ctx: 1});
    await new Promise((r) => setTimeout(r, 10));
    server.onMessage(new RequestCompleteMessage(2, 'method2', Buffer.from('b')), {ctx: 2});
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, 123)]);
    expect(send.mock.calls[1][0]).toEqual([new ResponseCompleteMessage(2, 123)]);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseCompleteMessage);
  });

  test('batches and sends out messages when buffer is filled up', async () => {
    const {server, send} = setup(
      {
        bufferTime: 100,
        bufferSize: 2,
      },
      {
        api: {
          method1: {
            isStreaming: false,
            call: async () => 123,
          },
          method2: {
            isStreaming: false,
            call: async () => 123,
          },
        },
      },
    );
    server.onMessage(new RequestCompleteMessage(1, 'method1', Buffer.from('a')), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'method2', Buffer.from('b')), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, 123), new ResponseCompleteMessage(2, 123)]);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[0][0][1]).toBeInstanceOf(ResponseCompleteMessage);
  });
});
