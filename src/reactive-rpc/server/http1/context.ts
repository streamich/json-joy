import {getBody} from './util';
import {listToUint8} from '../../../util/buffers/concat';
import type * as http from 'http';
import type {JsonValueCodec} from '../../../json-pack/codecs/types';
import type {RpcMessageCodec} from '../../common/codec/types';
import type {RpcCodecs} from '../../common/codec/RpcCodecs';

const REGEX_CODECS_SPECIFIER = /rpc\.(\w{0,32})\.(\w{0,32})\.(\w{0,32})(?:\-(\w{0,32}))?/;

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

  /**
   * @param specifier A string which may contain a codec specifier. For example:
   *  - `rpc.rx.compact.cbor` for Rx-RPC with compact messages and CBOR values.
   *  - `rpc.json2.verbose.json` for JSON-RPC 2.0 with verbose messages encoded as JSON.
   */
  public setCodecs(specifier: string, codecs: RpcCodecs): void {
    const match = REGEX_CODECS_SPECIFIER.exec(specifier);
    if (!match) return;
    const [, protocol, messageFormat, request, response] = match;
    switch (protocol) {
      case 'rx': {
        switch (messageFormat) {
          case 'compact': {
            this.msgCodec = codecs.messages.compact;
            break;
          }
          case 'binary': {
            this.msgCodec = codecs.messages.binary;
            break;
          }
        }
        break;
      }
      case 'json2': {
        this.msgCodec = codecs.messages.jsonRpc2;
        break;
      }
    }
    switch (request) {
      case 'cbor': {
        this.resCodec = this.reqCodec = codecs.value.cbor;
        break;
      }
      case 'json': {
        this.resCodec = this.reqCodec = codecs.value.json;
        break;
      }
      case 'msgpack': {
        this.resCodec = this.reqCodec = codecs.value.msgpack;
        break;
      }
    }
    switch (response) {
      case 'cbor': {
        this.resCodec = codecs.value.cbor;
        break;
      }
      case 'json': {
        this.resCodec = codecs.value.json;
        break;
      }
      case 'msgpack': {
        this.resCodec = codecs.value.msgpack;
        break;
      }
    }
  }

  public async body(maxPayload: number): Promise<Uint8Array> {
    const list = await getBody(this.req, maxPayload);
    const bodyUint8 = listToUint8(list);
    return bodyUint8;
  }
}
