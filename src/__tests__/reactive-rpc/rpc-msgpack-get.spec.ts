/**
 * @jest-environment node
 */

import {ApiTestSetup, runApiTests} from '../../reactive-rpc/common/rpc/__tests__/api';
import {from} from 'rxjs';
import axios from 'axios';
import {decode} from '../../json-pack/util';

if (process.env.TEST_E2E) {
  const setup: ApiTestSetup = async () => {
    return {
      client: {
        call$: (method: string, data: any) => {
          return from(
            (async () => {
              const search = data !== undefined ? `?a=${encodeURIComponent(JSON.stringify(data))}` : '';
              const url = `http://localhost:9999/rpc/msgpack/${method}${search}`;
              try {
                const response = await axios.get(url, {
                  responseType: 'arraybuffer',
                });
                return decode(response.data);
              } catch (error) {
                throw decode((error as any).response.data);
              }
            })(),
          );
        },
      },
    };
  };
  runApiTests(setup, {staticOnly: true});
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
