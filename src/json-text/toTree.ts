import {printTree} from '../util/print/printTree';
import {stringify} from './stringify';

export const toTree = (value: unknown, tab: string = ''): string => {
  if (value instanceof Array) {
    if (value.length === 0) return '[]';
    return printTree(tab, value.map((v, i) => (tab: string) => `[${i}]: ${toTree(v, tab + ' ')}`)).slice(tab ? 0 : 1);
  } else if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return printTree(
      tab,
      keys.map((k) => (tab: string) => {
        const formattedKey = JSON.stringify(k);
        return `${formattedKey}: ${toTree((value as any)[k], tab + ' ')}`;
      }),
    ).slice(tab ? 0 : 1);
  }
  return stringify(value);
};
