import type * as type from './types';

// biome-ignore lint: shadow JSON nome is intended
export const JSON = (typeof global !== 'undefined' ? global.JSON : window.JSON) as unknown as type.JSON;

export type {json, json_string} from './types';
