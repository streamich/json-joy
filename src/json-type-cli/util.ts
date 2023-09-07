import {applyPatch} from '../json-patch';

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
