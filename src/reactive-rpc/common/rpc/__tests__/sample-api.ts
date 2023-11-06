import {timer, from, Observable} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {IStaticRpcMethod, IStreamingRpcMethod} from '../types';
import {t} from '../../../../json-type';
import {RpcError} from '../caller';
import {ApiRpcCaller} from '../caller/ApiRpcCaller';

const ping: IStaticRpcMethod<object, void, 'pong'> = {
  isStreaming: false,
  call: async () => {
    return 'pong';
  },
  res: t.Const('pong'),
};

const delay: IStaticRpcMethod<object, {timeout?: number}, {done: true; timeout: number}> = {
  isStreaming: false,
  call: async ({timeout = 10}: {timeout?: number} = {}) => {
    await new Promise((r) => setTimeout(r, timeout));
    return {
      done: true,
      timeout,
    };
  },
};

let value = 0;

const notificationSetValue: IStaticRpcMethod<object, {value: number}, void> = {
  isStreaming: false,
  call: async (params) => {
    value = params.value;
  },
  res: t.Const(undefined),
};

const getValue: IStaticRpcMethod<object, void, {value: number}> = {
  isStreaming: false,
  call: async () => {
    return {value};
  },
};

const delayStreaming: IStreamingRpcMethod<object, {timeout?: number}, {done: true; timeout: number}> = {
  isStreaming: true,
  call$: (req$) => {
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

const double: IStaticRpcMethod<object, {num: number}, {num: number}> = {
  isStreaming: false,
  validate: (data: {num: number}) => {
    if (typeof data !== 'object') throw RpcError.validation('Payload must be object.');
    if (data === null) throw RpcError.validation('Payload cannot be null.');
    if (typeof data.num !== 'number') throw RpcError.validation('Payload .num field missing.');
  },
  call: async ({num}) => ({num: num * 2}),
};

const error: IStaticRpcMethod<object, void, void> = {
  isStreaming: false,
  call: async () => {
    throw new RpcError('this promise can throw', '', 0, '', undefined);
  },
};

const getUser: IStaticRpcMethod<object, {id: string}, {id: string; name: string; tags: string[]}> = {
  isStreaming: false,
  call: async (request) => {
    return {
      id: request.id,
      name: 'Mario Dragi',
      tags: ['news', 'cola', 'bcaa'],
    };
  },
};

const streamError: IStreamingRpcMethod<object, void, void> = {
  isStreaming: true,
  call$: () =>
    from(
      (async () => {
        throw RpcError.internal('Stream always errors');
      })(),
    ),
};

const utilTimer: IStreamingRpcMethod<object, void, number> = {
  isStreaming: true,
  call$: () => timer(10, 10),
};

const buildinfo: IStreamingRpcMethod<object, void, {commit: string; sha1: string}> = {
  isStreaming: true,
  call$: () =>
    from([
      {
        commit: 'AAAAAAAAAAAAAAAAAAA',
        sha1: 'BBBBBBBBBBBBBBBBBBB',
      },
    ]),
};

const count: IStreamingRpcMethod<object, {count: number}, number> = {
  isStreaming: true,
  call$: (request$) => {
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

const doubleStringWithValidation: IStaticRpcMethod<object, {foo: string}, {bar: string}> = {
  isStreaming: false,
  validate: (request: any) => {
    if (!request || typeof request !== 'object') throw RpcError.validation('Request must be object.');
    if (typeof request.foo !== 'string') throw RpcError.validation('"foo" property missing.');
  },
  call: async ({foo}) => {
    return {bar: foo + foo};
  },
};

const doubleStringWithValidation2: IStreamingRpcMethod<object, {foo: string}, {bar: string}> = {
  isStreaming: true,
  validate: (request) => {
    if (!request || typeof request !== 'object') throw RpcError.validation('Request must be object.');
    if (typeof request.foo !== 'string') throw RpcError.validation('"foo" property missing.');
  },
  call$: (req$) => {
    return req$.pipe(map(({foo}) => ({bar: foo + foo})));
  },
};

const passthroughStream: IStreamingRpcMethod<object, unknown, unknown> = {
  isStreaming: true,
  call$: (req$) => req$,
};

export const sampleApi = {
  ping,
  delay,
  notificationSetValue,
  getValue,
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
  passthroughStream,
};

export const createCaller = () => new ApiRpcCaller<typeof sampleApi, any>({api: sampleApi});
