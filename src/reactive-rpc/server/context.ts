import {NullObject} from '../../util/NullObject';
import {copy} from '../../util/buffers/copy';
import {listToUint8} from '../../util/buffers/concat';
import type {JsonValueCodec} from '../../json-pack/codecs/types';
import type {RpcMessageCodec} from '../common/codec/types';
import type {RpcApp} from './uws/RpcApp';
import type {HttpRequest, HttpResponse} from './uws/types';
import type {RpcCodecs} from '../common/codec/RpcCodecs';

const X_AUTH_PARAM = 'X-Authorization=';
const X_AUTH_PARAM_LENGTH = X_AUTH_PARAM.length;
const CODECS_REGEX = /rpc.(\w{0,32})\.(\w{0,32})\.(\w{0,32})(?:\-(\w{0,32}))?/;

export class ConnectionContext<Meta = Record<string, unknown>> {
  private static findIp(req: HttpRequest, res: HttpResponse): string {
    return (
      req.getHeader('x-forwarded-for') ||
      req.getHeader('x-real-ip') ||
      Buffer.from(res.getRemoteAddressAsText()).toString()
    );
  }

  private static findToken(req: HttpRequest, params: string[] | null): string {
    let token: string = req.getHeader('authorization') || '';
    if (!token) {
      const query = req.getQuery();
      const params = new URLSearchParams(query);
      token = params.get('access_token') || '';
      if (!token) token = params.get('token') || '';
    }
    return token;
  }

  public static fromReqRes(
    req: HttpRequest,
    res: HttpResponse,
    params: string[] | null,
    app: RpcApp<any>,
  ): ConnectionContext {
    const ip = ConnectionContext.findIp(req, res);
    const token: string = ConnectionContext.findToken(req, params);
    const codecs = app.codecs;
    const valueCodecs = codecs.value;
    const ctx = new ConnectionContext(
      ip,
      token,
      params,
      new NullObject(),
      valueCodecs.json,
      valueCodecs.json,
      codecs.messages.compact,
      res,
    );
    const contentType = req.getHeader('content-type');
    if (contentType) ctx.setCodecs(contentType, codecs);
    return ctx;
  }

  public static fromWs(
    req: HttpRequest,
    res: HttpResponse,
    secWebSocketProtocol: string,
    params: string[] | null,
    app: RpcApp<any>,
  ): ConnectionContext {
    const ip = ConnectionContext.findIp(req, res);
    let token: string = ConnectionContext.findToken(req, params);
    if (!token && secWebSocketProtocol) {
      const protocols = secWebSocketProtocol.split(',');
      const length = protocols.length;
      for (let i = 0; i < length; i++) {
        let protocol = protocols[i].trim();
        if (protocol.startsWith(X_AUTH_PARAM)) {
          protocol = protocol.slice(X_AUTH_PARAM_LENGTH);
          if (protocol) {
            token = Buffer.from(protocol, 'base64').toString();
            break;
          }
        }
      }
    }
    const codecs = app.codecs;
    const valueCodecs = codecs.value;
    const ctx = new ConnectionContext(
      ip,
      token,
      params,
      new NullObject(),
      valueCodecs.json,
      valueCodecs.json,
      codecs.messages.compact,
      res,
    );
    const contentType = req.getHeader('content-type');
    if (contentType) ctx.setCodecs(contentType, codecs);
    else if (secWebSocketProtocol) ctx.setCodecs(secWebSocketProtocol, codecs);
    return ctx;
  }

  constructor(
    public readonly ip: string,
    public readonly token: string,
    public readonly params: string[] | null,
    public readonly meta: Meta,
    public reqCodec: JsonValueCodec,
    public resCodec: JsonValueCodec,
    public msgCodec: RpcMessageCodec,
    public res: HttpResponse | undefined = undefined,
  ) {}

  /**
   * @param specifier A string which may contain a codec specifier. For example:
   *  - `rpc.rx.compact.cbor` for Rx-RPC with compact messages and CBOR values.
   *  - `rpc.json2.verbose.json` for JSON-RPC 2.0 with verbose messages encoded as JSON.
   */
  public setCodecs(specifier: string, codecs: RpcCodecs): void {
    const match = CODECS_REGEX.exec(specifier);
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

  public requestBodyParts(max: number): Promise<Uint8Array[]> {
    const res = this.res;
    return new Promise((resolve) => {
      const list: Uint8Array[] = [];
      if (!res) return resolve(list);
      let running = 0;
      res.onData((ab, isLast) => {
        running += ab.byteLength;
        if (running > max) res.end('too large');
        // Last `ab` does not need to be copied.
        if (isLast) list.push(new Uint8Array(ab)), resolve(list);
        else list.push(copy(new Uint8Array(ab)));
      });
    });
  }

  public async requestBody(max: number): Promise<Uint8Array> {
    const parts = await this.requestBodyParts(max);
    return listToUint8(parts);
  }

  public async requestBodyJson(max: number): Promise<unknown> {
    const parts = await this.requestBodyParts(max);
    const bodyUint8 = listToUint8(parts);
    return this.reqCodec.decoder.read(bodyUint8);
  }

  public sendResponse(response: Uint8Array): void {
    const res = this.res;
    if (!res) return;
    if (res.aborted) return;
    res.end(response);
  }
}
