import {RpcMessageStreamProcessor, RpcMessageStreamProcessorOptions} from '../RpcMessageStreamProcessor';
import {RpcError, RpcErrorCodes} from '../caller';
import {of, from, Subject, Observable, Subscriber} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {ApiRpcCaller, ApiRpcCallerOptions} from '../caller/ApiRpcCaller';
import {
  NotificationMessage,
  RequestCompleteMessage,
  RequestDataMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
} from '../../messages';
import {until} from '../../../../__tests__/util';
import {Value} from '../../messages/Value';
import {t} from '../../../../json-type';
import {Defer} from '../../../../util/Defer';

const setup = (
  params: Partial<RpcMessageStreamProcessorOptions> = {},
  callerParams: Partial<ApiRpcCallerOptions<any, any>> = {},
) => {
  const send = jest.fn();
  const subject = new Subject<any>();
  let token: string = '';
  const ctx = {ip: '127.0.0.1'};
  const caller = new ApiRpcCaller<any, any>({
    api: {
      setToken: {
        isStreaming: false,
        call: (tkn: string) => {
          token = tkn;
        },
        res: t.Const(undefined),
      },
      // test: {
      //   isStreaming: false,
      //   call: () => {},
      //   res: t.Const(undefined),
      // },
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
          // tslint:disable-next-line:no-string-throw
          throw RpcError.internal('this promise can throw');
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
          throw RpcError.internal('this promise can throw');
        },
      },
      emitOnceSync: {
        isStreaming: true,
        call$: (request$: any, ctx: any) => {
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
        call$: (request$: any) => {
          const obs = request$.pipe(
            take(1),
            switchMap((request) => from([new Uint8Array([1]), new Uint8Array([2]), new Uint8Array([3])])),
          );
          return obs;
        },
      },
      subject: {
        isStreaming: true,
        call$: (request$: any) => {
          return subject;
        },
      },
      echo: {
        isStreaming: false,
        call: (payload: any) => {
          return Promise.resolve(payload);
        },
      },
      double: {
        isStreaming: true,
        call$: (request$: any) =>
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
  const server = new RpcMessageStreamProcessor<any>({
    send,
    caller,
    bufferTime: 0,
    ...params,
  });
  return {server, send, caller, ctx, subject};
};

const val = <T>(value: T) => new Value<T>(value, undefined);

test('can create server', async () => {
  setup();
});

test('does not execute any methods on initialization', async () => {
  const {send} = setup();
  expect(send).toHaveBeenCalledTimes(0);
});

test('sends error notification on empty notification name', async () => {
  const {server, send} = setup();
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages([new NotificationMessage('', val(new Uint8Array([1])))], undefined);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(NotificationMessage);
  expect(send.mock.calls[0][0][0].value.data).toEqual(RpcError.fromCode(RpcErrorCodes.INVALID_METHOD));
});

test('sends error notification when notification name longer than 128 chars', async () => {
  const {server, send} = setup();
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessages(
    [
      new NotificationMessage(
        '012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678',
        val(new Uint8Array([1])),
      ),
    ],
    undefined,
  );
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(NotificationMessage);
  expect(send.mock.calls[0][0][0].value.data).toEqual(RpcError.fromCode(RpcErrorCodes.INVALID_METHOD));
});

// test('sends error notification when "notify" callback throws', async () => {
//   const {server, send} = setup({});
//   const name = 'aga';
//   expect(send).toHaveBeenCalledTimes(0);
//   const msg = [new NotificationMessage(name, val(new Uint8Array([1])))];
//   server.onMessages(msg, undefined);
//   expect(send).toHaveBeenCalledTimes(1);
//   // expect(send.mock.calls[0][0][0]).toBeInstanceOf(NotificationMessage);
//   // expect(send.mock.calls[0][0][0].value).toEqual(val({
//   //   message: 'test',
//   // }));
// });

test('if RPC method throws, sends back error message', async () => {
  const {server, send, caller, ctx} = setup();
  jest.spyOn(caller, 'call');
  expect(send).toHaveBeenCalledTimes(0);
  const message = new RequestCompleteMessage(1, 'error', val(new Uint8Array([2])));
  server.onMessages([message], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
  expect(send.mock.calls[0][0][0].value.data.message).toBe('this promise can throw');
});

test('sends complete message if observable immediately completes after emitting one value', async () => {
  const {server, send, caller, ctx} = setup();
  jest.spyOn(caller, 'createCall');
  server.onMessages([new RequestCompleteMessage(25, 'emitOnceSync', val({foo: 'bar'}))], ctx);
  await until(() => (caller.createCall as any).mock.calls.length === 1);
  expect(caller.createCall).toHaveBeenCalledTimes(1);
  await until(() => send.mock.calls.length === 1);
  expect(send).toHaveBeenCalledTimes(1);
  const msg = send.mock.calls[0][0][0];
  expect(msg).toBeInstanceOf(ResponseCompleteMessage);
  expect(msg.id).toBe(25);
  expect(msg.value.data).toEqual(
    JSON.stringify({
      request: {foo: 'bar'},
      ctx: {ip: '127.0.0.1'},
    }),
  );
});

test('observable emits three values synchronously', async () => {
  const {server, send, caller} = setup();
  jest.spyOn(caller, 'createCall');
  server.onMessages([new RequestCompleteMessage(123, 'emitThreeSync', val(new Uint8Array([0])))], undefined);
  await new Promise((r) => setTimeout(r, 1));
  expect(caller.createCall).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(3);
  expect(send.mock.calls[0][0]).toEqual([new ResponseDataMessage(123, val(new Uint8Array([1])))]);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseDataMessage);
  expect(send.mock.calls[1][0]).toEqual([new ResponseDataMessage(123, val(new Uint8Array([2])))]);
  expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseDataMessage);
  expect(send.mock.calls[2][0]).toEqual([new ResponseCompleteMessage(123, val(new Uint8Array([3])))]);
  expect(send.mock.calls[2][0][0]).toBeInstanceOf(ResponseCompleteMessage);
});

test('when observable completes asynchronously, sends empty complete message', async () => {
  const {server, send, caller, subject} = setup();
  jest.spyOn(caller, 'createCall');
  server.onMessages([new RequestCompleteMessage(123, 'subject', val(new Uint8Array([0])))], undefined);
  subject.next(new Uint8Array([1]));
  subject.next(new Uint8Array([2]));
  subject.next(new Uint8Array([3]));
  await new Promise((r) => setTimeout(r, 1));
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(caller.createCall).toHaveBeenCalledTimes(1);
  await until(() => send.mock.calls.length === 4);
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual([new ResponseDataMessage(123, val(new Uint8Array([1])))]);
  expect(send.mock.calls[1][0]).toEqual([new ResponseDataMessage(123, val(new Uint8Array([2])))]);
  expect(send.mock.calls[2][0]).toEqual([new ResponseDataMessage(123, val(new Uint8Array([3])))]);
  expect(send.mock.calls[3][0]).toEqual([new ResponseCompleteMessage(123, undefined)]);
});

test('when observable completes asynchronously and emits asynchronously, sends empty complete message', async () => {
  const {server, send, caller, subject} = setup();
  jest.spyOn(caller, 'createCall');
  server.onMessages([new RequestCompleteMessage(123, 'subject', val(new Uint8Array([0])))], undefined);
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
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls[0][0]).toEqual([new ResponseDataMessage(123, val(new Uint8Array([1])))]);
  expect(send.mock.calls[1][0]).toEqual([new ResponseDataMessage(123, val(new Uint8Array([2])))]);
  expect(send.mock.calls[2][0]).toEqual([new ResponseDataMessage(123, val(new Uint8Array([3])))]);
  expect(send.mock.calls[3][0]).toEqual([new ResponseCompleteMessage(123, undefined)]);
});

test('call can return a promise', async () => {
  const {server, send, caller} = setup();
  jest.spyOn(caller, 'call');
  expect(caller.call).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'promise', val(new Uint8Array([1, 2, 3])))], {});
  expect(caller.call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(3, val('this is promise result'))]);
});

test('sends error message if promise throws', async () => {
  const {server, send, caller} = setup();
  jest.spyOn(caller, 'call');
  expect(caller.call).toHaveBeenCalledTimes(0);
  server.onMessages([new RequestCompleteMessage(3, 'promiseError', val(new Uint8Array([1, 2, 3])))], {});
  expect(caller.call).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0].value.data.message).toBe('this promise can throw');
});

test('can add authentication on as higher level API', async () => {
  const {server, send} = setup();
  server.onMessage(new NotificationMessage('setToken', val('1234')), {});
  server.onMessage(new RequestCompleteMessage(1, 'getToken', val({})), {});
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, val('1234'))]);
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
  server.onMessage(new RequestCompleteMessage(1, 'foo', val({})), undefined);
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
  server.onMessage(new RequestCompleteMessage(1, 'foo', val(undefined)), undefined);
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
  server.onMessage(new RequestDataMessage(1, 'foo', val({})), {});
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
            call: async (req: any) => (req as {num: number}).num * 2,
          },
        },
      },
    );
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'test', val({num: 3})), {});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
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
            call: async (req: any) => (req as {num: number}).num * 2,
          },
        },
      },
    );
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'test', val({gg: 3})), {});
    await new Promise((r) => setTimeout(r, 1));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
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
              call$: (req$: any) => req$.pipe(map((req) => (req as {num: number}).num * 2)),
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestDataMessage(1, 'test', val({num: 5})), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseDataMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseDataMessage(1, val(10)));
      server.onMessage(new RequestDataMessage(1, 'test', val({num: 25})), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(2);
      expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseDataMessage);
      expect(send.mock.calls[1][0][0]).toEqual(new ResponseDataMessage(1, val(50)));
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

      server.onMessage(new RequestDataMessage(1, 'test', val({GG: 5})), {});
      await new Promise((r) => setTimeout(r, 1));

      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0].value.data.message).toBe('Bad Request');
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
              call$: (req$: any) => req$.pipe(map((req) => (req as {num: number}).num * 2)),
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestCompleteMessage(1, 'test', val({GG: 5})), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0].value.data.message).toBe('Bad Request');
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
              call$: (req$: any) => req$.pipe(map((req) => (req as {num: number}).num * 2)),
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestDataMessage(1, 'test', val({num: 5})), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseDataMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseDataMessage(1, val(10)));

      server.onMessage(new RequestDataMessage(1, 'test', val({GG: 5})), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(2);
      expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[1][0][0].value.data.message).toBe('Bad Request');
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
              call$: (req$: any) => {
                req$.subscribe({next, error, complete});
                const subject = new Subject();
                return subject;
              },
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestDataMessage(1, 'test', val({num: 5})), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledTimes(0);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestDataMessage(1, 'test', val({INVALID: 5})), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledTimes(1);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0].value.data.message).toBe('Bad Request');
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
              call$: (req$: any) => {
                req$.subscribe({next, error, complete});
                const subject = new Subject();
                return subject;
              },
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestDataMessage(1, 'test', val({INVALID: 5})), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(0);
      expect(error).toHaveBeenCalledTimes(0);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0].value.data.message).toBe('Bad Request');
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
              call$: (req$: any) => {
                req$.subscribe({next, error, complete});
                const subject = new Subject();
                return subject;
              },
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestCompleteMessage(1, 'test', val({INVALID: 5})), {});
      await new Promise((r) => setTimeout(r, 1));
      expect(next).toHaveBeenCalledTimes(0);
      expect(error).toHaveBeenCalledTimes(0);
      expect(complete).toHaveBeenCalledTimes(0);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0].value.data.message).toBe('Bad Request');
    });
  });
});

describe('pre-call checks', () => {
  describe('static method', () => {
    test('proceeds with call when pre-call checks pass', async () => {
      const onPreCall = jest.fn(async (request) => {});
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: false,
              onPreCall,
              call: async (req: any) => (req as {num: number}).num * 2,
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);
      expect(onPreCall).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestCompleteMessage(1, 'test', val({num: 6})), {foo: 'bar'});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseCompleteMessage(1, val(12)));
      expect(onPreCall).toHaveBeenCalledTimes(1);
      expect(onPreCall).toHaveBeenCalledWith({foo: 'bar'}, {num: 6});
    });

    test('fails call when pre-call checks fail', async () => {
      const onPreCall = jest.fn(async (request) => {
        throw RpcError.internal('fail...');
      });
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: false,
              onPreCall,
              call: async (req: any) => (req as {num: number}).num * 2,
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);
      expect(onPreCall).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestCompleteMessage(1, 'test', val({num: 6})), {foo: 'bar'});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
      expect(send.mock.calls[0][0][0].value.data.message).toEqual('fail...');
      expect(onPreCall).toHaveBeenCalledTimes(1);
      expect(onPreCall).toHaveBeenCalledWith({foo: 'bar'}, {num: 6});
    });
  });

  describe('streaming method', () => {
    test('proceeds with call when pre-call checks pass', async () => {
      const onPreCall = jest.fn(async (request) => {});
      const {server, send} = setup(
        {},
        {
          api: {
            test: {
              isStreaming: true,
              onPreCall,
              call$: (req$: any) => from([1, 2]),
            },
          },
        },
      );
      expect(send).toHaveBeenCalledTimes(0);
      expect(onPreCall).toHaveBeenCalledTimes(0);
      server.onMessage(new RequestDataMessage(1, 'test', val({a: 'b'})), {foo: 'bar'});
      await new Promise((r) => setTimeout(r, 1));
      expect(send).toHaveBeenCalledTimes(2);
      expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseDataMessage);
      expect(send.mock.calls[1][0][0]).toBeInstanceOf(ResponseCompleteMessage);
      expect(send.mock.calls[0][0][0]).toEqual(new ResponseDataMessage(1, val(1)));
      expect(send.mock.calls[1][0][0]).toEqual(new ResponseCompleteMessage(1, val(2)));
      expect(onPreCall).toHaveBeenCalledTimes(1);
      expect(onPreCall).toHaveBeenCalledWith({foo: 'bar'}, {a: 'b'});
    });

    describe('request buffer', () => {
      test('buffer size is 10 by default', async () => {
        const preCallFuture = new Defer();
        const onPreCall = jest.fn(async (request) => {
          await preCallFuture.promise;
        });
        const {server, send} = setup(
          {},
          {
            api: {
              test: {
                isStreaming: true,
                onPreCall,
                call$: (req$: any) => from([1, 2]),
                validate: () => {},
              },
            },
          },
        );
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '1'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '2'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '3'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '4'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '5'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '6'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '7'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '8'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '9'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '10'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '11'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
        expect(send.mock.calls[0][0][0].value.data.message).toBe('BUFFER_OVERFLOW');
      });

      test('buffer size can be set to 5 for the whole server', async () => {
        const preCallFuture = new Defer();
        const onPreCall = jest.fn(async (request) => {
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
                call$: (req$: any) => from([1, 2]),
                validate: () => {},
              },
            },
          },
        );
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '1'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '2'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '3'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '4'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '5'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '6'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
        expect(send.mock.calls[0][0][0].value.data.message).toBe('BUFFER_OVERFLOW');
      });

      test('buffer size can be set to 5 per method', async () => {
        const preCallFuture = new Defer();
        const onPreCall = jest.fn(async (request) => {
          await preCallFuture.promise;
        });
        const {server, send} = setup(
          {},
          {
            api: {
              test: {
                isStreaming: true,
                onPreCall,
                call$: (req$: any) => from([1, 2]),
                validate: () => {},
                preCallBufferSize: 5,
              },
            },
          },
        );
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '1'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '2'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '3'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '4'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '5'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '6'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
        expect(send.mock.calls[0][0][0].value.data.message).toBe('BUFFER_OVERFLOW');
      });

      test('when pre-call checks finish just before buffer is full, can receive more request data', async () => {
        const preCallFuture = new Defer();
        const response$ = new Subject();
        const onPreCall = jest.fn(async (request) => {
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
                call$: (req$: any) => {
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
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '1'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '2'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '3'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '4'})), {foo: 'bar'});
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '5'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        expect(send).toHaveBeenCalledTimes(0);
        expect(next).toHaveBeenCalledTimes(0);
        preCallFuture.resolve(undefined);
        await new Promise((r) => setTimeout(r, 1));
        expect(next).toHaveBeenCalledTimes(5);
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '6'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '7'})), {foo: 'bar'});
        await new Promise((r) => setTimeout(r, 1));
        server.onMessage(new RequestDataMessage(1, 'test', val({a: '8'})), {foo: 'bar'});
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
    server.onMessage(new RequestCompleteMessage(1, 'promiseDelay', val({})), {});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    server.onMessage(new RequestCompleteMessage(2, 'promiseDelay', val({})), {});
    expect(send).toHaveBeenCalledTimes(1);
    server.stop();
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
  });

  test('does not emit messages from streaming calls', async () => {
    const {server, send} = setup();
    expect(send).toHaveBeenCalledTimes(0);
    server.onMessage(new RequestCompleteMessage(1, 'streamDelay', val({})), {});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    server.onMessage(new RequestCompleteMessage(2, 'streamDelay', val({})), {});
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
    server.onMessage(new RequestCompleteMessage(1, 'method1', val(Buffer.from('a'))), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'method2', val(Buffer.from('b'))), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual([
      new ResponseCompleteMessage(1, val(123)),
      new ResponseCompleteMessage(2, val(123)),
    ]);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[0][0][1]).toBeInstanceOf(ResponseCompleteMessage);
  });

  test('batches errors received within buffering window', async () => {
    const {server, send} = setup({bufferTime: 1});
    server.onMessage(new RequestCompleteMessage(1, 'not_exist_1', val(Buffer.from('a'))), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'not_exist_2', val(Buffer.from('b'))), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseErrorMessage);
    expect(send.mock.calls[0][0][0].value.data.message).toBe('METHOD_NOT_FOUND');
    expect(send.mock.calls[0][0][1]).toBeInstanceOf(ResponseErrorMessage);
    expect(send.mock.calls[0][0][1].value.data.message).toBe('METHOD_NOT_FOUND');
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
    server.onMessage(new RequestCompleteMessage(1, 'method1', val(Buffer.from('a'))), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'method2', val(Buffer.from('b'))), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, val(123))]);
    expect(send.mock.calls[1][0]).toEqual([new ResponseCompleteMessage(2, val(123))]);
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
    server.onMessage(new RequestCompleteMessage(1, 'method1', val(Buffer.from('a'))), {ctx: 1});
    await new Promise((r) => setTimeout(r, 10));
    server.onMessage(new RequestCompleteMessage(2, 'method2', val(Buffer.from('b'))), {ctx: 2});
    await until(() => send.mock.calls.length === 2);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toEqual([new ResponseCompleteMessage(1, val(123))]);
    expect(send.mock.calls[1][0]).toEqual([new ResponseCompleteMessage(2, val(123))]);
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
    server.onMessage(new RequestCompleteMessage(1, 'method1', val(Buffer.from('a'))), {ctx: 1});
    server.onMessage(new RequestCompleteMessage(2, 'method2', val(Buffer.from('b'))), {ctx: 2});
    expect(send).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual([
      new ResponseCompleteMessage(1, val(123)),
      new ResponseCompleteMessage(2, val(123)),
    ]);
    expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
    expect(send.mock.calls[0][0][1]).toBeInstanceOf(ResponseCompleteMessage);
  });
});
