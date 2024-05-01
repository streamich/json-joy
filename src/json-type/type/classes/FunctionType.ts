import {printTree} from 'tree-dump/lib/printTree';
import * as schema from '../../schema';
import {validateTType} from '../../schema/validate';
import {AbstractType} from './AbstractType';
import type {SchemaOf, Type} from '../types';
import type * as ts from '../../typescript/types';
import type {ResolveType} from '../../system';
import type {Observable} from 'rxjs';

const fnNotImplemented: schema.FunctionValue<any, any> = async () => {
  throw new Error('NOT_IMPLEMENTED');
};

const toStringTree = (tab: string = '', type: FunctionType<Type, Type> | FunctionStreamingType<Type, Type>) => {
  return printTree(tab, [
    (tab) => 'req: ' + type.req.toString(tab + '     '),
    (tab) => 'res: ' + type.res.toString(tab + '     '),
  ]);
};

type FunctionImpl<Req extends Type, Res extends Type, Ctx = unknown> = (
  req: ResolveType<Req>,
  ctx: Ctx,
) => Promise<ResolveType<Res>>;

export class FunctionType<Req extends Type, Res extends Type> extends AbstractType<
  schema.FunctionSchema<SchemaOf<Req>, SchemaOf<Res>>
> {
  protected schema: schema.FunctionSchema<SchemaOf<Req>, SchemaOf<Res>>;

  public fn: schema.FunctionValue<schema.TypeOf<SchemaOf<Req>>, schema.TypeOf<SchemaOf<Res>>> = fnNotImplemented;

  constructor(
    public readonly req: Req,
    public readonly res: Res,
    options?: schema.Optional<schema.FunctionSchema<SchemaOf<Req>, SchemaOf<Res>>>,
  ) {
    super();
    this.schema = {
      ...options,
      ...schema.s.Function(schema.s.any, schema.s.any),
    } as any;
  }

  public getSchema(): schema.FunctionSchema<SchemaOf<Req>, SchemaOf<Res>> {
    return {
      ...this.schema,
      req: this.req.getSchema() as SchemaOf<Req>,
      res: this.res.getSchema() as SchemaOf<Res>,
    };
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'fn');
    this.req.validateSchema();
    this.res.validateSchema();
  }

  public random(): unknown {
    return async () => this.res.random();
  }

  public singleton?: FunctionImpl<Req, Res, any> = undefined;

  public implement<Ctx = unknown>(singleton: FunctionImpl<Req, Res, Ctx>): this {
    this.singleton = singleton;
    return this;
  }

  public toTypeScriptAst(): ts.TsFunctionType {
    const node: ts.TsFunctionType = {
      node: 'FunctionType',
      parameters: [
        {
          node: 'Parameter',
          name: {
            node: 'Identifier',
            name: 'request',
          },
          type: this.req.toTypeScriptAst(),
        },
      ],
      type: {
        node: 'TypeReference',
        typeName: {
          node: 'Identifier',
          name: 'Promise',
        },
        typeArguments: [this.res.toTypeScriptAst()],
      },
    };
    return node;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + toStringTree(tab, this);
  }
}

type FunctionStreamingImpl<Req extends Type, Res extends Type, Ctx = unknown> = (
  req: Observable<ResolveType<Req>>,
  ctx: Ctx,
) => Observable<ResolveType<Res>>;

export class FunctionStreamingType<Req extends Type, Res extends Type> extends AbstractType<
  schema.FunctionStreamingSchema<SchemaOf<Req>, SchemaOf<Res>>
> {
  public readonly isStreaming = true;
  protected schema: schema.FunctionStreamingSchema<SchemaOf<Req>, SchemaOf<Res>>;

  constructor(
    public readonly req: Req,
    public readonly res: Res,
    options?: schema.Optional<schema.FunctionStreamingSchema<SchemaOf<Req>, SchemaOf<Res>>>,
  ) {
    super();
    this.schema = {
      ...options,
      ...schema.s.Function$(schema.s.any, schema.s.any),
    } as any;
  }

  public getSchema(): schema.FunctionStreamingSchema<SchemaOf<Req>, SchemaOf<Res>> {
    return {
      ...this.schema,
      req: this.req.getSchema() as SchemaOf<Req>,
      res: this.res.getSchema() as SchemaOf<Res>,
    };
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'fn$');
    this.req.validateSchema();
    this.res.validateSchema();
  }

  public random(): unknown {
    return async () => this.res.random();
  }

  public singleton?: FunctionStreamingImpl<Req, Res, any> = undefined;

  public implement<Ctx = unknown>(singleton: FunctionStreamingImpl<Req, Res, Ctx>): this {
    this.singleton = singleton;
    return this;
  }

  public toTypeScriptAst(): ts.TsFunctionType {
    const node: ts.TsFunctionType = {
      node: 'FunctionType',
      parameters: [
        {
          node: 'Parameter',
          name: {
            node: 'Identifier',
            name: 'request$',
          },
          type: {
            node: 'TypeReference',
            typeName: {
              node: 'Identifier',
              name: 'Observable',
            },
            typeArguments: [this.req.toTypeScriptAst()],
          },
        },
      ],
      type: {
        node: 'TypeReference',
        typeName: {
          node: 'Identifier',
          name: 'Observable',
        },
        typeArguments: [this.res.toTypeScriptAst()],
      },
    };
    return node;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + toStringTree(tab, this);
  }
}
