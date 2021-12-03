import {RpcApiCaller} from '../RpcApiCaller';
import {decode, encode} from '../../../../json-pack/util';
import {JSON} from '../../../../json-brand';
import {firstValueFrom, of} from 'rxjs';

describe('static calls', () => {
  describe('can execute "ping" using different serializations', () => {
    test('when implementation is not serialized', async () => {
      const caller = new RpcApiCaller({
        api: {
          ping: {
            isStreaming: false,
            call: async () => {
              return 'pong';
            },
          },
        },
        maxActiveCalls: 3,
      });
      const res1 = await caller.call('ping', undefined, {});
      const res2 = await caller.callJson('ping', undefined, {});
      const res3 = await caller.callMsgPack('ping', undefined, {});
      const res4 = await firstValueFrom(caller.call$('ping', of(undefined), {}));
      const res5 = await firstValueFrom(caller.callJson$('ping', of(undefined), {}));
      const res6 = await firstValueFrom(caller.callMsgPack$('ping', of(undefined), {}));
      expect(res1).toBe('pong');
      expect(JSON.parse(res2)).toBe('pong');
      expect(decode(res3)).toBe('pong');
      expect(res4).toBe('pong');
      expect(JSON.parse(res5)).toBe('pong');
      expect(decode(res6)).toBe('pong');
    });

    test('when implementation is JSON serialized', async () => {
      const caller = new RpcApiCaller({
        api: {
          ping: {
            isStreaming: false,
            callJson: async () => {
              return JSON.stringify('pong');
            },
          },
        },
        maxActiveCalls: 3,
      });
      const res1 = await caller.call('ping', undefined, {});
      const res2 = await caller.callJson('ping', undefined, {});
      const res3 = await caller.callMsgPack('ping', undefined, {});
      const res4 = await firstValueFrom(caller.call$('ping', of(undefined), {}));
      const res5 = await firstValueFrom(caller.callJson$('ping', of(undefined), {}));
      const res6 = await firstValueFrom(caller.callMsgPack$('ping', of(undefined), {}));
      expect(res1).toBe('pong');
      expect(JSON.parse(res2)).toBe('pong');
      expect(decode(res3)).toBe('pong');
      expect(res4).toBe('pong');
      expect(JSON.parse(res5)).toBe('pong');
      expect(decode(res6)).toBe('pong');
    });

    test('when implementation is MessagePack serialized', async () => {
      const caller = new RpcApiCaller({
        api: {
          ping: {
            isStreaming: false,
            callMsgPack: async () => {
              return encode('pong');
            },
          },
        },
        maxActiveCalls: 3,
      });
      const res1 = await caller.call('ping', undefined, {});
      const res2 = await caller.callJson('ping', undefined, {});
      const res3 = await caller.callMsgPack('ping', undefined, {});
      const res4 = await firstValueFrom(caller.call$('ping', of(undefined), {}));
      const res5 = await firstValueFrom(caller.callJson$('ping', of(undefined), {}));
      const res6 = await firstValueFrom(caller.callMsgPack$('ping', of(undefined), {}));
      expect(res1).toBe('pong');
      expect(JSON.parse(res2)).toBe('pong');
      expect(decode(res3)).toBe('pong');
      expect(res4).toBe('pong');
      expect(JSON.parse(res5)).toBe('pong');
      expect(decode(res6)).toBe('pong');
    });
  });
});
