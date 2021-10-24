import WS from 'isomorphic-ws';
import {WebSocketChannel} from '../../reactive-rpc/common/channel/channel';
import {firstValueFrom} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {RpcServerError} from '../../reactive-rpc/common/rpc';

if (process.env.TEST_E2E) {
  const channel = new WebSocketChannel({
    newSocket: () => new WS('ws://localhost:9999/rpc/compact'),
  });

  afterAll(() => {
    channel.close();
  });

  const send = async (payload: string): Promise<string> => {
    const res = await firstValueFrom(
      channel.send$(payload).pipe(
        take(1),
        switchMap(() => channel.message$),
      ),
    );
    return String(res);
  };

  test('can execute ping', async () => {
    const res = await send('[1,    "ping"]');
    expect(JSON.parse(res)).toEqual([0, 1, 'pong']);
  });

  test('can execute ping in a batch', async () => {
    const res = await send('[[1,    "ping"]]');
    expect(JSON.parse(res)).toEqual([0, 1, 'pong']);
  });

  test('can execute two pings in a batch', async () => {
    const res = await send('[[1,"ping",{}], [3, "ping"]]');
    expect(JSON.parse(res)).toEqual([
      [0, 1, 'pong'],
      [0, 3, 'pong'],
    ]);
  });

  test('can execute two pings in a batch', async () => {
    const res = await send('[[1,"ping",{}], [3, "ping"]]');
    expect(JSON.parse(res)).toEqual([
      [0, 1, 'pong'],
      [0, 3, 'pong'],
    ]);
  });

  test('on a single invalid message in the batch fails the batch', async () => {
    const res = await send('[[1,"ping",{}], 123]');
    expect(JSON.parse(res)).toEqual(['.err', 'CODING']);
  });

  test('sends back error response on empty method name', async () => {
    const res = JSON.parse(await send('[2,""]'));
    expect(res[0]).toBe(-1);
    expect(res[1]).toBe(2);
    expect(res[2]).toEqual({
      message: 'PROTOCOL',
      code: 'NoMethodSpecified',
      errno: 6,
    });
  });

  test('on non-JSON payload sends back ".err" notification message with "CODING" error', async () => {
    const res1 = JSON.parse(await send('[1,"ping"'));
    expect(res1[0]).toBe('.err');
    expect(res1[1]).toBe('CODING');

    const res2 = JSON.parse(await send('testing...'));
    expect(res2[0]).toBe('.err');
    expect(res2[1]).toBe('CODING');
  });

  describe('notification message validation', () => {
    test('sends back async .err message when notification message method name is empty', async () => {
      const res = JSON.parse(await send('["", {}]'));
      expect(res[0]).toBe('.err');
      expect(res[1]).toEqual({
        message: 'PROTOCOL',
        code: 'InvalidNotificationName',
        errno: RpcServerError.InvalidNotificationName,
      });
    });

    test('sends back async .err message when notification message method name is longer than 128 chars', async () => {
      const res = JSON.parse(
        await send(
          '["012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678", {}]',
        ),
      );
      expect(res[0]).toBe('.err');
      expect(res[1]).toEqual({
        message: 'PROTOCOL',
        code: 'InvalidNotificationName',
        errno: RpcServerError.InvalidNotificationName,
      });
    });
  });
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
