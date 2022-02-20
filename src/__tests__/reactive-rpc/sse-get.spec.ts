/**
 * @jest-environment node
 */

import {ApiTestSetup, runApiTests} from '../../reactive-rpc/common/rpc/__tests__/api';
import {Subject} from 'rxjs';
const ES = require('eventsource');

if (process.env.TEST_E2E) {
  const setup: ApiTestSetup = async () => {
    return {
      client: {
        call$: (method: string, data: any) => {
          const search = data !== undefined ? `?a=${encodeURIComponent(JSON.stringify(data))}` : '';
          const url = `http://localhost:9999/sse/${method}${search}`;
          const es: EventSource = new ES(url, {});
          const subject = new Subject();
          const onMessage = (e: any) => {
            const json = JSON.parse(e.data);
            subject.next(json);
          };
          const onError = (e: any) => {
            es.close();
            const json = JSON.parse(e.data);
            subject.error(json);
          };
          const onSystemError = (e: any) => {
            es.close();
            es.removeEventListener('message', onMessage);
            es.removeEventListener('err', onError);
            es.removeEventListener('error', onSystemError);
            if (e.readyState === ES.CLOSED) {
              subject.complete();
            } else {
              subject.error(e);
            }
          };
          es.addEventListener('message', onMessage, false);
          es.addEventListener('err', onError, false);
          es.addEventListener('error', onSystemError, false);
          return subject;
        },
      },
    };
  };
  runApiTests(setup, {staticOnly: true});
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
