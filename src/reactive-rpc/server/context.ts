import {NullObject} from '@jsonjoy.com/util/lib/NullObject';
import {copy} from '@jsonjoy.com/util/lib/buffers/copy';
import {listToUint8} from '@jsonjoy.com/util/lib/buffers/concat';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {RpcMessageCodec} from '../common/codec/types';
import type {RpcApp} from './uws/RpcApp';
import type {HttpRequest, HttpResponse} from './uws/types';
import type {RpcCodecs} from '../common/codec/RpcCodecs';

const REGEX_AUTH_TOKEN_SPECIFIER = /tkn\.([a-zA-Z0-9\-_]+)(?:[^a-zA-Z0-9\-_]|$)/;
const REGEX_CODECS_SPECIFIER = /rpc\.(\w{0,32})\.(\w{0,32})\.(\w{0,32})(?:\-(\w{0,32}))?/;

export class ConnectionContext<Meta = Record<string, unknown>> {
  private static findIp(req: HttpRequest, res: HttpResponse): string {
    return (
      req.getHeader('x-forwarded-for') ||
      req.getHeader('x-real-ip') ||
      Buffer.from(res.getRemoteAddressAsText()).toString()
    );
  }

  private static findTokenInText(text: string): string {
    const match = REGEX_AUTH_TOKEN_SPECIFIER.exec(text);
    if (!match) return '';
    return match[1] || '';
  }

  /**
   * Looks for an authentication token in the following places:
   *
   * 1. The `Authorization` header.
   * 2. The URI query parameters.
   * 3. The `Cookie` header.
   * 4. The `Sec-Websocket-Protocol` header.
   *
   * @param req HTTP request
   * @returns Authentication token, if any.
   */
  private static findToken(req: HttpRequest): string {
    let token: string = '';
    let text: string = '';
    text = req.getHeader('authorization');
    if (text) token = ConnectionContext.findTokenInText(text);
    if (token) return token;
    text = req.getQuery();
    if (text) token = ConnectionContext.findTokenInText(text);
    if (token) return token;
    text = req.getHeader('cookie');
    if (text) token = ConnectionContext.findTokenInText(text);
    if (token) return token;
    text = req.getHeader('sec-websocket-protocol');
    if (text) token = ConnectionContext.findTokenInText(text);
    return token;
  }

  public static fromReqRes(
    req: HttpRequest,
    res: HttpResponse,
    params: string[] | null,
    app: RpcApp<any>,
  ): ConnectionContext {
    const ip = ConnectionContext.findIp(req, res);
    const token: string = ConnectionContext.findToken(req);
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
    const token: string = ConnectionContext.findToken(req);
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

  public requestBodyParts(max: number): Promise<Uint8Array[]> {
    const res = this.res;
    return new Promise((resolve) => {
      const list: Uint8Array[] = [];
      if (!res) return resolve(list);
      let running = 0;
      res.onData((ab, isLast) => {
        running += ab.byteLength;
        if (running > max) {
          res.aborted = true;
          res.end('too large');
        }
        // Last `ab` does not need to be copied, as per docs.
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
