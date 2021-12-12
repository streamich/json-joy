import * as type from './types';

export const JSON = (typeof global !== 'undefined' ? global.JSON : window.JSON) as unknown as type.JSON;

export type {json, json_string} from './types';
