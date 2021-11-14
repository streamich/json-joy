import {createConnectionContext} from '../../context';
import {readBody} from '../../util';
import{JsonRpc2Server} from '../../../../common/json-rpc/JsonRpc2Server';
import type {EnableReactiveRpcApiParams, UwsHttpResponse} from '../../types';
import type{UwsHttpBaseContext} from '../types';
import {STATUS_400} from '../rpc/constants';
import {EnableHttpPostRcpApiParams} from '..';
import { JsonRpc2CodecJsonString } from '../../../../common/json-rpc/codec/json-string/JsonRpc2CodecJsonString';

export interface EnableHttpJsonRPC2ApiParams<Ctx extends UwsHttpBaseContext> extends EnableReactiveRpcApiParams<Ctx> {
  server: JsonRpc2Server<any, Ctx>;
}

const STATUS_NO_RESPONSE = Buffer.from('204 No Response');
const HDR_KEY_CONTENT_TYPE = Buffer.from('Content-Type');
const HDR_VALUE_APPLICATION_JSON = Buffer.from('application/json');

function processHttpRpcRequest<Ctx extends UwsHttpBaseContext>(
  res: UwsHttpResponse,
  ctx: Ctx,
  body: Buffer | string,
  server: JsonRpc2Server<any, Ctx>,
) {
  try {
    if (typeof body === 'string') {
      ctx.payloadSize = body.length;
    } else {
      ctx.payloadSize = body.byteLength;
      body = body.toString('utf8') || 'null';
    }
    server.onMessages(ctx, body)
      .then((result) => {
        if (res.aborted) return;
        res.cork(() => {
          if (!result) res.writeStatus(STATUS_NO_RESPONSE).end();
          else res.writeHeader(HDR_KEY_CONTENT_TYPE, HDR_VALUE_APPLICATION_JSON).end(result as string);
        });
      })
      .catch(() => {
        if (!res.aborted) res.writeStatus(STATUS_400).end();
      });
  } catch {
    if (!res.aborted) res.writeStatus(STATUS_400).end();
  }
}

export const enableHttpJsonRPC2Api = <Ctx extends UwsHttpBaseContext>(params: EnableHttpPostRcpApiParams<Ctx>) => {
  const {uws, route = '/json-rpc', createContext = createConnectionContext as any, caller} = params;
  const server = new JsonRpc2Server<any, Ctx>({
    caller,
    codec: new JsonRpc2CodecJsonString(),
    onNotification: () => {},
    strict: false,
  });

  uws.post(route, (res, req) => {
    const ctx = createContext(req, res);
    res.onAborted(() => {
      res.aborted = true;
    });
    readBody(res, (buffer) => {
      processHttpRpcRequest(res, ctx, buffer, server);
    });
  });

  uws.get(route, (res, req) => {
    const query = req.getQuery();
    const params = new URLSearchParams(query);
    const body = String(params.get('a') || 'null');
    const ctx = createContext(req, res);
    res.onAborted(() => {
      res.aborted = true;
    });
    processHttpRpcRequest(res, ctx, body, server);
  });
};
