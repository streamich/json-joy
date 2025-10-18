import {printTree} from 'tree-dump/lib/printTree';
import {printJson} from 'tree-dump/lib/printJson';
import type {Printable} from 'tree-dump';
import type {ResolveType, Type} from '../type/types';

const copyForPrint = (data: unknown): unknown => {
  if (typeof data === 'function') return '__fN---';
  if (Array.isArray(data)) return data.map(copyForPrint);
  if (data && typeof data === 'object') {
    const res: Record<string, unknown> = {};
    for (const k in data) res[k] = copyForPrint((data as any)[k]);
    return res;
  }
  return data;
};

export class Value<T extends Type = Type> implements Printable {
  constructor(
    public data: ResolveType<T>,
    public type?: T,
  ) {}

  public name(): string {
    return 'Value';
  }

  public toString(tab: string = ''): string {
    const type = this.type;
    return (
      this.name() +
      (type
        ? printTree(tab, [
            (tab) => type.toString(tab),
            (tab) => printJson(tab, copyForPrint(this.data)).replace(/"__fN---"/g, 'fn()'),
          ])
        : '')
    );
  }
}

export const unknown = (data: unknown): Value<Type> => new (Value as any)(data);
