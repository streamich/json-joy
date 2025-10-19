import {toLine} from 'pojo-dump/lib/toLine';
import {printTs, Timestamp} from '../json-crdt-patch';

export const line = toLine;

export const con = (value: unknown) => {
  const formatted =
    value instanceof Uint8Array
      ? 'Uint8Array ' + bin(value)
      : `{ ${value instanceof Timestamp ? printTs(value as Timestamp) : line(value)} }`;
  return formatted;
};

export const bin = (value: Uint8Array) => '{ ' + ('' + value).replaceAll(',', ', ') + ' }';
