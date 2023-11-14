import {of} from 'rxjs';
import {setup} from './setup';
import {tick, until} from '../../__tests__/util';

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

  test('can remove existing entries', async () => {
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
    await caller.call('presence.remove', {room: 'my-room', id: 'user-1'}, {});
    await until(() => emits.length === 2);
    const emits2: any[] = [];
    caller.call$('presence.listen', of({room: 'my-room'}), {}).subscribe((res) => {
      emits2.push(res.data);
    });
    await tick(50);
    expect(emits2.length).toBe(0);
  });

  test('emits entry deletion messages', async () => {
    const {caller} = setup();
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
    const emits: any[] = [];
    caller.call$('presence.listen', of({room: 'my-room'}), {}).subscribe((res) => {
      emits.push(res.data);
    });
    await caller.call('presence.remove', {room: 'my-room', id: 'user-1'}, {});
    await until(() => emits.length === 2);
    expect(emits[1].entries[0]).toMatchObject({
      id: 'user-1',
      lastSeen: expect.any(Number),
      validUntil: 0,
      data: expect.any(Object),
    });
  });
});
