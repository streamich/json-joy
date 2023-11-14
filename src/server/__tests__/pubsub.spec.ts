import {of} from 'rxjs';
import {setup} from './setup';
import {tick, until} from '../../__tests__/util';

describe('pubsub', () => {
  test('can subscribe and receive published messages', async () => {
    const {caller} = setup();
    const emits: any[] = [];
    caller.call$('pubsub.subscribe', of({channel: 'my-channel'}), {}).subscribe((res) => {
      emits.push(res.data.message);
    });
    await caller.call('pubsub.publish', {
      channel: 'my-channel',
      message: 'hello world',
    }, {});
    await until(() => emits.length === 1);
    expect(emits).toStrictEqual(['hello world']);
  });

  test('does not receive messages after un-subscription', async () => {
    const {caller} = setup();
    const emits: any[] = [];
    const sub = caller.call$('pubsub.subscribe', of({channel: 'my-channel'}), {}).subscribe((res) => {
      emits.push(res.data.message);
    });
    await caller.call('pubsub.publish', {
      channel: 'my-channel',
      message: 'msg1',
    }, {});
    await caller.call('pubsub.publish', {
      channel: 'my-channel',
      message: 'msg2',
    }, {});
    await until(() => emits.length === 2);
    sub.unsubscribe();
    await caller.call('pubsub.publish', {
      channel: 'my-channel',
      message: 'msg3',
    }, {});
    await tick(50);
    expect(emits).toStrictEqual(['msg1', 'msg2']);
  });

  test('multiple multiple subscribers can subscribe to multiple channels', async () => {
    const {caller} = setup();
    const user1: any[] = [];
    const user2: any[] = [];
    const user3: any[] = [];
    caller.call$('pubsub.subscribe', of({channel: 'channel-1'}), {}).subscribe((res) => {
      user1.push(res.data.message);
    });
    const sub2 = caller.call$('pubsub.subscribe', of({channel: 'channel-2'}), {}).subscribe((res) => {
      user2.push(res.data.message);
    });
    caller.call$('pubsub.subscribe', of({channel: 'channel-1'}), {}).subscribe((res) => {
      user3.push(res.data.message);
    });
    caller.call$('pubsub.subscribe', of({channel: 'channel-2'}), {}).subscribe((res) => {
      user3.push(res.data.message);
    });
    await caller.call('pubsub.publish', {
      channel: 'my-channel',
      message: 'hello world',
    }, {});
    await tick(50);
    expect(user1).toStrictEqual([]);
    expect(user2).toStrictEqual([]);
    expect(user3).toStrictEqual([]);
    caller.call('pubsub.publish', {
      channel: 'channel-1',
      message: 'msg1',
    }, {}).catch(() => {});
    caller.call('pubsub.publish', {
      channel: 'channel-2',
      message: 'msg2',
    }, {}).catch(() => {});
    await until(() => user1.length === 1);
    await until(() => user2.length === 1);
    await until(() => user3.length === 2);
    expect(user1).toStrictEqual(['msg1']);
    expect(user2).toStrictEqual(['msg2']);
    expect(user3).toStrictEqual(['msg1', 'msg2']);
    sub2.unsubscribe();
    caller.call('pubsub.publish', {
      channel: 'channel-2',
      message: 'msg3',
    }, {}).catch(() => {});
    await until(() => user3.length === 3);
    expect(user1).toStrictEqual(['msg1']);
    expect(user2).toStrictEqual(['msg2']);
    expect(user3).toStrictEqual(['msg1', 'msg2', 'msg3']);
  });
});
