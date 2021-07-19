import {timer, from, firstValueFrom, lastValueFrom} from 'rxjs';
import {RpcClient} from '../RpcClient';
import {RpcMethodStatic, RpcMethodStreaming} from '../types';
import {of} from '../../util/of';
import {RpcServerError} from '../constants';
import {map, switchMap, take} from 'rxjs/operators';

const ping: RpcMethodStatic<object, void, 'pong'> = {
  isStreaming: false,
  call: async () => {
    return 'pong';
  },
};

const delay: RpcMethodStatic<object, {timeout?: number}, {done: true, timeout: number}> = {
  isStreaming: false,
  call: async (ctx, {timeout = 10}: {timeout?: number} = {}) => {
    await new Promise(r => setTimeout(r, timeout));
    return {
      done: true,
      timeout,
    };
  },
};

const delayStreaming: RpcMethodStreaming<object, {timeout?: number}, {done: true, timeout: number}> = {
  isStreaming: true,
  call$: (ctx, req$) => {
    return req$
      .pipe(
        take(1),
        switchMap(({timeout = 10}: {timeout?: number} = {}) => {
          return from(new Promise<number>(r => {
            setTimeout(() => {
              r(timeout);
            }, timeout);
          }));
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

const getUser: RpcMethodStatic<object, {id: string}, {id: string, name: string, tags: string[]}> = {
  isStreaming: false,
  call: async (ctx, request) => {
    return {
      id: request.id,
      name: 'Mario Dragi',
      tags: ['news', 'cola', 'bcaa']
    };
  },
};

const streamError: RpcMethodStreaming<object, void, void> = {
  isStreaming: true,
  call$: () => from((async () => {
    throw new Error('Stream always errors');
  })()),
};

const utilTimer: RpcMethodStreaming<object, void, number> = {
  isStreaming: true,
  call$: (ctx, request$) => timer(10, 10),
};

const buildinfo: RpcMethodStreaming<object, void, {commit: string, sha1: string}> = {
  isStreaming: true,
  call$: (ctx, request$) => from([{
    commit: 'AAAAAAAAAAAAAAAAAAA',
    sha1: 'BBBBBBBBBBBBBBBBBBB',
  }]),
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

export const sampleApi = {
  ping,
  delay,
  delayStreaming,
  double,
  error,
  streamError,
  'auth.users.get': getUser,
  'util.info': buildinfo,
  'util.timer': utilTimer,
  doubleStringWithValidation,
  doubleStringWithValidation2,
};

export interface ApiTestSetupResult {
  client: Pick<RpcClient, 'call$'>;
};

export type ApiTestSetup = () => ApiTestSetupResult | Promise<ApiTestSetupResult>;

export const runApiTests = (setup: ApiTestSetup) => {
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

  describe('delay', () => {
    test('enforces max in-flight calls', async () => {
      const {client} = await setup();
      const promise1 = of(firstValueFrom(client.call$('delay', {})));
      const promise2 = of(firstValueFrom(client.call$('delay', {})));
      const promise3 = of(firstValueFrom(client.call$('delay', {})));
      const promise4 = of(firstValueFrom(client.call$('delay', {})));
      const [res1, res2, res3, res4] = await Promise.all([promise1, promise2, promise3, promise4]);
      expect(res1[0]).toBe('done');
      expect(res2[0]).toBe('done');
      expect(res3[0]).toBe('done');
      expect(res4[1]).toMatchObject({
        message: 'PROTOCOL',
        errno: RpcServerError.TooManyActiveCalls,
        code: 'TooManyActiveCalls',
      });
    });
  });

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
        message: 'Payload .num field missing.'
      });
    });
  });

  describe('error', () => {
    test('throws error on static RPC error', async () => {
      const {client} = await setup();
      const [, error] = await of(firstValueFrom(client.call$('error', {})));
      expect(error).toEqual({message: 'this promise can throw'});
    });
  });

  describe('streamError', () => {
    test('throws error on streaming RPC error', async () => {
      const {client} = await setup();
      const [, error] = await of(lastValueFrom(client.call$('streamError', {})));
      expect(error).toEqual({"message": "Stream always errors"});
    });
  });

  describe('util.info', () => {
    test('can receive one value of stream that ends after emitting one value', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('util.info', {}));
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
      expect(error).toEqual({
        code: 'InvalidData',
        errno: 3,
        message: '"foo" property missing.',
        status: 0,
      });
    });
  });

  describe('doubleStringWithValidation2', () => {
    test('can execute successfully', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('doubleStringWithValidation2', {foo: 'a'}));
      expect(result).toEqual({
        bar: 'aa',
      });
    });

    test('throws on invalid data', async () => {
      const {client} = await setup();
      const [, error] = await of(firstValueFrom(client.call$('doubleStringWithValidation2', {foo: 123})));
      expect(error).toEqual({
        code: 'InvalidData',
        errno: 3,
        message: '"foo" property missing.',
        status: 0,
      });
    });
  });
};
