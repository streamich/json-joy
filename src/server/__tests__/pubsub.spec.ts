import {of} from 'rxjs';
import {setup} from './setup';

describe('pubsub', () => {
  test('can subscribe and receive published messages', async () => {
    const {caller} = setup();
    const emits: any[] = [];
    caller.call$('pubsub.subscribe', of({channel: 'my-channel'}), {}).subscribe((res) => {
      emits.push(res.data);
    });
    await caller.call('pubsub.publish', {
      channel: 'my-channel',
      message: 'hello world',
    }, {});
    expect(emits).toStrictEqual([{message: 'hello world'}]);
  });
});
