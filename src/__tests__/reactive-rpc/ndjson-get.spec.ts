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
            const search = data === undefined ? '' : `?a=${JSON.stringify(data)}`;
            const url = `http://localhost:9999/ndjson/${method}${search}`;
            const response = await axios.get(url, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            const [channel, result] = response.data;
            if (channel === 1) return result;
            else throw result;
          })());
        },
      },
    };
  };
  runApiTests(setup, {staticOnly: true});
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
