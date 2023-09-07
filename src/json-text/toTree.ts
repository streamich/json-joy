import {printTree} from '../util/print/printTree';
import {stringify} from './stringify';

export const toTree = (value: unknown, tab: string = ''): string => {
  if (value instanceof Array) {
    return printTree(tab, value.map((v, i) => (tab) => `[${i}]: ${toTree(v, tab + ' ')}`));
  } else if (value && typeof value === 'object') {
    return printTree(
      tab,
      Object.keys(value).map((k) => (tab) => {
        const formattedKey = JSON.stringify(k);
        return `${formattedKey}: ${toTree((value as any)[k], tab + ' ')}`;
      }),
    );
  }
  return stringify(value);
};
