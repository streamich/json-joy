/**
 * @jest-environment node
 */

import {ApiTestSetup, runApiTests} from '../../reactive-rpc/common/rpc/__tests__/api';
import {from} from 'rxjs';
import axios from 'axios';

if (process.env.TEST_E2E) {
  const setup: ApiTestSetup = async () => {
    return {
      client: {
        call$: (method: string, data: any) => {
          return from((async () => {
            const search = data !== undefined ? `?a=${encodeURIComponent(JSON.stringify(data))}` : '';
            const url = `http://localhost:9999/rpc/${method}${search}`;
            try {
              const response = await axios.get(url);
              return response.data;
            } catch (error) {
              throw error.response.data;
            }
          })());
        },
      },
    };
  };
  runApiTests(setup, {staticOnly: true});
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
