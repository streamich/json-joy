import {setup} from './setup';
import {tick, until} from '../../__tests__/util';

describe('pubsub', () => {
  test('throws error on invalid input', async () => {
    const {call} = setup();
    try {
      await call('pubsub.publish', {
        channel2: 'INVALID KEY',
        message: 'hello world',
      } as any);
      throw new Error('should not reach here');
    } catch (err: any) {
      expect(err.meta.path).toStrictEqual(['channel2']);
    }
  });

  test('can subscribe and receive published messages', async () => {
    const {call, call$} = setup();
    const emits: any[] = [];
    call$('pubsub.listen', {channel: 'my-channel'}).subscribe((res) => {
      emits.push(res.message);
    });
    await call('pubsub.publish', {
      channel: 'my-channel',
      message: 'hello world',
    });
    await until(() => emits.length === 1);
    expect(emits).toStrictEqual(['hello world']);
  });

  test('does not receive messages after un-subscription', async () => {
    const {call, call$} = setup();
    const emits: any[] = [];
    const sub = call$('pubsub.listen', {channel: 'my-channel'}).subscribe((res) => {
      emits.push(res.message);
    });
    await call('pubsub.publish', {
      channel: 'my-channel',
      message: 'msg1',
    });
    await call('pubsub.publish', {
      channel: 'my-channel',
      message: 'msg2',
    });
    await until(() => emits.length === 2);
    sub.unsubscribe();
    await tick(25);
    await call('pubsub.publish', {
      channel: 'my-channel',
      message: 'msg3',
    });
    await tick(50);
    expect(emits.indexOf('msg1') > -1).toBe(true);
    expect(emits.indexOf('msg2') > -1).toBe(true);
  });

  test('multiple multiple subscribers can subscribe to multiple channels', async () => {
    const {call, call$} = setup();
    const user1: any[] = [];
    const user2: any[] = [];
    const user3: any[] = [];
    call$('pubsub.listen', {channel: 'channel-1'}).subscribe((res) => {
      user1.push(res.message);
    });
    const sub2 = call$('pubsub.listen', {channel: 'channel-2'}).subscribe((res) => {
      user2.push(res.message);
    });
    call$('pubsub.listen', {channel: 'channel-1'}).subscribe((res) => {
      user3.push(res.message);
    });
    call$('pubsub.listen', {channel: 'channel-2'}).subscribe((res) => {
      user3.push(res.message);
    });
    await call('pubsub.publish', {
      channel: 'my-channel',
      message: 'hello world',
    });
    await tick(50);
    expect(user1).toStrictEqual([]);
    expect(user2).toStrictEqual([]);
    expect(user3).toStrictEqual([]);
    call('pubsub.publish', {
      channel: 'channel-1',
      message: 'msg1',
    }).catch(() => {});
    call('pubsub.publish', {
      channel: 'channel-2',
      message: 'msg2',
    }).catch(() => {});
    await until(() => user1.length === 1);
    await until(() => user2.length === 1);
    await until(() => user3.length === 2);
    expect(user1).toStrictEqual(['msg1']);
    expect(user2).toStrictEqual(['msg2']);
    expect(user3.indexOf('msg1') > -1).toBe(true);
    expect(user3.indexOf('msg2') > -1).toBe(true);
    sub2.unsubscribe();
    call('pubsub.publish', {
      channel: 'channel-2',
      message: 'msg3',
    }).catch(() => {});
    await until(() => user3.length === 3);
    expect(user1).toStrictEqual(['msg1']);
    expect(user2).toStrictEqual(['msg2']);
    expect(user3.indexOf('msg1') > -1).toBe(true);
    expect(user3.indexOf('msg2') > -1).toBe(true);
    expect(user3.indexOf('msg3') > -1).toBe(true);
  });
});
