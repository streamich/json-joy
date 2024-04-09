import * as msg from '../../messages';
import {StaticRpcClient} from './StaticRpcClient';
import {RpcMessageCodec} from '../../codec/types';
import {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {Observable} from 'rxjs';
import type {RpcClient} from './types';

export interface StaticRpcClientOptions {
  send: (buf: Uint8Array) => Promise<Uint8Array>;
  msgCodec: RpcMessageCodec;
  reqCodec: JsonValueCodec;
  resCodec?: JsonValueCodec;
  client: StaticRpcClient;
}

export class EncodedStaticRpcClient implements RpcClient {
  public readonly client: StaticRpcClient;

  constructor({send, msgCodec, reqCodec, resCodec = reqCodec, client}: StaticRpcClientOptions) {
    this.client = client;
    client.onsend = async (messages) => {
      const buf = msgCodec.encode(reqCodec, messages);
      const res = await send(buf);
      const resultMessages = msgCodec.decodeBatch(resCodec, res);
      return resultMessages as msg.ReactiveRpcServerMessage[];
    };
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
}
