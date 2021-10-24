import {formatError} from "../../../../common/rpc";
import {RpcApiCaller} from "../../../../common/rpc/RpcApiCaller";
import {encode, decode, MsgPack} from "../../../../../json-pack/util";
import {createConnectionContext} from "../../context";
import {UwsHttpResponse} from "../../types";
import {readBody} from "../../util";
import {UwsHttpBaseContext} from "../types";
import {STATUS_400} from "./constants";
import {bufferToUint8Array} from "../../../../../util/bufferToUint8Array";
import type {EnableHttpPostRcpApiParams} from "./types";

const DEFAULT_ROUTE = '/rpc/msgpack/*';

function sendError(res: UwsHttpResponse, error: unknown) {
  if (res.aborted) return;
  res.cork(() => {
    const body = encode(formatError(error));
    res.writeStatus(STATUS_400).end(body);
  });
};

function processRequest<Ctx extends UwsHttpBaseContext>(res: UwsHttpResponse, ctx: Ctx, name: string, json: unknown, caller: RpcApiCaller<any, Ctx, unknown>) {
  try {
    caller.call(name, json, ctx)
      .then((result) => {
        if (res.aborted) return;
        res.cork(() => {
          res.end(encode(result));
        });
      })
      .catch((error) => {
        sendError(res, error);
      });
  } catch {
    const error = new Error('Could not execute request');
    sendError(res, error);
  }
}

export const enableHttpRpcMsgPackPostApi = <Ctx extends UwsHttpBaseContext>(params: EnableHttpPostRcpApiParams<Ctx>) => {
  const {uws, route = DEFAULT_ROUTE, createContext = createConnectionContext as any, caller} = params;
  if (!route.endsWith('/*')) throw new Error('"route" must end with "/*".');
  uws.post(route, (res, req) => {
    const url = req.getUrl();
    const name = url.substr(route.length - 1);
    const ctx = createContext(req, res);
    res.onAborted(() => {
      res.aborted = true;
    });
    readBody(res, (buffer) => {
      try {
        const uit8 = bufferToUint8Array(buffer) as MsgPack<unknown>;
        const json = decode(uit8);
        processRequest(res, ctx, name, json, caller);
      } catch {
        const error = new Error('Could not parse payload');
        sendError(res, error);
      }
    });
  });
};

export const enableHttpRpcMsgPackGetApi = <Ctx extends UwsHttpBaseContext>(params: EnableHttpPostRcpApiParams<Ctx>) => {
  const {uws, route = DEFAULT_ROUTE, createContext = createConnectionContext as any, caller} = params;
  if (!route.endsWith('/*')) throw new Error('"route" must end with "/*".');
  uws.get(route, (res, req) => {
    const url = req.getUrl();
    const name = url.substr(route.length - 1);
    const query = req.getQuery();
    const params = new URLSearchParams(query);
    const body = String(params.get('a') || 'null');
    const ctx = createContext(req, res);
    res.onAborted(() => {
      res.aborted = true;
    });
    try {
      const json = JSON.parse(body);
      processRequest(res, ctx, name, json, caller);
    } catch {
      const error = new Error('Could not parse payload');
      sendError(res, error);
    }
  });
};
