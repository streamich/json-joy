import {setup} from './setup';

describe('util.*', () => {
  describe('util.ping', () => {
    test('returns pong', async () => {
      const {caller} = setup();
      const res = await caller.call('util.ping', {}, {});
      expect(res.data).toBe('pong');
    });
  });

  describe('util.echo', () => {
    test('returns strings', async () => {
      const {caller} = setup();
      const res = await caller.call('util.echo', 'hello world', {});
      expect(res.data).toBe('hello world');
    });

    test('returns objects', async () => {
      const {caller} = setup();
      const res = await caller.call('util.echo', {foo: 'bar'}, {});
      expect(res.data).toStrictEqual({foo: 'bar'});
    });
  });

  describe('util.info', () => {
    test('returns stats object', async () => {
      const {call} = setup();
      const res = await call('util.info', {}, {});
      expect(res).toMatchObject({
        now: expect.any(Number),
        stats: {
          pubsub: {
            channels: expect.any(Number),
            observers: expect.any(Number),
          },
          presence: {
            rooms: expect.any(Number),
            entries: expect.any(Number),
            observers: expect.any(Number),
          },
          blocks: {
            blocks: expect.any(Number),
            patches: expect.any(Number),
          },
        },
      });
    });
  });
});
