import {getBody} from './util';
import {listToUint8} from '@jsonjoy.com/util/lib/buffers/concat';
import type * as http from 'http';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {RpcMessageCodec} from '../../common/codec/types';
import type {WsServerConnection} from '../ws/server/WsServerConnection';

export interface ConnectionContext<Meta = Record<string, unknown>> {
  path: string;
  query: string;
  ip: string;
  token: string;
  params: string[] | null;
  meta: Meta;
  reqCodec: JsonValueCodec;
  resCodec: JsonValueCodec;
  msgCodec: RpcMessageCodec;
}

export class Http1ConnectionContext<Meta = Record<string, unknown>> implements ConnectionContext<Meta> {
  constructor(
    public readonly req: http.IncomingMessage,
    public readonly res: http.ServerResponse,
    public path: string,
    public query: string,
    public readonly ip: string,
    public token: string,
    public readonly params: string[] | null,
    public readonly meta: Meta,
    public reqCodec: JsonValueCodec,
    public resCodec: JsonValueCodec,
    public msgCodec: RpcMessageCodec,
  ) {}

  public async body(maxPayload: number): Promise<Uint8Array> {
    const list = await getBody(this.req, maxPayload);
    const bodyUint8 = listToUint8(list);
    return bodyUint8;
  }
}

export class WsConnectionContext<Meta = Record<string, unknown>> implements ConnectionContext<Meta> {
  constructor(
    public readonly connection: WsServerConnection,
    public path: string,
    public query: string,
    public readonly ip: string,
    public token: string,
    public readonly params: string[] | null,
    public readonly meta: Meta,
    public reqCodec: JsonValueCodec,
    public resCodec: JsonValueCodec,
    public msgCodec: RpcMessageCodec,
  ) {}
}
