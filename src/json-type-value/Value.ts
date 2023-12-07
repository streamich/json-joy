import type {ResolveType, Type} from '../json-type';

export class Value<T extends Type> {
  constructor(public type: T, public data: ResolveType<T>) {}
}
