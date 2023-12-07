import {t, AnyType} from '../json-type';
import {Value} from './Value';

const anyType = t.any;

export class AnyValue extends Value<AnyType> {
  constructor(public data: unknown) {
    super(anyType, data);
  }
}
