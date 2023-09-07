import {applyPatch} from '../json-patch';
import {Value} from '../reactive-rpc/common/messages/Value';
import {RpcError} from '../reactive-rpc/common/rpc/caller';

const PARAM_REGEX = /^([a-z]+)(\/.*)$/;

export const parseParamKey = (key: string): [] | [type: string, path: string] => {
  const match = PARAM_REGEX.exec(key);
  if (!match) return [];
  const [, type, path] = match;
  return [type, path];
};

export const ingestParams = (params: Record<string, unknown>, result: Record<string, unknown>): void => {
  for (const key of Object.keys(params)) {
    const [type, path] = parseParamKey(key);
    if (!type) continue;
    switch (type) {
      case 'j':
      case 'json': {
        const value = JSON.parse(params[key] as string);
        applyPatch(result, [{op: 'add', path: path as string, value}], {mutate: true});
        break;
      }
      case 'n':
      case 'num': {
        const value = Number(JSON.parse(params[key] as string));
        applyPatch(result, [{op: 'add', path: path as string, value}], {mutate: true});
        break;
      }
      case 's':
      case 'str': {
        const value = String(params[key]);
        applyPatch(result, [{op: 'add', path: path as string, value}], {mutate: true});
        break;
      }
      case 'b':
      case 'bool': {
        const value = Boolean(JSON.parse(params[key] as string));
        applyPatch(result, [{op: 'add', path: path as string, value}], {mutate: true});
        break;
      }
      case 'nil': {
        applyPatch(result, [{op: 'add', path: path as string, value: null}], {mutate: true});
        break;
      }
      case 'und': {
        applyPatch(result, [{op: 'add', path: path as string, value: undefined}], {mutate: true});
        break;
      }
      default:
        throw new Error(`Invalid param type: ${type}`);
    }
  }
};

export const formatError = (err: unknown): unknown => {
  if (err instanceof Value) return formatError(err.data);
  if (err instanceof RpcError) return err.toJson();
  if (err instanceof Error) return {message: err.message, stack: err.stack};
  return err;
};
