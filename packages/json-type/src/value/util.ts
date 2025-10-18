import type * as classes from '../type';
import {ObjValue} from './ObjValue';
import {Value} from './Value';

export const value: {
  <T extends classes.ObjType>(type: T, data: unknown): ObjValue<T>;
  <T extends classes.Type>(type: T, data: unknown): Value<T>;
} = (type: any, data: any): any => {
  if (type.kind() === 'obj') return new ObjValue(type as classes.ObjType, <any>data);
  return new Value(<any>data, type as classes.Type);
};
