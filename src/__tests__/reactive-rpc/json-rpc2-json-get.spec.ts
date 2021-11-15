/**
 * @jest-environment node
 */

import {ApiTestSetup, runApiTests} from '../../reactive-rpc/common/rpc/__tests__/api';
import {firstValueFrom, from} from 'rxjs';
import axios from 'axios';

if (process.env.TEST_E2E) {
  const setup: ApiTestSetup = async () => {
    return {
      client: {
        call$: (method: string, data: any) => {
          return from(
            (async () => {
              const message = {
                jsonrpc: '2.0',
                id: '1',
                method,
                params: data || null,
              };
              const search = `?a=${encodeURIComponent(JSON.stringify(message))}`;
              const url = `http://localhost:9999/json-rpc${search}`;
              let response;
              try {
                response = await axios.get(url);
              } catch (error) {
                throw (error as any).response.data;
              }
              if (response.data.error) throw response.data.error;
              return response.data.result;
            })(),
          );
        },
      },
    };
  };

  runApiTests(setup, {staticOnly: true});

  describe('notifications', () => {
    test('can use notifications', async () => {
      const message = {
        jsonrpc: '2.0',
        method: 'set-int',
        params: 456,
      };
      const search = `?a=${encodeURIComponent(JSON.stringify(message))}`;
      const url = `http://localhost:9999/json-rpc${search}`;
      await axios.get(url);
      const {client} = await setup();
      const res = await firstValueFrom(client.call$('getInt', null));
      expect(res).toBe(456);
    });
  });
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
