import {from, Observable} from "rxjs";
import {ApiTestSetup, ApiTestSetupResult, runApiTests} from "../../rpc/__tests__/api";
import {JsonRpc2RequestMessage} from "../types";
import {setupWithStringCodec} from './setup';

const apiSetup: ApiTestSetup = (): ApiTestSetupResult => {
  let id = 0;
  const {server} = setupWithStringCodec();
  return {
    client: {
      call$: (method: string, data: any): Observable<any> => {
        const message: JsonRpc2RequestMessage = {
          jsonrpc: '2.0',
          id: String(id++),
          method,
          params: data,
        };
        return from((async () => {
          const resp = JSON.parse(await server.onMessages({}, JSON.stringify([message])) as any);
          if ((resp as any).error) throw (resp as any).error;
          return (resp as any).result;
        })());
      },
    },
  };
};

describe('duplex 1', () => {
  runApiTests(apiSetup, {staticOnly: true});
});
