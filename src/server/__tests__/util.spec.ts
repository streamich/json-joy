import {setup} from "./setup";

describe('util', () => {
  describe('ping', () => {
    test('returns pong', async () => {
      const {caller} = setup();
      const res = await caller.call('util.ping', {}, {});
      expect(res.data).toBe('pong');
    });
  });

  describe('echo', () => {
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
});
