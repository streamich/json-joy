import * as schema from '../../schema';
import {printTree} from '../../../util/print/printTree';
import {validateMinMax, validateTType} from '../../schema/validate';
import {ValidatorCodegenContext} from '../../codegen/validator/ValidatorCodegenContext';
import {ValidationPath} from '../../codegen/validator/types';
import {ValidationError} from '../../constants';
import {JsonTextEncoderCodegenContext} from '../../codegen/json/JsonTextEncoderCodegenContext';
import {CborEncoderCodegenContext} from '../../codegen/binary/CborEncoderCodegenContext';
import {JsonEncoderCodegenContext} from '../../codegen/binary/JsonEncoderCodegenContext';
import {BinaryEncoderCodegenContext} from '../../codegen/binary/BinaryEncoderCodegenContext';
import {JsExpression} from '@jsonjoy.com/json-pack/lib/util/codegen/util/JsExpression';
import {MessagePackEncoderCodegenContext} from '../../codegen/binary/MessagePackEncoderCodegenContext';
import {BinaryJsonEncoder} from '@jsonjoy.com/json-pack/lib/types';
import {CapacityEstimatorCodegenContext} from '../../codegen/capacity/CapacityEstimatorCodegenContext';
import {MaxEncodingOverhead} from '../../../json-size';
import {AbstractType} from './AbstractType';
import {ConstType} from './ConstType';
import {BooleanType} from './BooleanType';
import {NumberType} from './NumberType';
import type * as jsonSchema from '../../../json-schema';
import type {SchemaOf, Type} from '../types';
import type {TypeSystem} from '../../system/TypeSystem';
import type {json_string} from '../../../json-brand';
import type * as ts from '../../typescript/types';
import type {TypeExportContext} from '../../system/TypeExportContext';

export class ArrayType<T extends Type> extends AbstractType<schema.ArraySchema<SchemaOf<T>>> {
  protected schema: schema.ArraySchema<any>;

  constructor(
    protected type: T,
    options?: schema.Optional<schema.ArraySchema>,
  ) {
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
