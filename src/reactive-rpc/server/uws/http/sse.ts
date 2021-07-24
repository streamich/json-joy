import {Observable, Subject, of} from "rxjs";
import { takeUntil } from "rxjs/operators";
import {formatError} from "../../../common/rpc";
import {RpcApiCaller} from "../../../common/rpc/RpcApiCaller";
import {EnableReactiveRpcApiParams, UwsHttpResponse} from "../types";
import {readBody} from "../util";

export interface UwsHttpBaseContext {
  payloadSize?: number;
}

export interface EnableHttpPostRcpApiParams<Ctx extends UwsHttpBaseContext> extends EnableReactiveRpcApiParams<Ctx> {
  caller: RpcApiCaller<any, Ctx, unknown>;
}

export const enableSsePostRpcApi = <Ctx extends UwsHttpBaseContext>(params: EnableHttpPostRcpApiParams<Ctx>) => {
  const {uws, route = '/sse/*', createContext, caller} = params;
  uws.post(route, (res, req) => {
    const url = req.getUrl();
    const origin = req.getHeader('origin');
    const ctx = createContext(req, res);
    const aborted$ = new Subject<true>();
    res.onAborted(() => {
      res.aborted = true;
      aborted$.next(true);
    });
    readBody(res, (buffer) => {
      processSseRequest(res, ctx, url, buffer, aborted$, origin, caller);
    });
  });
};

const sendSseError = (res: UwsHttpResponse, error: unknown) => {
  if (res.aborted) return;
  // So that we don't call res.end() again when observable subscription ends.
  res.aborted = true;
  const errorFormatted = formatError(error);
  res.end('event: error\ndata: ' + JSON.stringify(errorFormatted) + '\n\n');
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

const writeSseAndNdjsonHeaders = (res: UwsHttpResponse, origin?: string) => {
  if (origin) {
    res.writeHeader(AccessControlAllowOrigin, AccessControlAllowOriginAllowAll);
    res.writeHeader(AccessControlAllowCredentials, AccessControlAllowCredentialsTrue);
  }
  res.writeHeader(ContentType, ContentTypeTextEventStream);
  res.writeHeader(CacheControl, CacheControlNoCache);
  res.writeHeader(Connection, ConnectionKeepAlive);
};

function processSseRequest<Ctx extends UwsHttpBaseContext>(
  res: UwsHttpResponse,
  ctx: Ctx,
  url: string,
  body: Buffer | string,
  aborted$: Observable<true>,
  origin: string,
  caller: RpcApiCaller<any, Ctx, unknown>
) {
  try {
    const name = url.substr(5);
    let json: unknown;
    if (typeof body === 'string') {
      ctx.payloadSize = body.length;
      json = JSON.parse(body || 'null');
    } else {
      ctx.payloadSize = body.byteLength;
      const str = body.toString('utf8') || 'null';
      json = JSON.parse(str);
    }
    res.cork(() => {
      writeSseAndNdjsonHeaders(res, origin);
    });
    const subscription = caller.call$(name, of(json), ctx)
      .pipe(takeUntil(aborted$))
      .subscribe({
        next: data => {
          if (res.aborted) return;
          res.write('data: ' + JSON.stringify(data) + '\n\n');
        },
        error: error => {
          sendSseError(res, error);
        },
        complete: () => {
          if (!res.aborted) res.end();
        },
      });
      res.onAborted(() => {
        res.aborted = true;
        if (subscription) subscription.unsubscribe();
      });
  } catch {
    const error = new Error('Could not parse payload'); 
    sendSseError(res, error);
  }
}
