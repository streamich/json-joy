import {of} from 'rxjs';
import {setup} from './setup';
import {until} from '../../__tests__/util';

describe('presence', () => {
  test('can subscribe and receive published presence entries', async () => {
    const {caller} = setup();
    const emits: any[] = [];
    caller.call$('presence.listen', of({room: 'my-room'}), {}).subscribe((res) => {
      emits.push(res.data);
    });
    await caller.call(
      'presence.update',
      {
        room: 'my-room',
        id: 'user-1',
        data: {
          hello: 'world',
        },
      },
      {},
    );
    await until(() => emits.length === 1);
    expect(emits[0]).toMatchObject({
      time: expect.any(Number),
      entries: [
        {
          id: 'user-1',
          lastSeen: expect.any(Number),
          validUntil: expect.any(Number),
          data: {
            hello: 'world',
          },
        },
      ],
    });
  });

  test('can receive an existing record when subscribing after it was created', async () => {
    const {caller} = setup();
    const emits: any[] = [];
    caller.call$('presence.listen', of({room: 'my-room'}), {}).subscribe((res) => {
      emits.push(res.data);
    });
    await caller.call(
      'presence.update',
      {
        room: 'my-room',
        id: 'user-1',
        data: {
          hello: 'world',
        },
      },
      {},
    );
    await until(() => emits.length === 1);
    const emits2: any[] = [];
    caller.call$('presence.listen', of({room: 'my-room'}), {}).subscribe((res) => {
      emits2.push(res.data);
    });
    await until(() => emits2.length === 1);
    expect(emits2[0]).toMatchObject({
      time: expect.any(Number),
      entries: [
        {
          id: 'user-1',
          lastSeen: expect.any(Number),
          validUntil: expect.any(Number),
          data: {
            hello: 'world',
          },
        },
      ],
    });
  });
});
