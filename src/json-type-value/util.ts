import {Value} from './Value';
import {ObjectValue} from './ObjectValue';
import * as classes from '../json-type/type';

export const value: {
  <T extends classes.ObjectType>(type: T, data: unknown): ObjectValue<T>;
  <T extends classes.Type>(type: T, data: unknown): Value<T>;
} = (type: any, data: any): any => {
  if (type instanceof classes.ObjectType) return new ObjectValue(type as classes.ObjectType, <any>data);
  return new Value(type as classes.Type, <any>data);
};
