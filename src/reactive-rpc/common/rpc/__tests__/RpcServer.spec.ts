import {RpcServer, RpcServerParams, RpcServerError} from '../RpcServer';
import {of, from, Subject, Observable, Subscriber} from 'rxjs';
import {NotificationMessage, RequestCompleteMessage, RequestDataMessage, RequestErrorMessage, ResponseCompleteMessage, ResponseDataMessage, ResponseErrorMessage, ResponseUnsubscribeMessage} from '../../messages/nominal';
import {map, switchMap, take} from 'rxjs/operators';

const setup = (params: Partial<RpcServerParams> = {}) => {
  const send = jest.fn();
  const subject = new Subject<any>();
  let token: string = '';
  const getRpcMethod = jest.fn(((name: string) => {
    switch (name) {
      case 'ping': {
        return {
          isStreaming: false,
          call: async () => 'pong',
        };
      }
      case 'promise': {
        return {
          isStreaming: false,
          call: async () => 'this is promise result',
        };
      }
      case 'promiseError': {
        return {
          isStreaming: false,
          call: async () => {
            throw 'this promise can throw';
          },
        };
      }
      case 'promiseDelay': {
        return {
          isStreaming: false,
          call: async () => {
            await new Promise(r => setTimeout(r, 5));
            return {};
          },
        };
      }
      case 'error': {
        return {
          isStreaming: false,
          call: async () => {
            throw {message: 'always throws'};
          },
        };
      }
      case 'emitOnceSync': {
        return {
          isStreaming: true,
          call$: (ctx, request$) => {
            const obs = request$.pipe(
              take(1),
              switchMap((request) => of(JSON.stringify({request, ctx})))
            );
            return obs;
          },
        };
      }
      case 'emitThreeSync': {
        return {
          isStreaming: true,
          call$: (ctx, request$) => {
            const obs = request$.pipe(
              take(1),
              switchMap((request) => from([new Uint8Array([1]), new Uint8Array([2]), new Uint8Array([3])]))
            );
            return obs;
          },
        };
      }
      case 'subject': {
        return {
          isStreaming: true,
          call$: (ctx, request$) => {
            return subject;
          },
        };
      }
      case 'echo': {
        return {
          isStreaming: false,
          call: (ctx, payload) => Promise.resolve(payload),
        };
      }
      case 'double': {
        return {
          isStreaming: true,
          call$: (ctx, request$) => request$.pipe(
            take(1),
            switchMap(value => of(2 * value)),
          ),
        };
      }
      case 'getToken': {
        return {
          isStreaming: false,
          call: async () => token,
        };
      }
      case 'streamDelay': {
        return {
          isStreaming: true,
          call$: () => from((async () => {
            await new Promise(r => setTimeout(r, 5));
            return {};
          })()),
        };
      }
    }
    return undefined;
  }) as RpcServerParams<any, any>['onCall']);
  const notify = jest.fn((method: string, request: unknown) => {
    switch (method) {
      case 'setToken': {
        token = String(request);
        return;
      }
    }
  });
  const ctx = {ip: '127.0.0.1'};
  const server = new RpcServer<any, any>({
    send,
    onNotification: notify,
    onCall: getRpcMethod,
    bufferTime: 0,
    formatError: (error: unknown) => error instanceof Error ? {error: {message: error.message}} : JSON.stringify({error}),
    formatErrorCode: (code: RpcServerError) => JSON.stringify({code}),
    ...params,
  });
  return {server, send, getRpcMethod, notify, ctx, subject};
};

test('can create server', async () => {
  setup();
});

test('does not execute any methods on initialization', async () => {
  const {server, send, getRpcMethod, notify} = setup();
  expect(send).toHaveBeenCalledTimes(0);
  expect(getRpcMethod).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('executes notification callback on notification message', async () => {
  const {server, send, getRpcMethod, notify, ctx} = setup();
  const message = new NotificationMessage('test', new Uint8Array([1, 2, 3]));
  server.onMessages([message], ctx);
  expect(send).toHaveBeenCalledTimes(0);
  expect(getRpcMethod).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledWith('test', new Uint8Array([1, 2, 3]), ctx);
});

test('can receive multiple notifications', async () => {
  const {server, send, getRpcMethod, notify} = setup();
  server.onMessages([new NotificationMessage('1', new Uint8Array([1]))], undefined);
  server.onMessages([new NotificationMessage('2', new Uint8Array([2]))], undefined);
  server.onMessages([new NotificationMessage('3', new Uint8Array([3]))], undefined);
  await new Promise((r) => setTimeout(r, 2));
  expect(send).toHaveBeenCalledTimes(0);
  expect(getRpcMethod).toHaveBeenCalledTimes(0);
  expect(notify).toHaveBeenCalledTimes(3);
  expect(notify).toHaveBeenCalledWith('1', new Uint8Array([1]), undefined);
  expect(notify).toHaveBeenCalledWith('2', new Uint8Array([2]), undefined);
  expect(notify).toHaveBeenCalledWith('3', new Uint8Array([3]), undefined);
});

// test('throws on empty notification name', async () => {
//   const {server, send, call, notify, ctx} = setup();
//   expect(() =>
//     server.onMessages([new NotificationMessage('', new Uint8Array([1]))], undefined),
//   ).toThrowErrorMatchingInlineSnapshot(`"Invalid method."`);
// });

// test('throws when notification name longer than 128 chars', async () => {
//   const send = jest.fn();
//   const call = jest.fn();
//   const notify = jest.fn();
//   const server = new BinaryRxServer({send, call, notify, bufferTime: 0});
//   const name =
//     '012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678';
//   expect(() =>
//     server.onMessages([new NotificationMessage(name, new Uint8Array([1]))], undefined),
//   ).toThrowErrorMatchingInlineSnapshot(`"Invalid method."`);
// });

test('throws when "notify" callback throws', async () => {
  const {server} = setup({
    onNotification: jest.fn(() => {
      throw new Error('test');
    }),
  });
  const name = 'aga';
  expect(() =>
    server.onMessages([new NotificationMessage(name, new Uint8Array([1]))], undefined),
  ).toThrowErrorMatchingInlineSnapshot(`"test"`);
});

test('if rpc method throws, sends back error message', async () => {
  const {server, send, getRpcMethod, notify, ctx} = setup();
  expect(send).toHaveBeenCalledTimes(0);
  const message = new RequestCompleteMessage(1, 'error', new Uint8Array([2]));
  server.onMessages([message], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseErrorMessage(1, JSON.stringify({error: {message: 'always throws'}}))]);
  expect(getRpcMethod).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledTimes(0);
});

test('sends complete message if observable immediately completes after emitting one value', async () => {
  const {server, send, getRpcMethod, notify, ctx} = setup();
  server.onMessages([new RequestCompleteMessage(25, 'emitOnceSync', {foo: 'bar'})], ctx);
  await new Promise((r) => setTimeout(r, 1));
  expect(getRpcMethod).toHaveBeenCalledTimes(1);
  expect(getRpcMethod).toHaveBeenCalledWith('emitOnceSync');
  expect(send).toHaveBeenCalledTimes(1);
  const msg = send.mock.calls[0][0][0];
  expect(msg).toBeInstanceOf(ResponseCompleteMessage);
  expect(msg.id).toBe(25);
  expect(msg.data).toEqual(JSON.stringify({
    request: {foo: 'bar'},
    ctx: {ip: '127.0.0.1'},
  }));
});

test('observable emits three values synchronously', async () => {
  const {server, send, getRpcMethod, notify, ctx} = setup();
  server.onMessages([new RequestCompleteMessage(123, 'emitThreeSync', new Uint8Array([0]))], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(getRpcMethod).toHaveBeenCalledTimes(1);
  expect(getRpcMethod).toHaveBeenCalledWith('emitThreeSync');
  expect(send).toHaveBeenCalledTimes(3);
  expect(send.mock.calls[0][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([1]))]);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseDataMessage);
  expect(send.mock.calls[1][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([2]))]);
  expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseDataMessage);
  expect(send.mock.calls[2][0]).toEqual([new ResponseCompleteMessage(123, new Uint8Array([3]))]);
  expect(send.mock.calls[2][0][0]).toBeInstanceOf(ResponseCompleteMessage);
});

test('when observable completes asynchronously, sends empty complete message', async () => {
  const {server, send, getRpcMethod, notify, ctx, subject} = setup();
  server.onMessages([new RequestCompleteMessage(123, 'subject', new Uint8Array([0]))], undefined);
  subject.next(new Uint8Array([1]));
  subject.next(new Uint8Array([2]));
  subject.next(new Uint8Array([3]));
  await new Promise((r) => setTimeout(r, 1));
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(getRpcMethod).toHaveBeenCalledTimes(1);
  expect(getRpcMethod).toHaveBeenCalledWith('subject');
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([1]))]);
  expect(send.mock.calls[1][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([2]))]);
  expect(send.mock.calls[2][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([3]))]);
  expect(send.mock.calls[3][0]).toEqual([new ResponseCompleteMessage(123, undefined)]);
});

test('when observable completes asynchronously and emits asynchronously, sends empty complete message', async () => {
  const {server, send, getRpcMethod, notify, ctx, subject} = setup();
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
  expect(getRpcMethod).toHaveBeenCalledTimes(1);
  expect(getRpcMethod).toHaveBeenCalledWith('subject');
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([1]))]);
  expect(send.mock.calls[1][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([2]))]);
  expect(send.mock.calls[2][0]).toEqual([new ResponseDataMessage(123, new Uint8Array([3]))]);
  expect(send.mock.calls[3][0]).toEqual([new ResponseCompleteMessage(123, undefined)]);
});

test('sends error when subscription limit is exceeded', async () => {
  const {server, send, getRpcMethod, notify, ctx, subject} = setup({maxActiveCalls: 5, bufferTime: 0});
  expect(getRpcMethod).toHaveBeenCalledTimes(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(1, 'subject', new Uint8Array([1]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(2, 'subject', new Uint8Array([2]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'subject', new Uint8Array([3]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(4, 'subject', new Uint8Array([4]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(5, 'subject', new Uint8Array([5]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(6, 'subject', new Uint8Array([6]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(6);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(
    [new ResponseErrorMessage(6, JSON.stringify({code: RpcServerError.TooManyActiveCalls}))],
  );
});

test('sends error when subscription limit is exceeded including static calls', async () => {
  const {server, send, getRpcMethod, notify, ctx, subject} = setup({maxActiveCalls: 5, bufferTime: 0});
  expect(getRpcMethod).toHaveBeenCalledTimes(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(1, 'ping', new Uint8Array([1]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(2, 'ping', new Uint8Array([2]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'subject', new Uint8Array([3]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(4, 'subject', new Uint8Array([4]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(4);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(5, 'subject', new Uint8Array([5]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(6, 'subject', new Uint8Array([6]))], undefined);
  expect(getRpcMethod).toHaveBeenCalledTimes(6);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual(
    [new ResponseErrorMessage(6, JSON.stringify({code: RpcServerError.TooManyActiveCalls}))],
  );
});

test('subscription counter goes down on unsubscribe', async () => {
  const {server, send, getRpcMethod, notify, ctx, subject} = setup({maxActiveCalls: 5, bufferTime: 0});
  expect(server.getInflightCallCount()).toBe(0);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(1, 'subject', new Uint8Array([1]))], undefined);
  expect(server.getInflightCallCount()).toBe(1);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(2, 'subject', new Uint8Array([2]))], undefined);
  expect(server.getInflightCallCount()).toBe(2);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'subject', new Uint8Array([3]))], undefined);
  expect(server.getInflightCallCount()).toBe(3);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestDataMessage(4, 'subject', new Uint8Array([4]))], undefined);
  expect(server.getInflightCallCount()).toBe(4);
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestDataMessage(5, 'subject', new Uint8Array([5]))], undefined);
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(server.getInflightCallCount()).toBe(2);
  expect(send).toHaveBeenCalledTimes(5);
  server.onMessages([new RequestCompleteMessage(4, '', {})], undefined);
  expect(server.getInflightCallCount()).toBe(1);
  server.onMessages([new RequestCompleteMessage(5, '', {})], undefined);
  expect(server.getInflightCallCount()).toBe(0);
  expect(send).toHaveBeenCalledTimes(5);
  server.onMessages([new RequestDataMessage(6, 'subject', new Uint8Array([6]))], undefined);
  expect(server.getInflightCallCount()).toBe(1);
  expect(send).toHaveBeenCalledTimes(6);
});

test('call can return a promise', async () => {
  const {server, send, getRpcMethod, notify, ctx, subject} = setup();
  expect(getRpcMethod).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'promise', new Uint8Array([1, 2, 3]))], {});
  expect(getRpcMethod).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(3, 'this is promise result')]);
});

test('sends error message if promise throws', async () => {
  const {server, send, getRpcMethod, notify, ctx, subject} = setup();
  expect(getRpcMethod).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'promiseError', new Uint8Array([1, 2, 3]))], {});
  expect(getRpcMethod).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseErrorMessage(3, JSON.stringify({error: 'this promise can throw'}))]);
});

test('can create custom API from promises and observables', async () => {
  const {server, send, getRpcMethod, notify, ctx, subject} = setup();
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
  expect(send.mock.calls[3][0]).toEqual(
    [new ResponseErrorMessage(4, JSON.stringify({code: RpcServerError.MethodNotFound}))],
  );
});

test('can add authentication on as higher level API', async () => {
  const {server, send, getRpcMethod, notify, ctx, subject} = setup();
  server.onMessage(new NotificationMessage('setToken', '1234'), {});
  server.onMessage(new RequestCompleteMessage(1, 'getToken', {}), {});
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, '1234')]);
});

test('stops sending messages after server stop()', async () => {
  let sub: Subscriber<any>;
  const {server, send} = setup({
    onCall: () => ({
      isStreaming: true,
      call$: () => {
        console.log('CALL')
        return new Observable((subscriber) => {
          sub = subscriber;
        });
      },
    }),
  });
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
  const {server, send} = setup({
    onCall: () => ({
      isStreaming: true,
      call$: () => subject,
    }),
  });
  server.onMessage(new RequestDataMessage(1, 'test', {}), {});
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
    const {server, send} = setup({
      onCall: () => ({
        isStreaming: false,
        validate: (req: unknown) => {
          if (typeof req !== 'object') throw new Error('Invalid request.');
          if (!req) throw new Error('Invalid request.');
          if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
        },
        call: async (ctx, req) => (req as {num: number}).num * 2,
      }),
    });
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'test', {num: 3}), {});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send).toHaveBeenCalledWith([new ResponseCompleteMessage(1, 6)]);
  });

  test('returns error on invalid input', async () => {
    const {server, send} = setup({
      onCall: () => ({
        isStreaming: false,
        validate: (req: unknown) => {
          if (typeof req !== 'object') throw new Error('Invalid request.');
          if (!req) throw new Error('Invalid request.');
          if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
        },
        call: async (ctx, req) => (req as {num: number}).num * 2,
      }),
    });
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'test', {gg: 3}), {});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
    expect(send).toHaveBeenCalledWith([new ResponseErrorMessage(1, {
      error: {
        message: 'Invalid request.',
      },
    })]);
  });

  describe('for streaming method', () => {
    test('successfully validates a streaming call', async () => {
      const {server, send} = setup({
        onCall: () => ({
          isStreaming: true,
          validate: (req: unknown) => {
            if (typeof req !== 'object') throw new Error('Invalid request.');
            if (!req) throw new Error('Invalid request.');
            if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
          },
          call$: (ctx, req$) => req$.pipe(map(req => (req as {num: number}).num * 2)),
        }),
      });
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
      const {server, send} = setup({
        onCall: () => ({
          isStreaming: true,
          validate: (req: unknown) => {
            if (typeof req !== 'object') throw new Error('Invalid request.');
            if (!req) throw new Error('Invalid request.');
            if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
          },
          call$: (ctx, req$) => req$.pipe(map(req => (req as {num: number}).num * 2)),
        }),
      });
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestDataMessage(1, 'test', {GG: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {
        error: {
          message: 'Invalid request.',
        },
      }));
    });

    test('errors stream on first data message invalid and is a complete message', async () => {
      const {server, send} = setup({
        onCall: () => ({
          isStreaming: true,
          validate: (req: unknown) => {
            if (typeof req !== 'object') throw new Error('Invalid request.');
            if (!req) throw new Error('Invalid request.');
            if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
          },
          call$: (ctx, req$) => req$.pipe(map(req => (req as {num: number}).num * 2)),
        }),
      });
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestCompleteMessage(1, 'test', {GG: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {
        error: {
          message: 'Invalid request.',
        },
      }));
    });

    test('errors stream on second data message invalid', async () => {
      const {server, send} = setup({
        onCall: () => ({
          isStreaming: true,
          validate: (req: unknown) => {
            if (typeof req !== 'object') throw new Error('Invalid request.');
            if (!req) throw new Error('Invalid request.');
            if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
          },
          call$: (ctx, req$) => req$.pipe(map(req => (req as {num: number}).num * 2)),
        }),
      });
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
      expect(send.mock.calls[1][0][0]).toEqual(new ResponseErrorMessage(1, {
        error: {
          message: 'Invalid request.',
        },
      }));
    });

    test('when second data message validation fails errors request$ observable', async () => {
      const next = jest.fn();
      const error = jest.fn();
      const complete = jest.fn();
      const {server, send} = setup({
        onCall: () => ({
          isStreaming: true,
          validate: (req: unknown) => {
            if (typeof req !== 'object') throw new Error('Invalid request.');
            if (!req) throw new Error('Invalid request.');
            if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
          },
          call$: (ctx, req$) => {
            req$.subscribe({next, error, complete});
            const subject = new Subject();
            return subject;
          },
        }),
      });
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
      expect(error).toHaveBeenCalledWith(new Error('Invalid request.'))
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {
        error: {
          message: 'Invalid request.',
        },
      }));
    });

    test('when first data message validation fails errors request$ observable', async () => {
      const next = jest.fn();
      const error = jest.fn();
      const complete = jest.fn();
      const {server, send} = setup({
        onCall: () => ({
          isStreaming: true,
          validate: (req: unknown) => {
            if (typeof req !== 'object') throw new Error('Invalid request.');
            if (!req) throw new Error('Invalid request.');
            if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
          },
          call$: (ctx, req$) => {
            req$.subscribe({next, error, complete});
            const subject = new Subject();
            return subject;
          },
        }),
      });
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestDataMessage(1, 'test', {INVALID: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(0);
      expect(error).toHaveBeenCalledTimes(1);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith(new Error('Invalid request.'))
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {
        error: {
          message: 'Invalid request.',
        },
      }));
    });

    test('when first RequestCompleteMessage validation fails errors request$ observable', async () => {
      const next = jest.fn();
      const error = jest.fn();
      const complete = jest.fn();
      const {server, send} = setup({
        onCall: () => ({
          isStreaming: true,
          validate: (req: unknown) => {
            if (typeof req !== 'object') throw new Error('Invalid request.');
            if (!req) throw new Error('Invalid request.');
            if (typeof (req as {num: number}).num !== 'number') throw new Error('Invalid request.');
          },
          call$: (ctx, req$) => {
            req$.subscribe({next, error, complete});
            const subject = new Subject();
            return subject;
          },
        }),
      });
      expect(send).toHaveBeenCalledTimes(0);

      server.onMessage(new RequestCompleteMessage(1, 'test', {INVALID: 5}), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(0);
      expect(error).toHaveBeenCalledTimes(1);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith(new Error('Invalid request.'))
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {
        error: {
          message: 'Invalid request.',
        },
      }));
    });
  });
});

describe('pre-call checks', () => {
  describe('static method', () => {
    test('proceeds with call when pre-call checks pass', async () => {
      const onPreCall = jest.fn(async (method, ctx, request) => {});
      const {server, send} = setup({
        onPreCall,
        onCall: () => ({
          isStreaming: false,
          call: async (ctx, req) => (req as {num: number}).num * 2,
        }),
      });
      expect(send).toHaveBeenCalledTimes(0);

      expect(onPreCall).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestCompleteMessage(1, 'test', {num: 6}), {foo: 'bar'});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseCompleteMessage(1, 12));

      expect(onPreCall).toHaveBeenCalledTimes(1);
      expect(onPreCall).toHaveBeenCalledWith('test', {foo: 'bar'}, {num: 6});
    });

    test('fails call when pre-call checks fail', async () => {
      const onPreCall = jest.fn(async (method, ctx, request) => {
        throw new Error('fail...');
      });
      const {server, send} = setup({
        onPreCall,
        onCall: () => ({
          isStreaming: false,
          call: async (ctx, req) => (req as {num: number}).num * 2,
        }),
      });
      expect(send).toHaveBeenCalledTimes(0);

      expect(onPreCall).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestCompleteMessage(1, 'test', {num: 6}), {foo: 'bar'});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseErrorMessage(1, {error: {message: 'fail...'}}));

      expect(onPreCall).toHaveBeenCalledTimes(1);
      expect(onPreCall).toHaveBeenCalledWith('test', {foo: 'bar'}, {num: 6});
    });
  });

  describe('streaming method', () => {
    test('proceeds with call when pre-call checks pass', async () => {
      const onPreCall = jest.fn(async (method, ctx, request) => {});
      const {server, send} = setup({
        onPreCall,
        onCall: () => ({
          isStreaming: true,
          call$: (ctx, req$) => from([1, 2]),
        }),
      });
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
      // expect(onPreCall).toHaveBeenCalledWith('test', {foo: 'bar'}, {num: 6});
    });
  });
});

describe('when server stops', () => {
  test('does not emit messages from static calls', async () => {
    const {server, send} = setup();
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'promiseDelay', {}), {});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    server.onMessage(new RequestCompleteMessage(2, 'promiseDelay', {}), {});
    expect(send).toHaveBeenCalledTimes(1);
    server.stop();
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
  });

  test('does not emit messages from streaming calls', async () => {
    const {server, send} = setup();
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'streamDelay', {}), {});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    server.onMessage(new RequestCompleteMessage(2, 'streamDelay', {}), {});
    expect(send).toHaveBeenCalledTimes(1);
    server.stop();
    await new Promise(r => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe('buffering', () => {
  test('batches messages received within buffering window', async () => {
    const {server, send, getRpcMethod, notify, ctx, subject} = setup({
      bufferTime: 1,
      onCall: () => ({
        isStreaming: false,
        call: async () => 123,
      })
    });
    server.onMessage(new RequestCompleteMessage(1, 'method1', Buffer.from('a')), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'method2', Buffer.from('b')), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual(
      [
        new ResponseCompleteMessage(1, 123),
        new ResponseCompleteMessage(2, 123),
      ],
    );
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[0][0][1]).toBeInstanceOf(ResponseCompleteMessage);
  });

  test('batches errors received within buffering window', async () => {
    const {server, send, getRpcMethod, notify, ctx, subject} = setup({bufferTime: 1});
    server.onMessage(new RequestCompleteMessage(1, 'not_exist_1', Buffer.from('a')), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'not_exist_2', Buffer.from('b')), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual(
      [
        new ResponseErrorMessage(1, JSON.stringify({code: RpcServerError.MethodNotFound})),
        new ResponseErrorMessage(2, JSON.stringify({code: RpcServerError.MethodNotFound})),
      ],
    );
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
    expect(send.mock.calls[0][0][1]).toBeInstanceOf(ResponseErrorMessage);
  });

  test('does not batch consecutive messages when buffering is disabled', async () => {
    const {server, send, getRpcMethod, notify, ctx, subject} = setup({
      bufferTime: 0,
      onCall: () => ({
        isStreaming: false,
        call: async () => 123,
      })
    });
    server.onMessage(new RequestCompleteMessage(1, 'not_exist_1', Buffer.from('a')), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'not_exist_2', Buffer.from('b')), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual(
      [
        new ResponseCompleteMessage(1, 123),
      ],
    );
    expect(send.mock.calls[1][0]).toEqual(
      [
        new ResponseCompleteMessage(2, 123),
      ],
    );
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseCompleteMessage);
  });

  test('does not batch messages when they are far apart', async () => {
    const {server, send, getRpcMethod, notify, ctx, subject} = setup({
      bufferTime: 1,
      onCall: () => ({
        isStreaming: false,
        call: async () => 123,
      })
    });
    server.onMessage(new RequestCompleteMessage(1, 'not_exist_1', Buffer.from('a')), {ctx: 1});
    await new Promise((r) => setTimeout(r, 10));
    server.onMessage(new RequestCompleteMessage(2, 'not_exist_2', Buffer.from('b')), {ctx: 2});
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual(
      [
        new ResponseCompleteMessage(1, 123),
      ],
    );
    expect(send.mock.calls[1][0]).toEqual(
      [
        new ResponseCompleteMessage(2, 123),
      ],
    );
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseCompleteMessage);
  });

  test('batches and sends out messages when buffer is filled up', async () => {
    const {server, send, getRpcMethod, notify, ctx, subject} = setup({
      bufferTime: 100,
      bufferSize: 2,
      onCall: () => ({
        isStreaming: false,
        call: async () => 123,
      })
    });
    server.onMessage(new RequestCompleteMessage(1, 'method1', Buffer.from('a')), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'method2', Buffer.from('b')), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual(
      [
        new ResponseCompleteMessage(1, 123),
        new ResponseCompleteMessage(2, 123),
      ],
    );
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[0][0][1]).toBeInstanceOf(ResponseCompleteMessage);
  });
});
