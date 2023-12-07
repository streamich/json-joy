import * as schema from '../schema';
import {RandomJson} from '../../json-random';
import {printTree} from '../../util/print/printTree';
import {asString} from '../../util/strings/asString';
import {validateTType} from '../schema/validate';
import {ValidatorCodegenContext} from '../codegen/validator/ValidatorCodegenContext';
import {ValidationPath} from '../codegen/validator/types';
import {ValidationError} from '../constants';
import {JsonTextEncoderCodegenContext} from '../codegen/json/JsonTextEncoderCodegenContext';
import {CompiledBinaryEncoder} from '../codegen/types';
import {CborEncoderCodegenContext} from '../codegen/binary/CborEncoderCodegenContext';
import {JsonEncoderCodegenContext} from '../codegen/binary/JsonEncoderCodegenContext';
import {BinaryEncoderCodegenContext} from '../codegen/binary/BinaryEncoderCodegenContext';
import {JsExpression} from '../../util/codegen/util/JsExpression';
import {MessagePackEncoderCodegenContext} from '../codegen/binary/MessagePackEncoderCodegenContext';
import {EncodingFormat} from '../../json-pack/constants';
import {BinaryJsonEncoder} from '../../json-pack/types';
import {CapacityEstimatorCodegenContext} from '../codegen/capacity/CapacityEstimatorCodegenContext';
import {MaxEncodingOverhead} from '../../json-size';
import {JsonExpressionCodegen} from '../../json-expression';
import {operatorsMap} from '../../json-expression/operators';
import {Vars} from '../../json-expression/Vars';
import {Discriminator} from './discriminator';
import {AbstractType} from './classes/AbstractType';
import {AnyType} from './classes/AnyType';
import {ConstType} from './classes/ConstType';
import {BooleanType} from './classes/BooleanType';
import {NumberType} from './classes/NumberType';
import {StringType} from './classes/StringType';
import {BinaryType} from './classes/BinaryType';
import {ArrayType} from './classes/ArrayType';
import {TupleType} from './classes/TupleType';
import {ObjectType, ObjectFieldType, ObjectOptionalFieldType} from './classes/ObjectType';
import type * as jsonSchema from '../../json-schema';
import type {SchemaOf, Type} from './types';
import type {TypeSystem} from '../system/TypeSystem';
import type {json_string} from '../../json-brand';
import type * as ts from '../typescript/types';
import type {TypeExportContext} from '../system/TypeExportContext';
import type {ResolveType} from '../system';
import type {Observable} from 'rxjs';

export {
  AbstractType,
  AnyType,
  ConstType,
  BooleanType,
  NumberType,
  StringType,
  BinaryType,
  ArrayType,
  TupleType,
  ObjectFieldType,
  ObjectOptionalFieldType,
  ObjectType,
};

export class MapType<T extends Type> extends AbstractType<schema.MapSchema<SchemaOf<T>>> {
  protected schema: schema.MapSchema<any>;

  constructor(protected type: T, options?: schema.Optional<schema.MapSchema>) {
    super();
    this.schema = schema.s.Map(schema.s.any, options);
  }

  public getSchema(ctx?: TypeExportContext): schema.MapSchema<SchemaOf<T>> {
    return {
      ...this.schema,
      type: this.type.getSchema(ctx) as any,
    };
  }

  public toJsonSchema(): jsonSchema.JsonSchemaObject {
    const jsonSchema = <jsonSchema.JsonSchemaObject>{
      type: 'object',
      patternProperties: {
        '.*': this.type.toJsonSchema(),
      },
    };
    return jsonSchema;
  }

  public getOptions(): schema.Optional<schema.MapSchema<SchemaOf<T>>> {
    const {__t, type, ...options} = this.schema;
    return options as any;
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'map');
    this.type.validateSchema();
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const err = ctx.err(ValidationError.MAP, path);
    ctx.js(`if (!${r} || (typeof ${r} !== 'object') || (${r}.constructor !== Object)) return ${err};`);
    const rKeys = ctx.codegen.var(`Object.keys(${r});`);
    const rLength = ctx.codegen.var(`${rKeys}.length`);
    const rKey = ctx.codegen.r();
    const rValue = ctx.codegen.r();
    ctx.js(`for (var ${rKey}, ${rValue}, i = 0; i < ${rLength}; i++) {`);
    ctx.js(`${rKey} = ${rKeys}[i];`);
    ctx.js(`${rValue} = ${r}[${rKey}];`);
    this.type.codegenValidator(ctx, [...path, {r: rKey}], rValue);
    ctx.js(`}`);
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    ctx.writeText('{');
    const r = ctx.codegen.var(value.use());
    const rKeys = ctx.codegen.var(`Object.keys(${r})`);
    const rLength = ctx.codegen.var(`${rKeys}.length`);
    const rKey = ctx.codegen.var();
    ctx.codegen.if(`${rLength}`, () => {
      ctx.js(`${rKey} = ${rKeys}[0];`);
      ctx.js(`s += asString(${rKey}) + ':';`);
      this.type.codegenJsonTextEncoder(ctx, new JsExpression(() => `${r}[${rKey}]`));
    });
    ctx.js(`for (var i = 1; i < ${rLength}; i++) {`);
    ctx.js(`${rKey} = ${rKeys}[i];`);
    ctx.js(`s += ',' + asString(${rKey}) + ':';`);
    this.type.codegenJsonTextEncoder(ctx, new JsExpression(() => `${r}[${rKey}]`));
    ctx.js(`}`);
    ctx.writeText('}');
  }

  private codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    const type = this.type;
    const codegen = ctx.codegen;
    const r = codegen.var(value.use());
    const rKeys = codegen.var(`Object.keys(${r})`);
    const rKey = codegen.var();
    const rLength = codegen.var(`${rKeys}.length`);
    const ri = codegen.var('0');
    ctx.js(`encoder.writeObjHdr(${rLength});`);
    ctx.js(`for(; ${ri} < ${rLength}; ${ri}++){`);
    ctx.js(`${rKey} = ${rKeys}[${ri}];`);
    ctx.js(`encoder.writeStr(${rKey});`);
    const expr = new JsExpression(() => `${r}[${rKey}]`);
    if (ctx instanceof CborEncoderCodegenContext) type.codegenCborEncoder(ctx, expr);
    else if (ctx instanceof MessagePackEncoderCodegenContext) type.codegenMessagePackEncoder(ctx, expr);
    else throw new Error('Unknown encoder');
    ctx.js(`}`);
  }

  public codegenCborEncoder(ctx: CborEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenMessagePackEncoder(ctx: MessagePackEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenJsonEncoder(ctx: JsonEncoderCodegenContext, value: JsExpression): void {
    const type = this.type;
    const objStartBlob = ctx.gen((encoder) => encoder.writeStartObj());
    const objEndBlob = ctx.gen((encoder) => encoder.writeEndObj());
    const separatorBlob = ctx.gen((encoder) => encoder.writeObjSeparator());
    const keySeparatorBlob = ctx.gen((encoder) => encoder.writeObjKeySeparator());
    const codegen = ctx.codegen;
    const r = codegen.var(value.use());
    const rKeys = codegen.var(`Object.keys(${r})`);
    const rKey = codegen.var();
    const rLength = codegen.var(`${rKeys}.length`);
    ctx.blob(objStartBlob);
    ctx.codegen.if(`${rLength}`, () => {
      ctx.js(`${rKey} = ${rKeys}[0];`);
      codegen.js(`encoder.writeStr(${rKey});`);
      ctx.blob(keySeparatorBlob);
      type.codegenJsonEncoder(ctx, new JsExpression(() => `${r}[${rKey}]`));
    });
    ctx.js(`for (var i = 1; i < ${rLength}; i++) {`);
    ctx.js(`${rKey} = ${rKeys}[i];`);
    ctx.blob(separatorBlob);
    codegen.js(`encoder.writeStr(${rKey});`);
    ctx.blob(keySeparatorBlob);
    type.codegenJsonEncoder(ctx, new JsExpression(() => `${r}[${rKey}]`));
    ctx.js(`}`);
    ctx.blob(objEndBlob);
  }

  public codegenCapacityEstimator(ctx: CapacityEstimatorCodegenContext, value: JsExpression): void {
    const codegen = ctx.codegen;
    ctx.inc(MaxEncodingOverhead.Object);
    const r = codegen.var(value.use());
    const rKeys = codegen.var(`Object.keys(${r})`);
    const rKey = codegen.var();
    const rLen = codegen.var(`${rKeys}.length`);
    codegen.js(`size += ${MaxEncodingOverhead.ObjectElement} * ${rLen}`);
    const type = this.type;
    const fn = type.compileCapacityEstimator({
      system: ctx.options.system,
      name: ctx.options.name,
    });
    const rFn = codegen.linkDependency(fn);
    const ri = codegen.var('0');
    codegen.js(`for (; ${ri} < ${rLen}; ${ri}++) {`);
    codegen.js(`${rKey} = ${rKeys}[${ri}];`);
    codegen.js(
      `size += ${MaxEncodingOverhead.String} + ${MaxEncodingOverhead.StringLengthMultiplier} * ${rKey}.length;`,
    );
    codegen.js(`size += ${rFn}(${r}[${rKey}]);`);
    codegen.js(`}`);
  }

  public random(): Record<string, unknown> {
    const length = Math.round(Math.random() * 10);
    const res: Record<string, unknown> = {};
    for (let i = 0; i < length; i++) res[RandomJson.genString(length)] = this.type.random();
    return res;
  }

  public toTypeScriptAst(): ts.TsTypeReference {
    const node: ts.TsTypeReference = {
      node: 'TypeReference',
      typeName: 'Record',
      typeArguments: [{node: 'StringKeyword'}, this.type.toTypeScriptAst()],
    };
    // augmentWithComment(this.schema, node);
    return node;
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system): json_string<unknown> {
    const map = value as Record<string, unknown>;
    const keys = Object.keys(map);
    const length = keys.length;
    if (!length) return '{}' as json_string<unknown>;
    const last = length - 1;
    const type = this.type;
    let str = '{';
    for (let i = 0; i < last; i++) {
      const key = keys[i];
      const val = (value as any)[key];
      if (val === undefined) continue;
      str += asString(key) + ':' + type.toJson(val as any, system) + ',';
    }
    const key = keys[last];
    const val = (value as any)[key];
    if (val !== undefined) {
      str += asString(key) + ':' + type.toJson(val as any, system);
    } else if (str.length > 1) str = str.slice(0, -1);
    return (str + '}') as json_string<unknown>;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + printTree(tab, [(tab) => this.type.toString(tab)]);
  }
}

export class RefType<T extends Type> extends AbstractType<schema.RefSchema<SchemaOf<T>>> {
  protected schema: schema.RefSchema<SchemaOf<T>>;

  constructor(ref: string) {
    super();
    this.schema = schema.s.Ref<SchemaOf<T>>(ref);
  }

  public getRef(): string {
    return this.schema.ref;
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaRef {
    const ref = this.schema.ref;
    if (ctx) ctx.mentionRef(ref);
    const jsonSchema = <jsonSchema.JsonSchemaRef>{
      $ref: `#/$defs/${ref}`,
      ...super.toJsonSchema(ctx),
    };
    return jsonSchema;
  }

  public getOptions(): schema.Optional<schema.RefSchema<SchemaOf<T>>> {
    const {__t, ref, ...options} = this.schema;
    return options as any;
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'ref');
    const {ref} = schema;
    if (typeof ref !== 'string') throw new Error('REF_TYPE');
    if (!ref) throw new Error('REF_EMPTY');
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const refErr = (errorRegister: string): string => {
      switch (ctx.options.errors) {
        case 'boolean':
          return errorRegister;
        case 'string': {
          return ctx.err(ValidationError.REF, [...path, {r: errorRegister}]);
        }
        case 'object':
        default: {
          return ctx.err(ValidationError.REF, [...path], {refId: this.schema.ref, refError: errorRegister});
        }
      }
    };
    const system = ctx.options.system || this.system;
    if (!system) throw new Error('NO_SYSTEM');
    const validator = system.resolve(this.schema.ref).type.validator(ctx.options.errors!);
    const d = ctx.codegen.linkDependency(validator);
    const rerr = ctx.codegen.getRegister();
    ctx.js(/* js */ `var ${rerr} = ${d}(${r});`);
    ctx.js(/* js */ `if (${rerr}) return ${refErr(rerr)};`);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    const system = ctx.options.system || this.system;
    if (!system) throw new Error('NO_SYSTEM');
    const encoder = system.resolve(this.schema.ref).type.jsonTextEncoder();
    const d = ctx.codegen.linkDependency(encoder);
    ctx.js(/* js */ `s += ${d}(${value.use()});`);
  }

  private codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    const system = ctx.options.system || this.system;
    if (!system) throw new Error('NO_SYSTEM');
    const kind =
      ctx instanceof CborEncoderCodegenContext
        ? EncodingFormat.Cbor
        : ctx instanceof MessagePackEncoderCodegenContext
        ? EncodingFormat.MsgPack
        : EncodingFormat.Json;
    const targetType = system.resolve(this.schema.ref).type;
    switch (targetType.getTypeName()) {
      case 'str':
      case 'bool':
      case 'num':
      case 'any':
      case 'tup': {
        if (ctx instanceof CborEncoderCodegenContext) targetType.codegenCborEncoder(ctx, value);
        else if (ctx instanceof MessagePackEncoderCodegenContext) targetType.codegenMessagePackEncoder(ctx, value);
        else if (ctx instanceof JsonEncoderCodegenContext) targetType.codegenJsonEncoder(ctx, value);
        break;
      }
      default: {
        const encoder = targetType.encoder(kind) as CompiledBinaryEncoder;
        const d = ctx.codegen.linkDependency(encoder);
        ctx.js(/* js */ `${d}(${value.use()}, encoder);`);
      }
    }
  }

  public codegenCborEncoder(ctx: CborEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenMessagePackEncoder(ctx: MessagePackEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenJsonEncoder(ctx: JsonEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenCapacityEstimator(ctx: CapacityEstimatorCodegenContext, value: JsExpression): void {
    const system = ctx.options.system || this.system;
    if (!system) throw new Error('NO_SYSTEM');
    const estimator = system.resolve(this.schema.ref).type.capacityEstimator();
    const d = ctx.codegen.linkDependency(estimator);
    ctx.codegen.js(`size += ${d}(${value.use()});`);
  }

  public random(): unknown {
    if (!this.system) throw new Error('NO_SYSTEM');
    const alias = this.system.resolve(this.schema.ref);
    return alias.type.random();
  }

  public toTypeScriptAst(): ts.TsGenericTypeAnnotation {
    return {
      node: 'GenericTypeAnnotation',
      id: {
        node: 'Identifier',
        name: this.schema.ref,
      },
    };
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system): json_string<unknown> {
    if (!system) return 'null' as json_string<unknown>;
    const alias = system.resolve(this.schema.ref);
    return alias.type.toJson(value, system) as json_string<unknown>;
  }

  public toStringTitle(tab: string = ''): string {
    const options = this.toStringOptions();
    return `${super.toStringTitle()} → [${this.schema.ref}]` + (options ? ` ${options}` : '');
  }
}

export class OrType<T extends Type[]> extends AbstractType<schema.OrSchema<{[K in keyof T]: SchemaOf<T[K]>}>> {
  protected schema: schema.OrSchema<any>;

  constructor(protected types: T, options?: Omit<schema.OrSchema, '__t' | 'type'>) {
    super();
    this.schema = {
      ...schema.s.Or(),
      ...options,
      discriminator: options?.discriminator ?? Discriminator.createExpression(types),
    };
  }

  public getSchema(): schema.OrSchema<{[K in keyof T]: SchemaOf<T[K]>}> {
    return {
      ...this.schema,
      types: this.types.map((type) => type.getSchema()) as any,
    };
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaOr {
    return <jsonSchema.JsonSchemaOr>{
      anyOf: this.types.map((type) => type.toJsonSchema(ctx)),
    };
  }

  public getOptions(): schema.Optional<schema.OrSchema<{[K in keyof T]: SchemaOf<T[K]>}>> {
    const {__t, types, ...options} = this.schema;
    return options as any;
  }

  public options(options: schema.Optional<schema.OrSchema> & Pick<schema.OrSchema, 'discriminator'>): this {
    Object.assign(this.schema, options);
    return this;
  }

  private __discriminator: undefined | ((val: unknown) => number) = undefined;
  public discriminator(): (val: unknown) => number {
    if (this.__discriminator) return this.__discriminator;
    const expr = this.schema.discriminator;
    if (!expr || (expr[0] === 'num' && expr[1] === 0)) throw new Error('NO_DISCRIMINATOR');
    const codegen = new JsonExpressionCodegen({
      expression: expr,
      operators: operatorsMap,
    });
    const fn = codegen.run().compile();
    return (this.__discriminator = (data: unknown) => +(fn({vars: new Vars(data)}) as any));
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'or');
    const {types, discriminator} = schema;
    if (!discriminator || (discriminator[0] === 'num' && discriminator[1] === -1)) throw new Error('DISCRIMINATOR');
    if (!Array.isArray(types)) throw new Error('TYPES_TYPE');
    if (!types.length) throw new Error('TYPES_LENGTH');
    for (const type of this.types) type.validateSchema();
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const types = this.types;
    const codegen = ctx.codegen;
    const length = types.length;
    if (length === 1) {
      types[0].codegenValidator(ctx, path, r);
      return;
    }
    const discriminator = this.discriminator();
    const d = codegen.linkDependency(discriminator);
    codegen.switch(
      `${d}(${r})`,
      types.map((type, index) => [
        index,
        () => {
          type.codegenValidator(ctx, path, r);
        },
      ]),
      () => {
        const err = ctx.err(ValidationError.OR, path);
        ctx.js(`return ${err}`);
      },
    );
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    ctx.js(/* js */ `s += stringify(${value.use()});`);
  }

  private codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    const codegen = ctx.codegen;
    const discriminator = this.discriminator();
    const d = codegen.linkDependency(discriminator);
    const types = this.types;
    codegen.switch(
      `${d}(${value.use()})`,
      types.map((type, index) => [
        index,
        () => {
          if (ctx instanceof CborEncoderCodegenContext) type.codegenCborEncoder(ctx, value);
          else if (ctx instanceof MessagePackEncoderCodegenContext) type.codegenMessagePackEncoder(ctx, value);
          else if (ctx instanceof JsonEncoderCodegenContext) type.codegenJsonEncoder(ctx, value);
        },
      ]),
    );
  }

  public codegenCborEncoder(ctx: CborEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenMessagePackEncoder(ctx: MessagePackEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenJsonEncoder(ctx: JsonEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenCapacityEstimator(ctx: CapacityEstimatorCodegenContext, value: JsExpression): void {
    const codegen = ctx.codegen;
    const discriminator = this.discriminator();
    const d = codegen.linkDependency(discriminator);
    const types = this.types;
    codegen.switch(
      `${d}(${value.use()})`,
      types.map((type, index) => [
        index,
        () => {
          type.codegenCapacityEstimator(ctx, value);
        },
      ]),
    );
  }

  public random(): unknown {
    const types = this.types;
    const index = Math.floor(Math.random() * types.length);
    return types[index].random();
  }

  public toTypeScriptAst(): ts.TsUnionType {
    const node: ts.TsUnionType = {
      node: 'UnionType',
      types: this.types.map((t) => t.toTypeScriptAst()),
    };
    return node;
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system): json_string<unknown> {
    return JSON.stringify(value) as json_string<unknown>;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + printTree(tab, [...this.types.map((type) => (tab: string) => type.toString(tab))]);
  }
}

const fnNotImplemented: schema.FunctionValue<any, any> = async () => {
  throw new Error('NOT_IMPLEMENTED');
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
    return (
      super.toString(tab) +
      printTree(tab, [(tab) => 'req: ' + this.req.toString(tab), (tab) => 'res: ' + this.res.toString(tab)])
    );
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
    return (
      super.toString(tab) +
      printTree(tab, [(tab) => 'req: ' + this.req.toString(tab), (tab) => 'res: ' + this.res.toString(tab)])
    );
  }
}
