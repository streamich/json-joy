import {UwsHttpResponse} from '../types';
import {UwsHttpBaseContext} from './types';

export const parsePayload = <Ctx extends UwsHttpBaseContext>(ctx: Ctx, payload: Buffer | string) => {
  if (typeof payload === 'string') {
    ctx.payloadSize = payload.length;
    return JSON.parse(payload || 'null');
  } else {
    ctx.payloadSize = payload.byteLength;
    const str = payload.toString('utf8') || 'null';
    return JSON.parse(str);
  }
};

const AccessControlAllowOrigin = Buffer.from('Access-Control-Allow-Origin');
const AccessControlAllowOriginAllowAll = Buffer.from('*');

const AccessControlAllowCredentials = Buffer.from('Access-Control-Allow-Credentials');
const AccessControlAllowCredentialsTrue = Buffer.from('true');

const ContentType = Buffer.from('Content-Type');
const ContentTypeTextEventStream = Buffer.from('text/event-stream');

const CacheControl = Buffer.from('Cache-Control');
const CacheControlNoCache = Buffer.from('no-cache');

const Connection = Buffer.from('Connection');
const ConnectionKeepAlive = Buffer.from('keep-alive');

export const writeSseAndNdjsonHeaders = (res: UwsHttpResponse, origin?: string) => {
  if (origin) {
    res.writeHeader(AccessControlAllowOrigin, AccessControlAllowOriginAllowAll);
    res.writeHeader(AccessControlAllowCredentials, AccessControlAllowCredentialsTrue);
  }
  res.writeHeader(ContentType, ContentTypeTextEventStream);
  res.writeHeader(CacheControl, CacheControlNoCache);
  res.writeHeader(Connection, ConnectionKeepAlive);
};
