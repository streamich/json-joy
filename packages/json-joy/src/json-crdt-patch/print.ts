import {toLine} from 'pojo-dump/lib/toLine';
import {printTs, Timestamp} from './clock';

export const line = toLine;

export const con = (value: unknown) => {
  const formatted =
    value instanceof Uint8Array
      ? 'Uint8Array ' + bin(value)
      : `{ ${value instanceof Timestamp ? printTs(value as Timestamp) : line(value)} }`;
  return formatted;
};

export const bin = (value: Uint8Array) => '{ ' + ('' + value).replaceAll(',', ', ') + ' }';

export const indent = (tab: string, pojo: unknown) => String(JSON.stringify(pojo, null, 2)).replace(/\n/g, '\n' + tab);
