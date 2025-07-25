import {printTree} from 'tree-dump/lib/printTree';
import {stringify} from './stringify';

const isPrimitive = (value: unknown): boolean => typeof value !== 'object' || value === null;
const isOneLineValue = (value: unknown): boolean => {
  if (isPrimitive(value)) return true;
  if (Array.isArray(value) && !value.length) return true;
  if (value && typeof value === 'object' && !Object.keys(value).length) return true;
  return false;
};
const isSimpleString = (str: string) => /^[a-z0-9]+$/i.test(str);

export const toTree = (value: unknown, tab: string = ''): string => {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return printTree(
      tab,
      value.map((v, i) => (tab: string) => {
        return `[${i}]${isOneLineValue(v) ? ': ' : ''}${toTree(v, tab + ' ')}`;
      }),
    ).slice(tab ? 0 : 1);
  } else if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return printTree(
      tab,
      keys.map((k) => (tab: string) => {
        const addQuotes = !isSimpleString(k);
        const formattedKey = addQuotes ? JSON.stringify(k) : k;
        const val = (value as any)[k];
        return `${formattedKey}${isOneLineValue(val) ? ' = ' : ''}${toTree(val, tab)}`;
      }),
    ).slice(tab ? 0 : 1);
  }
  return stringify(value);
};
