import {RpcApiCaller} from '../RpcApiCaller';
import {decode, encode} from '../../../../json-pack/util';
import {JSON} from '../../../../json-brand';
import {firstValueFrom, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

describe('static calls', () => {
  describe('can execute call using different serializations', () => {
    test('when implementation is not serialized', async () => {
      let cnt = 0;
      const caller = new RpcApiCaller({
        api: {
          add: {
            isStreaming: false,
            call: async (_, [a, b]: any) => {
              cnt++;
              return `${a} + ${b} = ${a + b}`;
            },
          },
        },
        maxActiveCalls: 3,
      });
      const res1 = await caller.call('add', [1, 2], {});
      const res2 = await caller.callJson('add', [1, 2], {});
      const res3 = await caller.callMsgPack('add', [1, 2], {});
      const res4 = await firstValueFrom(caller.call$('add', of([1, 2]), {}));
      const res5 = await firstValueFrom(caller.callJson$('add', of([1, 2]), {}));
      const res6 = await firstValueFrom(caller.callMsgPack$('add', of([1, 2]), {}));
      expect(cnt).toBe(6);
      expect(res1).toBe('1 + 2 = 3');
      expect(JSON.parse(res2)).toBe('1 + 2 = 3');
      expect(decode(res3)).toBe('1 + 2 = 3');
      expect(res4).toBe('1 + 2 = 3');
      expect(JSON.parse(res5)).toBe('1 + 2 = 3');
      expect(decode(res6)).toBe('1 + 2 = 3');
    });

    test('when implementation is JSON serialized', async () => {
      let cnt = 0;
      const caller = new RpcApiCaller({
        api: {
          add: {
            isStreaming: false,
            callJson: async (_, [a, b]: any) => {
              cnt++;
              return JSON.stringify(`${a} + ${b} = ${a + b}`);
            },
          },
        },
        maxActiveCalls: 3,
      });
      const res1 = await caller.call('add', [1, 2], {});
      const res2 = await caller.callJson('add', [1, 2], {});
      const res3 = await caller.callMsgPack('add', [1, 2], {});
      const res4 = await firstValueFrom(caller.call$('add', of([1, 2]), {}));
      const res5 = await firstValueFrom(caller.callJson$('add', of([1, 2]), {}));
      const res6 = await firstValueFrom(caller.callMsgPack$('add', of([1, 2]), {}));
      expect(cnt).toBe(6);
      expect(res1).toBe('1 + 2 = 3');
      expect(JSON.parse(res2)).toBe('1 + 2 = 3');
      expect(decode(res3)).toBe('1 + 2 = 3');
      expect(res4).toBe('1 + 2 = 3');
      expect(JSON.parse(res5)).toBe('1 + 2 = 3');
      expect(decode(res6)).toBe('1 + 2 = 3');
    });

    test('when implementation is MessagePack serialized', async () => {
      let cnt = 0;
      const caller = new RpcApiCaller({
        api: {
          add: {
            isStreaming: false,
            callMsgPack: async (_, [a, b]: any) => {
              cnt++;
              return encode(`${a} + ${b} = ${a + b}`);
            },
          },
        },
        maxActiveCalls: 3,
      });
      const res1 = await caller.call('add', [1, 2], {});
      const res2 = await caller.callJson('add', [1, 2], {});
      const res3 = await caller.callMsgPack('add', [1, 2], {});
      const res4 = await firstValueFrom(caller.call$('add', of([1, 2]), {}));
      const res5 = await firstValueFrom(caller.callJson$('add', of([1, 2]), {}));
      const res6 = await firstValueFrom(caller.callMsgPack$('add', of([1, 2]), {}));
      expect(cnt).toBe(6);
      expect(res1).toBe('1 + 2 = 3');
      expect(JSON.parse(res2)).toBe('1 + 2 = 3');
      expect(decode(res3)).toBe('1 + 2 = 3');
      expect(res4).toBe('1 + 2 = 3');
      expect(JSON.parse(res5)).toBe('1 + 2 = 3');
      expect(decode(res6)).toBe('1 + 2 = 3');
    });
  });
});

describe('streaming calls', () => {
  describe('can execute call using different serializations', () => {
    test('when implementation is not serialized', async () => {
      let cnt = 0;
      const caller = new RpcApiCaller({
        api: {
          add: {
            isStreaming: true,
            call$: (_: any, req$: Observable<[number, number]>) => {
              cnt++;
              return req$.pipe(map(([a, b]) => {
                return `${a} + ${b} = ${a + b}`;
              }));
            },
          } as any,
        },
        maxActiveCalls: 3,
      });
      const res1 = await caller.call('add', [1, 2], {});
      const res2 = await caller.callJson('add', [1, 2], {});
      const res3 = await caller.callMsgPack('add', [1, 2], {});
      const res4 = await firstValueFrom(caller.call$('add', of([1, 2]), {}));
      const res5 = await firstValueFrom(caller.callJson$('add', of([1, 2]), {}));
      const res6 = await firstValueFrom(caller.callMsgPack$('add', of([1, 2]), {}));
      expect(cnt).toBe(6);
      expect(res1).toBe('1 + 2 = 3');
      expect(JSON.parse(res2)).toBe('1 + 2 = 3');
      expect(decode(res3)).toBe('1 + 2 = 3');
      expect(res4).toBe('1 + 2 = 3');
      expect(JSON.parse(res5)).toBe('1 + 2 = 3');
      expect(decode(res6)).toBe('1 + 2 = 3');
    });

    test('when implementation is JSON serialized', async () => {
      let cnt = 0;
      const caller = new RpcApiCaller({
        api: {
          add: {
            isStreaming: true,
            callJson$: (_: any, req$: Observable<[number, number]>) => {
              cnt++;
              return req$.pipe(map(([a, b]) => {
                return JSON.stringify(`${a} + ${b} = ${a + b}`);
              }));
            },
          },
        },
        maxActiveCalls: 3,
      });
      const res1 = await caller.call('add', [1, 2], {});
      const res2 = await caller.callJson('add', [1, 2], {});
      const res3 = await caller.callMsgPack('add', [1, 2], {});
      const res4 = await firstValueFrom(caller.call$('add', of([1, 2]), {}));
      const res5 = await firstValueFrom(caller.callJson$('add', of([1, 2]), {}));
      const res6 = await firstValueFrom(caller.callMsgPack$('add', of([1, 2]), {}));
      expect(cnt).toBe(6);
      expect(res1).toBe('1 + 2 = 3');
      expect(JSON.parse(res2)).toBe('1 + 2 = 3');
      expect(decode(res3)).toBe('1 + 2 = 3');
      expect(res4).toBe('1 + 2 = 3');
      expect(JSON.parse(res5)).toBe('1 + 2 = 3');
      expect(decode(res6)).toBe('1 + 2 = 3');
    });

    test('when implementation is JSON serialized', async () => {
      let cnt = 0;
      const caller = new RpcApiCaller({
        api: {
          add: {
            isStreaming: true,
            callMsgPack$: (_: any, req$: Observable<[number, number]>) => {
              cnt++;
              return req$.pipe(map(([a, b]) => {
                return encode(`${a} + ${b} = ${a + b}`);
              }));
            },
          },
        },
        maxActiveCalls: 3,
      });
      const res1 = await caller.call('add', [1, 2], {});
      const res2 = await caller.callJson('add', [1, 2], {});
      const res3 = await caller.callMsgPack('add', [1, 2], {});
      const res4 = await firstValueFrom(caller.call$('add', of([1, 2]), {}));
      const res5 = await firstValueFrom(caller.callJson$('add', of([1, 2]), {}));
      const res6 = await firstValueFrom(caller.callMsgPack$('add', of([1, 2]), {}));
      expect(cnt).toBe(6);
      expect(res1).toBe('1 + 2 = 3');
      expect(JSON.parse(res2)).toBe('1 + 2 = 3');
      expect(decode(res3)).toBe('1 + 2 = 3');
      expect(res4).toBe('1 + 2 = 3');
      expect(JSON.parse(res5)).toBe('1 + 2 = 3');
      expect(decode(res6)).toBe('1 + 2 = 3');
    });
  });
});
