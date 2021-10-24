import {Observable, Subject, of} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {formatError} from '../../../common/rpc';
import {RpcApiCaller} from '../../../common/rpc/RpcApiCaller';
import {createConnectionContext} from '../context';
import {EnableReactiveRpcApiParams, UwsHttpResponse} from '../types';
import {readBody} from '../util';
import {UwsHttpBaseContext} from './types';
import {parsePayload, writeSseAndNdjsonHeaders} from './util';

export interface EnableSsePostRpcApiParams<Ctx extends UwsHttpBaseContext> extends EnableReactiveRpcApiParams<Ctx> {
  caller: RpcApiCaller<any, Ctx, unknown>;
}

export const enableSsePostRpcApi = <Ctx extends UwsHttpBaseContext>(params: EnableSsePostRpcApiParams<Ctx>) => {
  const {uws, route = '/sse/*', createContext = createConnectionContext as any, caller} = params;

  if (!route.endsWith('/*')) throw new Error('"route" must end with "/*".');

  uws.post(route, (res, req) => {
    const url = req.getUrl();
    const name = url.substr(route.length - 1);
    const origin = req.getHeader('origin');
    const ctx = createContext(req, res);
    const aborted$ = new Subject<true>();
    res.onAborted(() => {
      res.aborted = true;
      aborted$.next(true);
    });
    readBody(res, (buffer) => {
      processSseRequest(res, ctx, name, buffer, aborted$, origin, caller);
    });
  });
};

export const enableSseGetRpcApi = <Ctx extends UwsHttpBaseContext>(params: EnableSsePostRpcApiParams<Ctx>) => {
  const {uws, route = '/sse/*', createContext = createConnectionContext as any, caller} = params;

  if (!route.endsWith('/*')) throw new Error('"route" must end with "/*".');

  uws.get(route, (res, req) => {
    const url = req.getUrl();
    const name = url.substr(route.length - 1);
    const origin = req.getHeader('origin');
    const ctx = createContext(req, res);
    const aborted$ = new Subject<true>();
    const query = req.getQuery();
    const params = new URLSearchParams(query);
    const body = String(params.get('a') || 'null');
    res.onAborted(() => {
      res.aborted = true;
      aborted$.next(true);
    });
    processSseRequest(res, ctx, name, body, aborted$, origin, caller);
  });
};

const sendSseError = (res: UwsHttpResponse, error: unknown) => {
  if (res.aborted) return;
  // So that we don't call res.end() again when observable subscription ends.
  res.aborted = true;
  const errorFormatted = formatError(error);
  res.end('event: err\ndata: ' + JSON.stringify(errorFormatted) + '\n\n');
};

function processSseRequest<Ctx extends UwsHttpBaseContext>(
  res: UwsHttpResponse,
  ctx: Ctx,
  name: string,
  body: Buffer | string,
  aborted$: Observable<true>,
  origin: string,
  caller: RpcApiCaller<any, Ctx, unknown>,
) {
  let closed = false;
  try {
    const json = parsePayload(ctx, body);
    res.cork(() => {
      writeSseAndNdjsonHeaders(res, origin);
    });
    caller
      .call$(name, of(json), ctx)
      .pipe(takeUntil(aborted$))
      .subscribe({
        next: (data) => {
          if (closed) return;
          if (res.aborted) return;
          res.write('data: ' + JSON.stringify(data) + '\n\n');
        },
        error: (error) => {
          if (closed) return;
          closed = true;
          sendSseError(res, error);
        },
        complete: () => {
          if (closed) return;
          closed = true;
          if (!res.aborted) res.end();
        },
      });
  } catch {
    if (closed) return;
    closed = true;
    const error = new Error('Could not parse payload');
    sendSseError(res, error);
  }
}
