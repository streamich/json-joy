import {printTree} from 'tree-dump';
import * as schema from '../../schema';
import type {SchemaOf, Type} from '../types';
import {AbsType} from './AbsType';
import type {TypeExportContext} from './ModuleType/TypeExportContext';

export class ArrType<
  T extends Type | void = any,
  const Head extends Type[] = any,
  const Tail extends Type[] = any,
> extends AbsType<
  schema.ArrSchema<
    T extends void ? schema.Schema : SchemaOf<T extends Type ? T : never>,
    {[K in keyof Head]: SchemaOf<Head[K]>},
    {[K in keyof Tail]: SchemaOf<Tail[K]>}
  >
> {
  constructor(
    public readonly _type?: T,
    public readonly _head?: Head,
    public readonly _tail?: Tail,
    options?: schema.Optional<schema.ArrSchema>,
  ) {
    super(schema.s.Array(schema.s.any, options) as schema.ArrSchema<any, any, any>);
  }

  public head<const H extends Type[]>(...head: H): ArrType<T, H, Tail> {
    (this as any)._head = head as any;
    return this as any;
  }

  public tail<const X extends Type[]>(...tail: X): ArrType<T, Head, X> {
    (this as any)._tail = tail as any;
    return this as any;
  }

  public min(min: schema.ArrSchema['min']): this {
    this.schema.min = min;
    return this;
  }

  public max(max: schema.ArrSchema['max']): this {
    this.schema.max = max;
    return this;
  }

  public getSchema(ctx?: TypeExportContext) {
    const schema: schema.ArrSchema<
      T extends void ? schema.Schema : SchemaOf<T extends Type ? T : never>,
      {[K in keyof Head]: SchemaOf<Head[K]>},
      {[K in keyof Tail]: SchemaOf<Tail[K]>}
    > = {
      ...this.schema,
    };
    const {_type, _head, _tail} = this;
    if (_type) schema.type = _type.getSchema(ctx) as any;
    if (_head) schema.head = _head.map((t) => t.getSchema(ctx)) as any;
    if (_tail) schema.tail = _tail.map((t) => t.getSchema(ctx)) as any;
    return schema;
  }

  public getOptions(): schema.Optional<
    schema.ArrSchema<T extends void ? schema.Schema : SchemaOf<T extends Type ? T : never>>
  > {
    const {kind, type, ...options} = this.schema;
    return options as any;
  }

  public toString(tab: string = ''): string {
    const {_head, _type, _tail} = this;
    return (
      super.toString(tab) +
      printTree(tab, [
        _head && _head.length
          ? (tab) =>
              '[ head, ... ]' +
              printTree(
                tab,
                _head!.map((t) => (tab) => t.toString(tab)),
              )
          : null,
        _type ? (tab) => (_type ? _type.toString(tab) : '...') : null,
        _tail && _tail.length
          ? (tab) =>
              '[ ..., tail ]' +
              printTree(
                tab,
                _tail!.map((t) => (tab) => t.toString(tab)),
              )
          : null,
      ])
    );
  }
}
