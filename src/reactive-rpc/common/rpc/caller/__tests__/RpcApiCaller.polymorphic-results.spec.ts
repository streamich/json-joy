import {ApiRpcCaller} from '../ApiRpcCaller';
import {firstValueFrom, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {StreamingRpcMethod} from '../../methods/StreamingRpcMethod';
import {StaticRpcMethod} from '../../methods/StaticRpcMethod';

describe('static calls', () => {
  describe('can execute call using different serializations', () => {
    test('when implementation is not serialized', async () => {
      let cnt = 0;
      const caller = new ApiRpcCaller({
        api: {
          add: new StaticRpcMethod({
            call: async ([a, b]: any) => {
              cnt++;
              return `${a} + ${b} = ${a + b}`;
            },
          }),
        },
      });
      const res1 = await caller.call('add', [1, 2], {});
      const res4 = await firstValueFrom(caller.call$('add', of([1, 2]), {}));
      expect(cnt).toBe(2);
      expect(res1.data).toBe('1 + 2 = 3');
      expect(res4.data).toBe('1 + 2 = 3');
    });
  });
});

describe('streaming calls', () => {
  describe('can execute call using different serializations', () => {
    test('when implementation is not serialized', async () => {
      let cnt = 0;
      const caller = new ApiRpcCaller<any>({
        api: {
          add: new StreamingRpcMethod({
            call$: (req$: Observable<[number, number]>) => {
              cnt++;
              return req$.pipe(
                map(([a, b]) => {
                  return `${a} + ${b} = ${a + b}`;
                }),
              );
            },
          }),
        },
      });
      const res1 = await caller.call('add', [1, 2], {});
      const res4 = await firstValueFrom(caller.call$('add', of([1, 2]), {}));
      expect(cnt).toBe(2);
      expect(res1.data).toBe('1 + 2 = 3');
      expect(res4.data).toBe('1 + 2 = 3');
    });
  });
});
