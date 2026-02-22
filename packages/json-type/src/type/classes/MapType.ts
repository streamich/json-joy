import {printTree} from 'tree-dump/lib/printTree';
import * as schema from '../../schema';
import type {SchemaOf, Type} from '../types';
import {AbsType} from './AbsType';
import type {TypeExportContext} from './ModuleType/TypeExportContext';

export class MapType<T extends Type = any> extends AbsType<schema.MapSchema<SchemaOf<T>>> {
  constructor(
    public readonly _value: T,
    public readonly _key?: Type,
    options?: schema.Optional<schema.MapSchema>,
  ) {
    super({kind: 'map', value: schema.s.any, ...(_key && {key: schema.s.any}), ...options} as any);
  }

  public getSchema(ctx?: TypeExportContext): schema.MapSchema<SchemaOf<T>> {
    return {
      ...this.schema,
      value: this._value.getSchema(ctx) as any,
      ...(this._key && {key: this._key.getSchema(ctx) as any}),
    };
  }

  public getOptions(): schema.Optional<schema.MapSchema<SchemaOf<T>>> {
    const {kind, value, key, ...options} = this.schema;
    return options as any;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + printTree(tab, [(tab) => this._value.toString(tab)]);
  }
}
