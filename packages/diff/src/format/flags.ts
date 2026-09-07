import type {FlagOptions} from './types';

export const flags = (flag: string, opts?: FlagOptions): [prefix: string, blank: string, redraw: string] => {
  const prefix = flag + (opts?.initialTab ? '\t' : ' ');
  return [prefix, opts?.suppressBlankEmpty ? (flag === ' ' ? '' : flag) : prefix, prefix];
};
