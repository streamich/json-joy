import {firstValueFrom, lastValueFrom} from 'rxjs';
import {StreamingRpcClient} from '../client/StreamingRpcClient';
import {of} from '../../util/of';
import {RpcError} from '../caller';

export interface ApiTestSetupResult {
  client: Pick<StreamingRpcClient, 'call$' | 'stop'>;
}

export type ApiTestSetup = () => ApiTestSetupResult | Promise<ApiTestSetupResult>;

export const runApiTests = (setup: ApiTestSetup, params: {staticOnly?: boolean} = {}) => {
  describe('ping', () => {
    test('can execute static RPC method', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('ping', {}));
      expect(result).toBe('pong');
      await client.stop();
    }, 15_000);

    test('can execute without payload', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('ping', undefined));
      expect(result).toBe('pong');
      await client.stop();
    });

    test('can execute with unexpected payload', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('ping', 'VERY_UNEXPECTED'));
      expect(result).toBe('pong');
      await client.stop();
    });
  });

  describe('double', () => {
    test('can execute simple "double" method', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('double', {num: 1.2}));
      expect(result).toEqual({num: 2.4});
      await client.stop();
    });

    test('can execute two request in parallel', async () => {
      const {client} = await setup();
      const promise1 = of(firstValueFrom(client.call$('double', {num: 1})));
      const promise2 = of(firstValueFrom(client.call$('double', {num: 2})));
      const [res1, res2] = await Promise.all([promise1, promise2]);
      expect(res1[0]).toEqual({num: 2});
      expect(res2[0]).toEqual({num: 4});
      await client.stop();
    });

    test('throws error when validation fails', async () => {
      const {client} = await setup();
      const [, error] = await of(firstValueFrom(client.call$('double', {num: {}})));
      expect((error as RpcError).code).toBe('BAD_REQUEST');
      expect((error as RpcError).message).toBe('Payload .num field missing.');
      await client.stop();
    });
  });

  describe('error', () => {
    test('throws error on static RPC error', async () => {
      const {client} = await setup();
      const [, error] = await of(firstValueFrom(client.call$('error', {})));
      expect(error).toMatchObject({message: 'this promise can throw'});
      await client.stop();
    });
  });

  describe('streamError', () => {
    test('throws error on streaming RPC error', async () => {
      const {client} = await setup();
      const [, error] = await of(lastValueFrom(client.call$('streamError', {})));
      expect(error).toMatchObject({message: 'Stream always errors'});
      await client.stop();
    });
  });

  describe('util.info', () => {
    test('can receive one value of stream that ends after emitting one value', async () => {
      const {client} = await setup();
      const observable = client.call$('util.info', {});
      const result = await firstValueFrom(observable);
      expect(result).toEqual({
        commit: 'AAAAAAAAAAAAAAAAAAA',
        sha1: 'BBBBBBBBBBBBBBBBBBB',
      });
      await client.stop();
    });
  });

  describe('doubleStringWithValidation', () => {
    test('can execute successfully', async () => {
      const {client} = await setup();
      const result = await firstValueFrom(client.call$('doubleStringWithValidation', {foo: 'a'}));
      expect(result).toEqual({
        bar: 'aa',
      });
      await client.stop();
    });

    test('throws on invalid data', async () => {
      const {client} = await setup();
      const [, error] = await of(firstValueFrom(client.call$('doubleStringWithValidation', {foo: 123})));
      expect(error).toMatchObject({
        message: '"foo" property missing.',
      });
      await client.stop();
    });
  });

  // We loop here to check for memory leaks.
  for (let i = 0; i < 5; i++) {
    describe(`doubleStringWithValidation2, iteration ${i + 1}`, () => {
      test('can execute successfully', async () => {
        const {client} = await setup();
        const result = await firstValueFrom(client.call$('doubleStringWithValidation2', {foo: 'a'}));
        await new Promise((r) => setTimeout(r, 15));
        expect(result).toEqual({
          bar: 'aa',
        });
        await client.stop();
      });

      test('throws on invalid data', async () => {
        const {client} = await setup();
        const [, error] = await of(firstValueFrom(client.call$('doubleStringWithValidation2', {foo: 123})));
        expect(error).toMatchObject({
          message: '"foo" property missing.',
        });
        await client.stop();
      });
    });
  }
};
