import * as schema from '../schema';
import {RandomJson} from '../../json-random';
import {stringifyBinary} from '../../json-binary';
import {printTree} from '../../util/print/printTree';
import {asString} from '../../util/strings/asString';
import {validateMinMax, validateTType, validateWithValidator} from '../schema/validate';
import {ValidatorCodegenContext} from '../codegen/validator/ValidatorCodegenContext';
import {ValidationPath} from '../codegen/validator/types';
import {ValidationError} from '../constants';
import {normalizeAccessor} from '../../util/codegen/util/normalizeAccessor';
import {canSkipObjectKeyUndefinedCheck} from '../codegen/validator/util';
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
import {MaxEncodingOverhead, maxEncodingCapacity} from '../../json-size';
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
import type * as jsonSchema from '../../json-schema';
import type {SchemaOf, SchemaOfObjectFields, Type} from './types';
import type {TypeSystem} from '../system/TypeSystem';
import type {json_string} from '../../json-brand';
import type * as ts from '../typescript/types';
import type {TypeExportContext} from '../system/TypeExportContext';
import type {ResolveType} from '../system';
import type {Observable} from 'rxjs';

const augmentWithComment = (
  type: schema.Schema | schema.ObjectFieldSchema,
  node: ts.TsDeclaration | ts.TsPropertySignature | ts.TsTypeLiteral,
) => {
  if (type.title || type.description) {
    let comment = '';
    if (type.title) comment += '# ' + type.title;
    if (type.title && type.description) comment += '\n\n';
    if (type.description) comment += type.description;
    node.comment = comment;
  }
};

export {
  AbstractType,
  AnyType,
  ConstType,
  BooleanType,
  NumberType,
  StringType,
};

export class BinaryType<T extends Type> extends AbstractType<schema.BinarySchema> {
  protected schema: schema.BinarySchema;

  constructor(protected type: T, options?: schema.Optional<schema.BinarySchema>) {
    super();
    this.schema = schema.s.Binary(schema.s.any, options);
  }

  public getSchema(): schema.BinarySchema<SchemaOf<T>> {
    return {
      ...this.schema,
      type: this.type.getSchema() as any,
    };
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaBinary {
    return <jsonSchema.JsonSchemaBinary>{
      type: 'binary',
      ...super.toJsonSchema(ctx),
    };
  }

  public getOptions(): schema.Optional<schema.ArraySchema<SchemaOf<T>>> {
    const {__t, type, ...options} = this.schema;
    return options as any;
  }

  public validateSchema(): void {
    validateTType(this.getSchema(), 'bin');
    this.type.validateSchema();
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const hasBuffer = typeof Buffer === 'function';
    const err = ctx.err(ValidationError.BIN, path);
    ctx.js(
      // prettier-ignore
      /* js */ `if(!(${r} instanceof Uint8Array)${hasBuffer ? /* js */ ` && !Buffer.isBuffer(${r})` : ''}) return ${err};`,
    );
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    ctx.linkBase64();
    ctx.writeText('"data:application/octet-stream;base64,');
    ctx.js(/* js */ `s += toBase64(${value.use()});`);
    ctx.writeText('"');
  }

  private codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    ctx.js(/* js */ `encoder.writeBin(${value.use()});`);
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
    ctx.inc(MaxEncodingOverhead.Binary);
    ctx.codegen.js(`size += ${MaxEncodingOverhead.BinaryLengthMultiplier} * ${value.use()}.length;`);
  }

  public random(): Uint8Array {
    const octets = RandomJson.genString()
      .split('')
      .map((c) => c.charCodeAt(0));
    return new Uint8Array(octets);
  }

  public toTypeScriptAst(): ts.TsGenericTypeAnnotation {
    return {
      node: 'GenericTypeAnnotation',
      id: {
        node: 'Identifier',
        name: 'Uint8Array',
      },
    };
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system): json_string<unknown> {
    return ('"' + stringifyBinary(value as Uint8Array) + '"') as json_string<unknown>;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + printTree(tab, [(tab) => this.type.toString(tab)]);
  }
}

export class ArrayType<T extends Type> extends AbstractType<schema.ArraySchema<SchemaOf<T>>> {
  protected schema: schema.ArraySchema<any>;

  constructor(protected type: T, options?: schema.Optional<schema.ArraySchema>) {
    super();
    this.schema = schema.s.Array(schema.s.any, options);
  }

  public getSchema(ctx?: TypeExportContext): schema.ArraySchema<SchemaOf<T>> {
    return {
      ...this.schema,
      type: this.type.getSchema(ctx) as any,
    };
  }

  public toJsonSchema(): jsonSchema.JsonSchemaArray {
    const schema = this.getSchema();
    const jsonSchema = <jsonSchema.JsonSchemaArray>{
      type: 'array',
      items: this.type.toJsonSchema(),
      ...super.toJsonSchema(),
    };
    if (schema.min !== undefined) jsonSchema.minItems = schema.min;
    if (schema.max !== undefined) jsonSchema.maxItems = schema.max;
    return jsonSchema;
  }

  public getOptions(): schema.Optional<schema.ArraySchema<SchemaOf<T>>> {
    const {__t, type, ...options} = this.schema;
    return options as any;
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'arr');
    const {min, max} = schema;
    validateMinMax(min, max);
    this.type.validateSchema();
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const rl = ctx.codegen.getRegister();
    const ri = ctx.codegen.getRegister();
    const rv = ctx.codegen.getRegister();
    const err = ctx.err(ValidationError.ARR, path);
    const errLen = ctx.err(ValidationError.ARR_LEN, path);
    const {min, max} = this.schema;
    ctx.js(/* js */ `if (!Array.isArray(${r})) return ${err};`);
    ctx.js(`var ${rl} = ${r}.length;`);
    if (min !== undefined) ctx.js(`if (${rl} < ${min}) return ${errLen};`);
    if (max !== undefined) ctx.js(`if (${rl} > ${max}) return ${errLen};`);
    ctx.js(`for (var ${rv}, ${ri} = ${r}.length; ${ri}-- !== 0;) {`);
    ctx.js(`${rv} = ${r}[${ri}];`);
    this.type.codegenValidator(ctx, [...path, {r: ri}], rv);
    ctx.js(`}`);
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    ctx.writeText('[');
    const codegen = ctx.codegen;
    const r = codegen.getRegister(); // array
    const rl = codegen.getRegister(); // array.length
    const rll = codegen.getRegister(); // last
    const ri = codegen.getRegister(); // index
    ctx.js(/* js */ `var ${r} = ${value.use()}, ${rl} = ${r}.length, ${rll} = ${rl} - 1, ${ri} = 0;`);
    ctx.js(/* js */ `for(; ${ri} < ${rll}; ${ri}++) ` + '{');
    this.type.codegenJsonTextEncoder(ctx, new JsExpression(() => `${r}[${ri}]`));
    ctx.js(/* js */ `s += ',';`);
    ctx.js(`}`);
    ctx.js(`if (${rl}) {`);
    this.type.codegenJsonTextEncoder(ctx, new JsExpression(() => `${r}[${rll}]`));
    ctx.js(`}`);
    ctx.writeText(']');
  }

  private codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    const type = this.type;
    const codegen = ctx.codegen;
    const r = codegen.getRegister(); // array
    const rl = codegen.getRegister(); // array.length
    const ri = codegen.getRegister(); // index
    const rItem = codegen.getRegister(); // item
    const expr = new JsExpression(() => `${rItem}`);
    ctx.js(/* js */ `var ${r} = ${value.use()}, ${rl} = ${r}.length, ${ri} = 0, ${rItem};`);
    ctx.js(/* js */ `encoder.writeArrHdr(${rl});`);
    ctx.js(/* js */ `for(; ${ri} < ${rl}; ${ri}++) ` + '{');
    ctx.js(/* js */ `${rItem} = ${r}[${ri}];`);
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
    const codegen = ctx.codegen;
    const expr = new JsExpression(() => `${rItem}`);
    const r = codegen.var(value.use());
    const rLen = codegen.var(`${r}.length`);
    const rLast = codegen.var(`${rLen} - 1`);
    const ri = codegen.var('0');
    const rItem = codegen.var();
    ctx.blob(
      ctx.gen((encoder) => {
        encoder.writeStartArr();
      }),
    );
    codegen.js(`for(; ${ri} < ${rLast}; ${ri}++) {`);
    codegen.js(`${rItem} = ${r}[${ri}];`);
    type.codegenJsonEncoder(ctx, expr);
    ctx.blob(
      ctx.gen((encoder) => {
        encoder.writeArrSeparator();
      }),
    );
    ctx.js(`}`);
    ctx.js(`if (${rLen}) {`);
    codegen.js(`${rItem} = ${r}[${rLast}];`);
    type.codegenJsonEncoder(ctx, expr);
    ctx.js(`}`);
    ctx.blob(
      ctx.gen((encoder) => {
        encoder.writeEndArr();
      }),
    );
  }

  public codegenCapacityEstimator(ctx: CapacityEstimatorCodegenContext, value: JsExpression): void {
    const codegen = ctx.codegen;
    ctx.inc(MaxEncodingOverhead.Array);
    const rLen = codegen.var(`${value.use()}.length`);
    const type = this.type;
    codegen.js(`size += ${MaxEncodingOverhead.ArrayElement} * ${rLen}`);
    const fn = type.compileCapacityEstimator({
      system: ctx.options.system,
      name: ctx.options.name,
    });
    const isConstantSizeType = type instanceof ConstType || type instanceof BooleanType || type instanceof NumberType;
    if (isConstantSizeType) {
      codegen.js(`size += ${rLen} * ${fn(null)};`);
    } else {
      const r = codegen.var(value.use());
      const rFn = codegen.linkDependency(fn);
      const ri = codegen.getRegister();
      codegen.js(`for(var ${ri} = ${rLen}; ${ri}-- !== 0;) size += ${rFn}(${r}[${ri}]);`);
    }
  }

  public random(): unknown[] {
    let length = Math.round(Math.random() * 10);
    const {min, max} = this.schema;
    if (min !== undefined && length < min) length = min + length;
    if (max !== undefined && length > max) length = max;
    const arr = [];
    for (let i = 0; i < length; i++) arr.push(this.type.random());
    return arr;
  }

  public toTypeScriptAst(): ts.TsArrayType {
    return {
      node: 'ArrayType',
      elementType: this.type.toTypeScriptAst() as ts.TsType,
    };
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system): json_string<unknown> {
    const length = (value as unknown[]).length;
    if (!length) return '[]' as json_string<unknown>;
    const last = length - 1;
    const type = this.type;
    let str = '[';
    for (let i = 0; i < last; i++) str += (type as any).toJson((value as unknown[])[i] as any, system) + ',';
    str += (type as any).toJson((value as unknown[])[last] as any, system);
    return (str + ']') as json_string<unknown>;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + printTree(tab, [(tab) => this.type.toString(tab)]);
  }
}

export class TupleType<T extends Type[]> extends AbstractType<schema.TupleSchema<{[K in keyof T]: SchemaOf<T[K]>}>> {
  protected schema: schema.TupleSchema<any>;

  constructor(public readonly types: T, options?: Omit<schema.TupleSchema, '__t' | 'type'>) {
    super();
    this.schema = {...schema.s.Tuple(), ...options};
  }

  public getSchema(): schema.TupleSchema<{[K in keyof T]: SchemaOf<T[K]>}> {
    return {
      ...this.schema,
      types: this.types.map((type) => type.getSchema()) as any,
    };
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaArray {
    const jsonSchema = <jsonSchema.JsonSchemaArray>{
      type: 'array',
      prefixItems: this.types.map((type) => type.toJsonSchema(ctx)),
      items: false,
      ...super.toJsonSchema(ctx),
    };
    return jsonSchema;
  }

  public getOptions(): schema.Optional<schema.TupleSchema<{[K in keyof T]: SchemaOf<T[K]>}>> {
    const {__t, types, ...options} = this.schema;
    return options as any;
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'tup');
    const {types} = schema;
    if (!Array.isArray(types)) throw new Error('TYPES_TYPE');
    if (!types.length) throw new Error('TYPES_LENGTH');
    for (const type of this.types) type.validateSchema();
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const err = ctx.err(ValidationError.TUP, path);
    const types = this.types;
    ctx.js(/* js */ `if (!Array.isArray(${r}) || ${r}.length !== ${types.length}) return ${err};`);
    for (let i = 0; i < this.types.length; i++) {
      const rv = ctx.codegen.getRegister();
      ctx.js(/* js */ `var ${rv} = ${r}[${i}];`);
      types[i].codegenValidator(ctx, [...path, i], rv);
    }
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    ctx.writeText('[');
    const types = this.types;
    const length = types.length;
    const last = length - 1;
    for (let i = 0; i < last; i++) {
      types[i].codegenJsonTextEncoder(ctx, new JsExpression(() => `${value.use()}[${i}]`));
      ctx.writeText(',');
    }
    types[last].codegenJsonTextEncoder(ctx, new JsExpression(() => `${value.use()}[${last}]`));
    ctx.writeText(']');
  }

  private codegenBinaryEncoder(
    ctx: CborEncoderCodegenContext | MessagePackEncoderCodegenContext,
    value: JsExpression,
  ): void {
    const types = this.types;
    const length = types.length;
    ctx.blob(
      ctx.gen((encoder) => {
        encoder.writeArrHdr(length);
      }),
    );
    const r = ctx.codegen.r();
    ctx.js(/* js */ `var ${r} = ${value.use()};`);
    for (let i = 0; i < length; i++)
      if (ctx instanceof CborEncoderCodegenContext)
        types[i].codegenCborEncoder(ctx, new JsExpression(() => `${r}[${i}]`));
      else types[i].codegenMessagePackEncoder(ctx, new JsExpression(() => `${r}[${i}]`));
  }

  public codegenCborEncoder(ctx: CborEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenMessagePackEncoder(ctx: MessagePackEncoderCodegenContext, value: JsExpression): void {
    this.codegenBinaryEncoder(ctx, value);
  }

  public codegenJsonEncoder(ctx: JsonEncoderCodegenContext, value: JsExpression): void {
    const codegen = ctx.codegen;
    const expr = new JsExpression(() => `${rItem}`);
    const r = codegen.var(value.use());
    const rItem = codegen.var();
    ctx.blob(
      ctx.gen((encoder) => {
        encoder.writeStartArr();
      }),
    );
    const types = this.types;
    const length = types.length;
    const arrSepBlob = ctx.gen((encoder) => {
      encoder.writeArrSeparator();
    });
    for (let i = 0; i < length; i++) {
      const type = types[i];
      const isLast = i === length - 1;
      codegen.js(`${rItem} = ${r}[${i}];`);
      type.codegenJsonEncoder(ctx, expr);
      if (!isLast) ctx.blob(arrSepBlob);
    }
    ctx.blob(
      ctx.gen((encoder) => {
        encoder.writeEndArr();
      }),
    );
  }

  public codegenCapacityEstimator(ctx: CapacityEstimatorCodegenContext, value: JsExpression): void {
    const codegen = ctx.codegen;
    const r = codegen.var(value.use());
    const types = this.types;
    const overhead = MaxEncodingOverhead.Array + MaxEncodingOverhead.ArrayElement * types.length;
    ctx.inc(overhead);
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const fn = type.compileCapacityEstimator({
        system: ctx.options.system,
        name: ctx.options.name,
      });
      const rFn = codegen.linkDependency(fn);
      codegen.js(`size += ${rFn}(${r}[${i}]);`);
    }
  }

  public random(): unknown[] {
    return this.types.map((type) => type.random());
  }

  public toTypeScriptAst(): ts.TsTupleType {
    return {
      node: 'TupleType',
      elements: this.types.map((type) => type.toTypeScriptAst() as ts.TsType),
    };
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system): json_string<unknown> {
    const types = this.types;
    const length = types.length;
    if (!length) return '[]' as json_string<unknown>;
    const last = length - 1;
    let str = '[';
    for (let i = 0; i < last; i++) str += (types[i] as any).toJson((value as unknown[])[i] as any, system) + ',';
    str += (types[last] as any).toJson((value as unknown[])[last] as any, system);
    return (str + ']') as json_string<unknown>;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + printTree(tab, [...this.types.map((type) => (tab: string) => type.toString(tab))]);
  }
}

export class ObjectFieldType<K extends string, V extends Type> extends AbstractType<
  schema.ObjectFieldSchema<K, SchemaOf<V>>
> {
  protected schema: schema.ObjectFieldSchema<K, any>;

  constructor(public readonly key: K, public readonly value: V) {
    super();
    this.schema = schema.s.prop(key, schema.s.any);
  }

  public getSchema(): schema.ObjectFieldSchema<K, SchemaOf<V>> {
    return {
      ...this.schema,
      type: this.value.getSchema() as any,
    };
  }

  public getOptions(): schema.Optional<schema.ObjectFieldSchema<K, SchemaOf<V>>> {
    const {__t, key, type, optional, ...options} = this.schema;
    return options as any;
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'field');
    const {key, optional} = schema;
    if (typeof key !== 'string') throw new Error('KEY_TYPE');
    if (optional !== undefined && typeof optional !== 'boolean') throw new Error('OPTIONAL_TYPE');
    this.value.validateSchema();
  }

  protected toStringTitle(): string {
    return `"${this.key}":`;
  }

  public toString(tab: string = ''): string {
    return super.toString(tab) + printTree(tab + ' ', [(tab) => this.value.toString(tab)]);
  }
}

export class ObjectOptionalFieldType<K extends string, V extends Type> extends ObjectFieldType<K, V> {
  public optional = true;

  constructor(public readonly key: K, public readonly value: V) {
    super(key, value);
    this.schema = schema.s.propOpt(key, schema.s.any);
  }

  protected toStringTitle(): string {
    return `"${this.key}"?:`;
  }
}

export class ObjectType<F extends ObjectFieldType<any, any>[] = ObjectFieldType<any, any>[]> extends AbstractType<
  schema.ObjectSchema<SchemaOfObjectFields<F>>
> {
  protected schema: schema.ObjectSchema<any> = schema.s.obj;

  constructor(public readonly fields: F) {
    super();
  }

  public getSchema(): schema.ObjectSchema<SchemaOfObjectFields<F>> {
    return {
      ...this.schema,
      fields: this.fields.map((f) => f.getSchema()) as any,
    };
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaObject {
    const jsonSchema = <jsonSchema.JsonSchemaObject>{
      type: 'object',
      properties: {},
      ...super.toJsonSchema(ctx),
    };
    const required = [];
    for (const field of this.fields) {
      jsonSchema.properties![field.key] = field.value.toJsonSchema(ctx);
      if (!(field instanceof ObjectOptionalFieldType)) required.push(field.key);
    }
    if (required.length) jsonSchema.required = required;
    if (this.schema.unknownFields === false) jsonSchema.additionalProperties = false;
    return jsonSchema;
  }

  public getOptions(): schema.Optional<schema.ObjectSchema<SchemaOfObjectFields<F>>> {
    const {__t, fields, ...options} = this.schema;
    return options as any;
  }

  public getField(key: string): ObjectFieldType<string, Type> | undefined {
    return this.fields.find((f) => f.key === key);
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'obj');
    validateWithValidator(schema);
    const {fields, unknownFields} = schema;
    if (!Array.isArray(fields)) throw new Error('FIELDS_TYPE');
    if (unknownFields !== undefined && typeof unknownFields !== 'boolean') throw new Error('UNKNOWN_FIELDS_TYPE');
    for (const field of this.fields) field.validateSchema();
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const fields = this.fields;
    const length = fields.length;
    const canSkipObjectTypeCheck = ctx.options.unsafeMode && length > 0;
    if (!canSkipObjectTypeCheck) {
      const err = ctx.err(ValidationError.OBJ, path);
      ctx.js(/* js */ `if (typeof ${r} !== 'object' || !${r} || (${r} instanceof Array)) return ${err};`);
    }
    const checkExtraKeys = length && !this.schema.unknownFields && !ctx.options.skipObjectExtraFieldsCheck;
    if (checkExtraKeys) {
      const rk = ctx.codegen.getRegister();
      ctx.js(`for (var ${rk} in ${r}) {`);
      ctx.js(
        `switch (${rk}) { case ${fields
          .map((field) => JSON.stringify(field.key))
          .join(': case ')}: break; default: return ${ctx.err(ValidationError.KEYS, [...path, {r: rk}])};}`,
      );
      ctx.js(`}`);
    }
    for (let i = 0; i < length; i++) {
      const field = fields[i];
      const rv = ctx.codegen.getRegister();
      const accessor = normalizeAccessor(field.key);
      const keyPath = [...path, field.key];
      if (field instanceof ObjectOptionalFieldType) {
        ctx.js(/* js */ `var ${rv} = ${r}${accessor};`);
        ctx.js(`if (${rv} !== undefined) {`);
        field.value.codegenValidator(ctx, keyPath, rv);
        ctx.js(`}`);
      } else {
        ctx.js(/* js */ `var ${rv} = ${r}${accessor};`);
        if (!canSkipObjectKeyUndefinedCheck((field.value as AbstractType<any>).getSchema().__t)) {
          const err = ctx.err(ValidationError.KEY, [...path, field.key]);
          ctx.js(/* js */ `if (${rv} === undefined) return ${err};`);
        }
        field.value.codegenValidator(ctx, keyPath, `${r}${accessor}`);
      }
    }
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    const {schema, fields} = this;
    const codegen = ctx.codegen;
    const r = codegen.getRegister();
    ctx.js(/* js */ `var ${r} = ${value.use()};`);
    const rKeys = ctx.codegen.getRegister();
    if (schema.encodeUnknownFields) {
      ctx.js(/* js */ `var ${rKeys} = new Set(Object.keys(${r}));`);
    }
    const requiredFields = fields.filter((field) => !(field instanceof ObjectOptionalFieldType));
    const optionalFields = fields.filter((field) => field instanceof ObjectOptionalFieldType);
    ctx.writeText('{');
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (i) ctx.writeText(',');
      ctx.writeText(JSON.stringify(field.key) + ':');
      const accessor = normalizeAccessor(field.key);
      const valueExpression = new JsExpression(() => `${r}${accessor}`);
      if (schema.encodeUnknownFields) ctx.js(/* js */ `${rKeys}.delete(${JSON.stringify(field.key)});`);
      field.value.codegenJsonTextEncoder(ctx, valueExpression);
    }
    const rHasFields = codegen.getRegister();
    if (!requiredFields.length) ctx.js(/* js */ `var ${rHasFields} = false;`);
    for (let i = 0; i < optionalFields.length; i++) {
      const field = optionalFields[i];
      const accessor = normalizeAccessor(field.key);
      const rValue = codegen.getRegister();
      if (schema.encodeUnknownFields) ctx.js(/* js */ `${rKeys}.delete(${JSON.stringify(field.key)});`);
      ctx.js(/* js */ `var ${rValue} = ${r}${accessor};`);
      ctx.js(`if (${rValue} !== undefined) {`);
      if (requiredFields.length) {
        ctx.writeText(',');
      } else {
        ctx.js(`if (${rHasFields}) s += ',';`);
        ctx.js(/* js */ `${rHasFields} = true;`);
      }
      ctx.writeText(JSON.stringify(field.key) + ':');
      const valueExpression = new JsExpression(() => `${rValue}`);
      field.value.codegenJsonTextEncoder(ctx, valueExpression);
      ctx.js(`}`);
    }
    if (schema.encodeUnknownFields) {
      const [rList, ri, rLength, rk] = [codegen.r(), codegen.r(), codegen.r(), codegen.r()];
      ctx.js(`var ${rLength} = ${rKeys}.size;
if (${rLength}) {
  var ${rk}, ${rList} = Array.from(${rKeys}.values());
  for (var ${ri} = 0; ${ri} < ${rLength}; ${ri}++) {
    ${rk} = ${rList}[${ri}];
    s += ',' + asString(${rk}) + ':' + stringify(${r}[${rk}]);
  }
}`);
    }
    ctx.writeText('}');
  }

  public codegenCborEncoder(ctx: CborEncoderCodegenContext, value: JsExpression): void {
    const codegen = ctx.codegen;
    const r = codegen.r();
    const fields = this.fields;
    const length = fields.length;
    const requiredFields = fields.filter((field) => !(field instanceof ObjectOptionalFieldType));
    const optionalFields = fields.filter((field) => field instanceof ObjectOptionalFieldType);
    const requiredLength = requiredFields.length;
    const optionalLength = optionalFields.length;
    const encodeUnknownFields = !!this.schema.encodeUnknownFields;
    const emitRequiredFields = () => {
      for (let i = 0; i < requiredLength; i++) {
        const field = requiredFields[i];
        ctx.blob(ctx.gen((encoder) => encoder.writeStr(field.key)));
        const accessor = normalizeAccessor(field.key);
        field.value.codegenCborEncoder(ctx, new JsExpression(() => `${r}${accessor}`));
      }
    };
    const emitOptionalFields = () => {
      for (let i = 0; i < optionalLength; i++) {
        const field = optionalFields[i];
        const accessor = normalizeAccessor(field.key);
        codegen.js(`if (${r}${accessor} !== undefined) {`);
        ctx.blob(ctx.gen((encoder) => encoder.writeStr(field.key)));
        field.value.codegenCborEncoder(ctx, new JsExpression(() => `${r}${accessor}`));
        codegen.js(`}`);
      }
    };
    const emitUnknownFields = () => {
      const rKeys = codegen.r();
      const rKey = codegen.r();
      const ri = codegen.r();
      const rLength = codegen.r();
      const keys = fields.map((field) => JSON.stringify(field.key));
      const rKnownFields = codegen.addConstant(`new Set([${keys.join(',')}])`);
      codegen.js(`var ${rKeys} = Object.keys(${r}), ${rLength} = ${rKeys}.length, ${rKey};`);
      codegen.js(`for (var ${ri} = 0; ${ri} < ${rLength}; ${ri}++) {`);
      codegen.js(`${rKey} = ${rKeys}[${ri}];`);
      codegen.js(`if (${rKnownFields}.has(${rKey})) continue;`);
      codegen.js(`encoder.writeStr(${rKey});`);
      codegen.js(`encoder.writeAny(${r}[${rKey}]);`);
      codegen.js(`}`);
    };
    ctx.js(/* js */ `var ${r} = ${value.use()};`);
    if (!encodeUnknownFields && !optionalLength) {
      ctx.blob(ctx.gen((encoder) => encoder.writeObjHdr(length)));
      emitRequiredFields();
    } else if (!encodeUnknownFields) {
      ctx.blob(ctx.gen((encoder) => encoder.writeStartObj()));
      emitRequiredFields();
      emitOptionalFields();
      ctx.blob(ctx.gen((encoder) => encoder.writeEndObj()));
    } else {
      ctx.blob(ctx.gen((encoder) => encoder.writeStartObj()));
      emitRequiredFields();
      emitOptionalFields();
      emitUnknownFields();
      ctx.blob(ctx.gen((encoder) => encoder.writeEndObj()));
    }
  }

  public codegenMessagePackEncoder(ctx: MessagePackEncoderCodegenContext, value: JsExpression): void {
    const codegen = ctx.codegen;
    const r = codegen.r();
    const fields = this.fields;
    const length = fields.length;
    const requiredFields = fields.filter((field) => !(field instanceof ObjectOptionalFieldType));
    const optionalFields = fields.filter((field) => field instanceof ObjectOptionalFieldType);
    const requiredLength = requiredFields.length;
    const optionalLength = optionalFields.length;
    const totalMaxKnownFields = requiredLength + optionalLength;
    if (totalMaxKnownFields > 0xffff) throw new Error('Too many fields');
    const encodeUnknownFields = !!this.schema.encodeUnknownFields;
    const rFieldCount = codegen.r();
    const emitRequiredFields = () => {
      for (let i = 0; i < requiredLength; i++) {
        const field = requiredFields[i];
        ctx.blob(ctx.gen((encoder) => encoder.writeStr(field.key)));
        const accessor = normalizeAccessor(field.key);
        field.value.codegenMessagePackEncoder(ctx, new JsExpression(() => `${r}${accessor}`));
      }
    };
    const emitOptionalFields = () => {
      for (let i = 0; i < optionalLength; i++) {
        const field = optionalFields[i];
        const accessor = normalizeAccessor(field.key);
        codegen.if(`${r}${accessor} !== undefined`, () => {
          codegen.js(`${rFieldCount}++;`);
          ctx.blob(ctx.gen((encoder) => encoder.writeStr(field.key)));
          field.value.codegenMessagePackEncoder(ctx, new JsExpression(() => `${r}${accessor}`));
        });
      }
    };
    const emitUnknownFields = () => {
      const ri = codegen.r();
      const rKeys = codegen.r();
      const rKey = codegen.r();
      const rLength = codegen.r();
      const keys = fields.map((field) => JSON.stringify(field.key));
      const rKnownFields = codegen.addConstant(`new Set([${keys.join(',')}])`);
      codegen.js(`var ${rKeys} = Object.keys(${r}), ${rLength} = ${rKeys}.length, ${rKey};`);
      codegen.js(`for (var ${ri} = 0; ${ri} < ${rLength}; ${ri}++) {`);
      codegen.js(`${rKey} = ${rKeys}[${ri}];`);
      codegen.js(`if (${rKnownFields}.has(${rKey})) continue;`);
      codegen.js(`${rFieldCount}++;`);
      codegen.js(`encoder.writeStr(${rKey});`);
      codegen.js(`encoder.writeAny(${r}[${rKey}]);`);
      codegen.js(`}`);
    };
    ctx.js(/* js */ `var ${r} = ${value.use()};`);
    if (!encodeUnknownFields && !optionalLength) {
      ctx.blob(ctx.gen((encoder) => encoder.writeObjHdr(length)));
      emitRequiredFields();
    } else if (!encodeUnknownFields) {
      codegen.js(`var ${rFieldCount} = ${requiredLength};`);
      const rHeaderPosition = codegen.var('writer.x');
      ctx.blob(ctx.gen((encoder) => encoder.writeObjHdr(0xffff)));
      emitRequiredFields();
      emitOptionalFields();
      codegen.js(`view.setUint16(${rHeaderPosition} + 1, ${rFieldCount});`);
    } else {
      codegen.js(`var ${rFieldCount} = ${requiredLength};`);
      const rHeaderPosition = codegen.var('writer.x');
      ctx.blob(ctx.gen((encoder) => encoder.writeObjHdr(0xffffffff)));
      emitRequiredFields();
      emitOptionalFields();
      emitUnknownFields();
      codegen.js(`view.setUint32(${rHeaderPosition} + 1, ${rFieldCount});`);
    }
  }

  public codegenJsonEncoder(ctx: JsonEncoderCodegenContext, value: JsExpression): void {
    const codegen = ctx.codegen;
    const r = codegen.var(value.use());
    const fields = this.fields;
    const requiredFields = fields.filter((field) => !(field instanceof ObjectOptionalFieldType));
    const optionalFields = fields.filter((field) => field instanceof ObjectOptionalFieldType);
    const requiredLength = requiredFields.length;
    const optionalLength = optionalFields.length;
    const encodeUnknownFields = !!this.schema.encodeUnknownFields;
    const separatorBlob = ctx.gen((encoder) => encoder.writeObjSeparator());
    const keySeparatorBlob = ctx.gen((encoder) => encoder.writeObjKeySeparator());
    const endBlob = ctx.gen((encoder) => encoder.writeEndObj());
    const emitRequiredFields = () => {
      for (let i = 0; i < requiredLength; i++) {
        const field = requiredFields[i];
        ctx.blob(
          ctx.gen((encoder) => {
            encoder.writeStr(field.key);
            encoder.writeObjKeySeparator();
          }),
        );
        const accessor = normalizeAccessor(field.key);
        field.value.codegenJsonEncoder(ctx, new JsExpression(() => `${r}${accessor}`));
        ctx.blob(separatorBlob);
      }
    };
    const emitOptionalFields = () => {
      for (let i = 0; i < optionalLength; i++) {
        const field = optionalFields[i];
        const accessor = normalizeAccessor(field.key);
        codegen.if(`${r}${accessor} !== undefined`, () => {
          ctx.blob(
            ctx.gen((encoder) => {
              encoder.writeStr(field.key);
            }),
          );
          ctx.blob(keySeparatorBlob);
          field.value.codegenJsonEncoder(ctx, new JsExpression(() => `${r}${accessor}`));
          ctx.blob(separatorBlob);
        });
      }
    };
    const emitUnknownFields = () => {
      const rKeys = codegen.r();
      const rKey = codegen.r();
      const ri = codegen.r();
      const rLength = codegen.r();
      const keys = fields.map((field) => JSON.stringify(field.key));
      const rKnownFields = codegen.addConstant(`new Set([${keys.join(',')}])`);
      codegen.js(`var ${rKeys} = Object.keys(${r}), ${rLength} = ${rKeys}.length, ${rKey};`);
      codegen.js(`for (var ${ri} = 0; ${ri} < ${rLength}; ${ri}++) {`);
      codegen.js(`${rKey} = ${rKeys}[${ri}];`);
      codegen.js(`if (${rKnownFields}.has(${rKey})) continue;`);
      codegen.js(`encoder.writeStr(${rKey});`);
      ctx.blob(keySeparatorBlob);
      codegen.js(`encoder.writeAny(${r}[${rKey}]);`);
      ctx.blob(separatorBlob);
      codegen.js(`}`);
    };
    const emitEnding = () => {
      const rewriteLastSeparator = () => {
        for (let i = 0; i < endBlob.length; i++) ctx.js(`uint8[writer.x - ${endBlob.length - i}] = ${endBlob[i]};`);
      };
      if (requiredFields.length) {
        rewriteLastSeparator();
      } else {
        codegen.if(
          `uint8[writer.x - 1] === ${separatorBlob[separatorBlob.length - 1]}`,
          () => {
            rewriteLastSeparator();
          },
          () => {
            ctx.blob(endBlob);
          },
        );
      }
    };
    ctx.blob(
      ctx.gen((encoder) => {
        encoder.writeStartObj();
      }),
    );
    if (!encodeUnknownFields && !optionalLength) {
      emitRequiredFields();
      emitEnding();
    } else if (!encodeUnknownFields) {
      emitRequiredFields();
      emitOptionalFields();
      emitEnding();
    } else {
      emitRequiredFields();
      emitOptionalFields();
      emitUnknownFields();
      emitEnding();
    }
  }

  public codegenCapacityEstimator(ctx: CapacityEstimatorCodegenContext, value: JsExpression): void {
    const codegen = ctx.codegen;
    const r = codegen.var(value.use());
    const encodeUnknownFields = !!this.schema.encodeUnknownFields;
    if (encodeUnknownFields) {
      codegen.js(`size += maxEncodingCapacity(${r});`);
      return;
    }
    const fields = this.fields;
    const overhead = MaxEncodingOverhead.Object + fields.length * MaxEncodingOverhead.ObjectElement;
    ctx.inc(overhead);
    for (const field of fields) {
      ctx.inc(maxEncodingCapacity(field.key));
      const accessor = normalizeAccessor(field.key);
      const isOptional = field instanceof ObjectOptionalFieldType;
      const block = () => field.value.codegenCapacityEstimator(ctx, new JsExpression(() => `${r}${accessor}`));
      if (isOptional) {
        codegen.if(`${r}${accessor} !== undefined`, block);
      } else block();
    }
  }

  public random(): Record<string, unknown> {
    const schema = this.schema;
    const obj: Record<string, unknown> = schema.unknownFields ? <Record<string, unknown>>RandomJson.genObject() : {};
    for (const field of this.fields) {
      if (field instanceof ObjectOptionalFieldType) if (Math.random() > 0.5) continue;
      obj[field.key] = field.value.random();
    }
    return obj;
  }

  public toTypeScriptAst(): ts.TsTypeLiteral {
    const node: ts.TsTypeLiteral = {
      node: 'TypeLiteral',
      members: [],
    };
    const fields = this.fields;
    for (const field of fields) {
      const member: ts.TsPropertySignature = {
        node: 'PropertySignature',
        name: field.key,
        type: field.value.toTypeScriptAst(),
      };
      if (field instanceof ObjectOptionalFieldType) member.optional = true;
      augmentWithComment(field.getSchema(), member);
      node.members.push(member);
    }
    if (this.schema.unknownFields || this.schema.encodeUnknownFields)
      node.members.push({
        node: 'IndexSignature',
        type: {node: 'UnknownKeyword'},
      });
    augmentWithComment(this.schema, node);
    return node;
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system): json_string<unknown> {
    const fields = this.fields;
    const length = fields.length;
    if (!length) return '{}' as json_string<unknown>;
    const last = length - 1;
    let str = '{';
    for (let i = 0; i < last; i++) {
      const field = fields[i];
      const key = field.key;
      const fieldType = field.value;
      const val = (value as any)[key];
      if (val === undefined) continue;
      str += asString(key) + ':' + fieldType.toJson(val as any, system) + ',';
    }
    const key = fields[last].key;
    const val = (value as any)[key];
    if (val !== undefined) {
      str += asString(key) + ':' + fields[last].value.toJson(val as any, system);
    } else if (str.length > 1) str = str.slice(0, -1);
    return (str + '}') as json_string<unknown>;
  }

  public toString(tab: string = ''): string {
    const {__t, fields, ...rest} = this.getSchema();
    return (
      super.toString(tab) +
      printTree(
        tab,
        this.fields.map((field) => (tab) => field.toString(tab)),
      )
    );
  }
}

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
