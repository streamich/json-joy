import {Value} from './Value';
import {AnyValue} from './AnyValue';
import {ObjectValue} from './ObjectValue';
import * as classes from '../json-type/type';

export const makeValue: {
  (type: undefined | classes.Type, data: unknown): AnyValue;
  <T extends classes.ObjectType>(type: T, data: unknown): ObjectValue<T>;
  <T extends classes.Type>(type: T, data: unknown): Value<T>;
} = (type: any, data: any): any => {
  if (!type) return new AnyValue(data);
  if (type instanceof classes.ObjectType) return new ObjectValue(type as classes.ObjectType, <any>data);
  return new Value(type as classes.Type, <any>data);
};
