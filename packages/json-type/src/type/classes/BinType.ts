import {printTree} from 'tree-dump/lib/printTree';
import * as schema from '../../schema';
import type {SchemaOf, Type} from '../types';
import {AbsType} from './AbsType';

export class BinType<T extends Type = any> extends AbsType<schema.BinSchema> {
  constructor(
    protected type: T,
    options?: schema.Optional<schema.BinSchema>,
  ) {
    super(schema.s.Binary(schema.s.any, options));
  }

  public format(format: schema.BinSchema['format']): this {
    this.schema.format = format;
    return this;
  }

  public min(min: schema.BinSchema['min']): this {
    this.schema.min = min;
    return this;
  }

  public max(max: schema.BinSchema['max']): this {
    this.schema.max = max;
    return this;
  }

  public getSchema(): schema.BinSchema<SchemaOf<T>> {
    return {
      ...this.schema,
      type: this.type.getSchema() as any,
    };
  }

  public getOptions(): schema.Optional<schema.ArrSchema<SchemaOf<T>>> {
    const {kind, type, ...options} = this.schema;
    return options as any;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + printTree(tab, [(tab) => this.type.toString(tab)]);
  }
}
