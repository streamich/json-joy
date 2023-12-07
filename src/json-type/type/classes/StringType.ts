import * as schema from '../../schema';
import {RandomJson} from '../../../json-random';
import {asString} from '../../../util/strings/asString';
import {validateMinMax, validateTType, validateWithValidator} from '../../schema/validate';
import {ValidatorCodegenContext} from '../../codegen/validator/ValidatorCodegenContext';
import {ValidationPath} from '../../codegen/validator/types';
import {ValidationError} from '../../constants';
import {JsonTextEncoderCodegenContext} from '../../codegen/json/JsonTextEncoderCodegenContext';
import {CborEncoderCodegenContext} from '../../codegen/binary/CborEncoderCodegenContext';
import {JsonEncoderCodegenContext} from '../../codegen/binary/JsonEncoderCodegenContext';
import {BinaryEncoderCodegenContext} from '../../codegen/binary/BinaryEncoderCodegenContext';
import {JsExpression} from '../../../util/codegen/util/JsExpression';
import {MessagePackEncoderCodegenContext} from '../../codegen/binary/MessagePackEncoderCodegenContext';
import {BinaryJsonEncoder} from '../../../json-pack/types';
import {CapacityEstimatorCodegenContext} from '../../codegen/capacity/CapacityEstimatorCodegenContext';
import {MaxEncodingOverhead} from '../../../json-size';
import {AbstractType} from './AbstractType';
import type * as jsonSchema from '../../../json-schema';
import type {TypeSystem} from '../../system/TypeSystem';
import type {json_string} from '../../../json-brand';
import type * as ts from '../../typescript/types';
import type {TypeExportContext} from '../../system/TypeExportContext';
import type * as jtd from '../../jtd/types';

export class StringType extends AbstractType<schema.StringSchema> {
  constructor(protected schema: schema.StringSchema) {
    super();
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaString {
    const schema = this.getSchema();
    const jsonSchema = <jsonSchema.JsonSchemaString>{
      type: 'string',
      ...super.toJsonSchema(ctx),
    };
    if (schema.min !== undefined) jsonSchema.minLength = schema.min;
    if (schema.max !== undefined) jsonSchema.maxLength = schema.max;
    return jsonSchema;
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'str');
    validateWithValidator(schema);
    const {min, max, ascii, noJsonEscape} = schema;
    validateMinMax(min, max);
    if (ascii !== undefined) {
      if (typeof ascii !== 'boolean') throw new Error('ASCII');
    }
    if (noJsonEscape !== undefined) {
      if (typeof noJsonEscape !== 'boolean') throw new Error('NO_JSON_ESCAPE_TYPE');
    }
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const error = ctx.err(ValidationError.STR, path);
    ctx.js(/* js */ `if(typeof ${r} !== "string") return ${error};`);
    const {min, max} = this.schema;
    if (typeof min === 'number' && min === max) {
      const err = ctx.err(ValidationError.STR_LEN, path);
      ctx.js(/* js */ `if(${r}.length !== ${min}) return ${err};`);
    } else {
      if (typeof min === 'number') {
        const err = ctx.err(ValidationError.STR_LEN, path);
        ctx.js(/* js */ `if(${r}.length < ${min}) return ${err};`);
      }
      if (typeof max === 'number') {
        const err = ctx.err(ValidationError.STR_LEN, path);
        ctx.js(/* js */ `if(${r}.length > ${max}) return ${err};`);
      }
    }
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    if (this.schema.noJsonEscape) {
      ctx.writeText('"');
      ctx.js(/* js */ `s += ${value.use()};`);
      ctx.writeText('"');
    } else ctx.js(/* js */ `s += asString(${value.use()});`);
  }

  private codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    const ascii = this.schema.ascii;
    const v = value.use();
    if (ascii) ctx.js(/* js */ `encoder.writeAsciiStr(${v});`);
    else ctx.js(/* js */ `encoder.writeStr(${v});`);
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
    ctx.inc(MaxEncodingOverhead.String);
    ctx.codegen.js(`size += ${MaxEncodingOverhead.StringLengthMultiplier} * ${value.use()}.length;`);
  }

  public random(): string {
    let length = Math.round(Math.random() * 10);
    const {min, max} = this.schema;
    if (min !== undefined && length < min) length = min + length;
    if (max !== undefined && length > max) length = max;
    return RandomJson.genString(length);
  }

  public toTypeScriptAst(): ts.TsStringKeyword {
    return {node: 'StringKeyword'};
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system): json_string<unknown> {
    return <json_string<string>>(this.schema.noJsonEscape ? '"' + value + '"' : asString(value as string));
  }

  public toJtdForm(): jtd.JtdTypeForm {
    return {type: 'string'};
  }
}
