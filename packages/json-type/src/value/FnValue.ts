import {Value} from './Value';
import type {Printable} from 'tree-dump/lib/types';
import type * as classes from '../type';

export class FnValue<T extends classes.FnType<any, any, any>> extends Value<T> implements Printable {
  public async exec(input: classes.ResolveType<T['req']>, ctx?: unknown): Promise<Value<T['res']>> {
    const fn = this.data as any;
    const output = await fn(input, ctx);
    return new Value(output, this.type!.res);
  }

  public name(): string {
    return 'FnValue';
  }
}
