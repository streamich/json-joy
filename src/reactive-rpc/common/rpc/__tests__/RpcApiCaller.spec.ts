import * as Rx from 'rxjs';
import {catchError, skip} from 'rxjs/operators';
import {RpcApiCaller} from '../RpcApiCaller';
import {sampleApi, runApiTests} from '../__tests__/api';
import {ErrorLikeErrorFormatter} from '../error';
import {of} from '../../util/of';

const setup = () => {
  const caller = new RpcApiCaller({
    api: sampleApi,
    maxActiveCalls: 3,
  });
  return {caller};
};

test('can instantiate', () => {
  const caller = new RpcApiCaller({
    api: {},
  });
});

describe('static calls', () => {
  test('can execute "ping"', async () => {
    const {caller} = setup();
    const res = await caller.call('ping', undefined, {});
    expect(res).toBe('pong');
  });

  test('can execute "double"', async () => {
    const {caller} = setup();
    const res = await caller.call('double', {num: 5}, {});
    expect(res.num).toBe(10);
  });

  test('formats error using formatter', async () => {
    const caller = new RpcApiCaller({
      api: {
        test: {
          isStreaming: false,
          call: async () => {
            throw 'lol';
          },
        },
      },
    });
    const [, error] = await of(caller.call('test', {}, {}));
    expect(error).toEqual({
      message: 'lol',
    });
  });
});

describe('streaming calls', () => {
  test('can execute "ping"', async () => {
    const {caller} = setup();
    const res = await Rx.firstValueFrom(caller.call$('ping', Rx.of(undefined), {}));
    expect(res).toBe('pong');
  });

  test('can execute "double"', async () => {
    const {caller} = setup();
    const res = await Rx.firstValueFrom(caller.call$('double', Rx.of({num: 5}), {}));
    expect(res.num).toBe(10);
  });

  test('can execute "timer"', async () => {
    const {caller} = setup();
    const res = await Rx.firstValueFrom(caller.call$('util.timer', Rx.of(undefined), {}).pipe(skip(2)));
    expect(res).toBe(2);
  });

  test('formats error using formatter', async () => {
    const caller = new RpcApiCaller({
      api: {
        test: {
          isStreaming: true,
          call$: () => {
            const subject = new Rx.Subject();
            subject.error('lol');
            return subject;
          },
        },
      },
    });

    const [, error1] = await of(caller.call('test', {}, {}));
    expect(error1).toEqual({
      message: 'lol',
    });

    const [, error2] = await of(Rx.firstValueFrom(caller.call$('test', Rx.of(undefined), {})));
    expect(error2).toEqual({
      message: 'lol',
    });
  });
});

describe('smoke tests', () => {
  runApiTests(() => {
    const {caller} = setup();
    const errorFormatter = new ErrorLikeErrorFormatter();
    return {
      client: {
        call$: (name: any, request: any) =>
          caller.call$(name, Rx.isObservable(request) ? request : Rx.of(request), {}).pipe(
            catchError((error) => {
              throw errorFormatter.format(error);
            }),
          ),
      },
    };
  });
});
