import {timer, from, firstValueFrom, lastValueFrom, Subject, EMPTY, Observable} from 'rxjs';
import {map, mapTo, switchMap, take, delay as rxDelay} from 'rxjs/operators';
import {RpcClient} from '../RpcClient';
import {RpcMethodStatic, RpcMethodStreaming} from '../types';
import {of} from '../../util/of';
import {RpcServerError} from '../constants';
import {until} from '../../../../__tests__/util';

const ping: RpcMethodStatic<object, void, 'pong'> = {
  isStreaming: false,
  call: async () => {
    return 'pong';
  },
};

const delay: RpcMethodStatic<object, {timeout?: number}, {done: true; timeout: number}> = {
  isStreaming: false,
  call: async (ctx, {timeout = 10}: {timeout?: number} = {}) => {
    await new Promise((r) => setTimeout(r, timeout));
    return {
      done: true,
      timeout,
    };
  },
};

const delayStreaming: RpcMethodStreaming<object, {timeout?: number}, {done: true; timeout: number}> = {
  isStreaming: true,
  call$: (ctx, req$) => {
    return req$.pipe(
      take(1),
      switchMap(({timeout = 10}: {timeout?: number} = {}) => {
        return from(
          new Promise<number>((r) => {
            setTimeout(() => {
              r(timeout);
            }, timeout);
          }),
        );
      }),
      map((timeout: number) => ({
        done: true,
        timeout,
      })),
    );
  },
};

const double: RpcMethodStatic<object, {num: number}, {num: number}> = {
  isStreaming: false,
  validate: (data: {num: number}) => {
    if (typeof data !== 'object') throw new Error('Payload must be object.');
    if (data === null) throw new Error('Payload cannot be null.');
    if (typeof data.num !== 'number') throw new Error('Payload .num field missing.');
  },
  call: async (ctx, {num}) => ({num: num * 2}),
};

const error: RpcMethodStatic<object, void, void> = {
  isStreaming: false,
  call: async () => {
    throw 'this promise can throw';
  },
};

const getUser: RpcMethodStatic<object, {id: string}, {id: string; name: string; tags: string[]}> = {
  isStreaming: false,
  call: async (ctx, request) => {
    return {
      id: request.id,
      name: 'Mario Dragi',
      tags: ['news', 'cola', 'bcaa'],
    };
  },
};

const streamError: RpcMethodStreaming<object, void, void> = {
  isStreaming: true,
  call$: () =>
    from(
      (async () => {
        throw new Error('Stream always errors');
      })(),
    ),
};

const utilTimer: RpcMethodStreaming<object, void, number> = {
  isStreaming: true,
  call$: (ctx, request$) => timer(10, 10),
};

const buildinfo: RpcMethodStreaming<object, void, {commit: string; sha1: string}> = {
  isStreaming: true,
  call$: (ctx, request$) =>
    from([
      {
        commit: 'AAAAAAAAAAAAAAAAAAA',
        sha1: 'BBBBBBBBBBBBBBBBBBB',
      },
    ]),
};

const count: RpcMethodStreaming<object, {count: number}, number> = {
  isStreaming: true,
  call$: (ctx, request$) => {
    return request$.pipe(
      switchMap(
        ({count}) =>
          new Observable<number>((observer) => {
            let cnt = 0;
            const timer = setInterval(() => {
              observer.next(cnt++);
              if (cnt >= count) {
                observer.complete();
                clearInterval(timer);
              }
            }, 10);
            return () => {
              clearInterval(timer);
            };
          }),
      ),
    );
  },
};

const doubleStringWithValidation: RpcMethodStatic<object, {foo: string}, {bar: string}> = {
  isStreaming: false,
  validate: (request) => {
    if (!request || typeof request !== 'object') throw new Error('Request must be object.');
    if (typeof request.foo !== 'string') throw new Error('"foo" property missing.');
  },
  call: async (ctx, {foo}) => {
    return {bar: foo + foo};
  },
};

const doubleStringWithValidation2: RpcMethodStreaming<object, {foo: string}, {bar: string}> = {
  isStreaming: true,
  validate: (request) => {
    if (!request || typeof request !== 'object') throw new Error('Request must be object.');
    if (typeof request.foo !== 'string') throw new Error('"foo" property missing.');
  },
  call$: (ctx, req$) => {
    return req$.pipe(map(({foo}) => ({bar: foo + foo})));
  },
};

const timeout100: RpcMethodStreaming<object, null | number, null> = {
  isStreaming: true,
  timeout: 100,
  call$: (ctx, req$) => {
    return req$.pipe(
      switchMap((req) => (typeof req === 'number' ? from([1]).pipe(rxDelay(req)) : EMPTY)),
      mapTo(null),
    );
  },
};

const passthroughStream: RpcMethodStreaming<object, unknown, unknown> = {
  isStreaming: true,
  call$: (ctx, req$) => req$,
};

export const sampleApi = {
  ping,
  delay,
  delayStreaming,
  double,
  count,
  error,
  streamError,
  'auth.users.get': getUser,
  'util.info': buildinfo,
  'util.timer': utilTimer,
  doubleStringWithValidation,
  doubleStringWithValidation2,
  timeout100,
  passthroughStream,
};

export interface ApiTestSetupResult {
  client: Pick<RpcClient, 'call$'>;
}

export type ApiTestSetup = () => ApiTestSetupResult | Promise<ApiTestSetupResult>;

export const runApiTests = (setup: ApiTestSetup, params: {staticOnly?: boolean} = {}) => {
  describe('ping', () => {
    test('can execute static RPC method', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('ping', {}));
      expect(result).toBe('pong');
    });

    test('can execute without payload', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('ping', undefined));
      expect(result).toBe('pong');
    });

    test('can execute with unexpected payload', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('ping', 'VERY_UNEXPECTED'));
      expect(result).toBe('pong');
    });
  });

  if (!params.staticOnly) {
    describe('delay', () => {
      test('enforces max in-flight calls', async () => {
        const {client} = await setup();
        const promise1 = of(firstValueFrom(client.call$('delay', {})));
        const promise2 = of(firstValueFrom(client.call$('delay', {})));
        const promise3 = of(firstValueFrom(client.call$('delay', {})));
        const promise4 = of(firstValueFrom(client.call$('delay', {})));
        const [res1, res2, res3, res4] = await Promise.all([promise1, promise2, promise3, promise4]);
        expect(res1[0]).toEqual({done: true, timeout: 10});
        expect(res2[0]).toEqual({done: true, timeout: 10});
        expect(res3[0]).toEqual({done: true, timeout: 10});
        expect(res4[1]).toMatchObject({
          message: 'PROTOCOL',
          errno: RpcServerError.TooManyActiveCalls,
          code: 'TooManyActiveCalls',
        });
      });
    });
  }

  describe('double', () => {
    test('can execute simple "double" method', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('double', {num: 1.2}));
      expect(result).toEqual({num: 2.4});
    });

    test('can execute two request in parallel', async () => {
      const {client} = await setup();
      const promise1 = of(firstValueFrom(client.call$('double', {num: 1})));
      const promise2 = of(firstValueFrom(client.call$('double', {num: 2})));
      const [res1, res2] = await Promise.all([promise1, promise2]);
      expect(res1[0]).toEqual({num: 2});
      expect(res2[0]).toEqual({num: 4});
    });

    test('throws error when validation fails', async () => {
      const {client} = await setup();
      const [, error] = await of(firstValueFrom(client.call$('double', {num: {}})));
      expect(error).toMatchObject({
        message: 'Payload .num field missing.',
      });
    });
  });

  describe('error', () => {
    test('throws error on static RPC error', async () => {
      const {client} = await setup();
      const [, error] = await of(firstValueFrom(client.call$('error', {})));
      expect(error).toMatchObject({message: 'this promise can throw'});
    });
  });

  describe('streamError', () => {
    test('throws error on streaming RPC error', async () => {
      const {client} = await setup();
      const [, error] = await of(lastValueFrom(client.call$('streamError', {})));
      expect(error).toMatchObject({message: 'Stream always errors'});
    });
  });

  describe('util.info', () => {
    test('can receive one value of stream that ends after emitting one value', async () => {
      const {client} = await setup();
      const observable = client.call$('util.info', {});
      const result = await firstValueFrom(observable);
      expect(result).toEqual({
        commit: 'AAAAAAAAAAAAAAAAAAA',
        sha1: 'BBBBBBBBBBBBBBBBBBB',
      });
    });
  });

  describe('doubleStringWithValidation', () => {
    test('can execute successfully', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('doubleStringWithValidation', {foo: 'a'}));
      expect(result).toEqual({
        bar: 'aa',
      });
    });

    test('throws on invalid data', async () => {
      const {client} = await setup();
      const [, error] = await of(firstValueFrom(client.call$('doubleStringWithValidation', {foo: 123})));
      expect(error).toMatchObject({
        message: '"foo" property missing.',
      });
    });
  });

  // We loop here to check for memory leaks.
  for (let i = 0; i < 5; i++) {
    describe(`doubleStringWithValidation2, iteration ${i + 1}`, () => {
      test('can execute successfully', async () => {
        const {client} = await setup();
        const result = await firstValueFrom(client.call$('doubleStringWithValidation2', {foo: 'a'}));
        await new Promise((r) => setTimeout(r, 15));
        expect(result).toEqual({
          bar: 'aa',
        });
      });

      test('throws on invalid data', async () => {
        const {client} = await setup();
        const [, error] = await of(firstValueFrom(client.call$('doubleStringWithValidation2', {foo: 123})));
        expect(error).toMatchObject({
          message: '"foo" property missing.',
        });
      });
    });
  }

  if (!params.staticOnly) {
    describe('timeout100', () => {
      test('throws timeout error after 100ms of inactivity', async () => {
        const {client} = await setup();
        const subject = new Subject<any>();
        const response = client.call$('timeout100', subject);
        const next = jest.fn();
        const error = jest.fn();
        response.subscribe({next, error});
        subject.next(null);
        await new Promise((r) => setTimeout(r, 1));
        expect(next).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenCalledTimes(0);
        await new Promise((r) => setTimeout(r, 120));
        await until(() => error.mock.calls.length === 1);
        expect(next).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenCalledTimes(1);
        expect(error.mock.calls[0][0]).toEqual({
          message: 'PROTOCOL',
          code: 'Timeout',
          errno: RpcServerError.Timeout,
        });
      });

      test('does not throw error if request was active', async () => {
        const {client} = await setup();
        const subject = new Subject<any>();
        const response = client.call$('timeout100', subject);
        const next = jest.fn();
        const error = jest.fn();
        response.subscribe({next, error});
        subject.next(null);
        await new Promise((r) => setTimeout(r, 1));
        expect(next).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenCalledTimes(0);
        await new Promise((r) => setTimeout(r, 40));
        subject.next(null);
        await new Promise((r) => setTimeout(r, 80));
        expect(next).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenCalledTimes(0);
      });

      test('does not throw error if response was active', async () => {
        const {client} = await setup();
        const subject = new Subject<any>();
        const response = client.call$('timeout100', subject);
        const next = jest.fn();
        const error = jest.fn();
        response.subscribe({next, error});
        subject.next(40);
        await new Promise((r) => setTimeout(r, 1));
        expect(next).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenCalledTimes(0);
        await new Promise((r) => setTimeout(r, 120));
        expect(error).toHaveBeenCalledTimes(0);
        expect(next).toHaveBeenCalledTimes(1);
      });
    });
  }
};
