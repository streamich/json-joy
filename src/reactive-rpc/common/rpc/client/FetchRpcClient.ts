import {StaticRpcClient, StaticRpcClientOptions} from './StaticRpcClient';
import {EncodedStaticRpcClient} from './EncodedStaticRpcClient';
import type {RpcMessageCodec} from '../../codec/types';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {Observable} from 'rxjs';
import type {RpcClient} from './types';

type IFetch = typeof fetch;

export interface FetchRpcClientOptions extends StaticRpcClientOptions {
  url: string;
  msgCodec: RpcMessageCodec;
  reqCodec: JsonValueCodec;
  resCodec?: JsonValueCodec;
  fetch?: IFetch;
}

/**
 * Static method RPC client, which uses `fetch` to send requests.
 */
export class FetchRpcClient implements RpcClient {
  public readonly client: EncodedStaticRpcClient;

  constructor(options: FetchRpcClientOptions) {
    const {msgCodec, reqCodec, resCodec = reqCodec, url} = options;
    let contentType = `application/x.rpc.${msgCodec.id}.${reqCodec.id}`;
    if (reqCodec.id !== resCodec.id) contentType += `-${resCodec.id}`;
    const myFetch = options.fetch || fetch;
    this.client = new EncodedStaticRpcClient({
      client: new StaticRpcClient({
        bufferSize: options.bufferSize,
        bufferTime: options.bufferTime,
      }),
      msgCodec,
      reqCodec,
      resCodec,
      send: async (body) => {
        const response = await myFetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': contentType,
          },
          body,
        });
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      },
    });
  }

  public call$(method: string, data: unknown | Observable<unknown>): Observable<unknown> {
    return this.client.call$(method, data);
  }

  public async call(method: string, request: unknown): Promise<unknown> {
    return this.call(method, request);
  }

  public notify(method: string, data: undefined | unknown): void {
    this.notify(method, data);
  }

  public stop() {}
}
