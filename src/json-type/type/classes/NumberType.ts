import * as schema from '../../schema';
import {floats, ints, uints} from '../../util';
import {validateTType, validateWithValidator} from '../../schema/validate';
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

export class NumberType extends AbstractType<schema.NumberSchema> {
  constructor(protected schema: schema.NumberSchema) {
    super();
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaNumber {
    const schema = this.getSchema();
    const jsonSchema = <jsonSchema.JsonSchemaNumber>{
      type: 'number',
      ...super.toJsonSchema(ctx),
    };
    if (schema.format && ints.has(schema.format)) jsonSchema.type = 'integer';
    if (schema.gt !== undefined) jsonSchema.exclusiveMinimum = schema.gt;
    if (schema.gte !== undefined) jsonSchema.minimum = schema.gte;
    if (schema.lt !== undefined) jsonSchema.exclusiveMaximum = schema.lt;
    if (schema.lte !== undefined) jsonSchema.maximum = schema.lte;
    return jsonSchema;
  }

  public validateSchema(): void {
    const schema = this.getSchema();
    validateTType(schema, 'num');
    validateWithValidator(schema);
    const {format, gt, gte, lt, lte} = schema;
    if (gt !== undefined && typeof gt !== 'number') throw new Error('GT_TYPE');
    if (gte !== undefined && typeof gte !== 'number') throw new Error('GTE_TYPE');
    if (lt !== undefined && typeof lt !== 'number') throw new Error('LT_TYPE');
    if (lte !== undefined && typeof lte !== 'number') throw new Error('LTE_TYPE');
    if (gt !== undefined && gte !== undefined) throw new Error('GT_GTE');
    if (lt !== undefined && lte !== undefined) throw new Error('LT_LTE');
    if ((gt !== undefined || gte !== undefined) && (lt !== undefined || lte !== undefined))
      if ((gt ?? gte)! > (lt ?? lte)!) throw new Error('GT_LT');
    if (format !== undefined) {
      if (typeof format !== 'string') throw new Error('FORMAT_TYPE');
      if (!format) throw new Error('FORMAT_EMPTY');
      switch (format) {
        case 'i':
        case 'u':
        case 'f':
        case 'i8':
        case 'i16':
        case 'i32':
        case 'i64':
        case 'u8':
        case 'u16':
        case 'u32':
        case 'u64':
        case 'f32':
        case 'f64':
          break;
        default:
          throw new Error('FORMAT_INVALID');
      }
    }
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const {format, gt, gte, lt, lte} = this.schema;
    if (format && ints.has(format)) {
      const errInt = ctx.err(ValidationError.INT, path);
      ctx.js(/* js */ `if(!Number.isInteger(${r})) return ${errInt};`);
      if (uints.has(format)) {
        const err = ctx.err(ValidationError.UINT, path);
        ctx.js(/* js */ `if(${r} < 0) return ${err};`);
        switch (format) {
          case 'u8': {
            ctx.js(/* js */ `if(${r} > 0xFF) return ${err};`);
            break;
          }
          case 'u16': {
            ctx.js(/* js */ `if(${r} > 0xFFFF) return ${err};`);
            break;
          }
          case 'u32': {
            ctx.js(/* js */ `if(${r} > 0xFFFFFFFF) return ${err};`);
            break;
          }
        }
      } else {
        switch (format) {
          case 'i8': {
            ctx.js(/* js */ `if(${r} > 0x7F || ${r} < -0x80) return ${errInt};`);
            break;
          }
          case 'i16': {
            ctx.js(/* js */ `if(${r} > 0x7FFF || ${r} < -0x8000) return ${errInt};`);
            break;
          }
          case 'i32': {
            ctx.js(/* js */ `if(${r} > 0x7FFFFFFF || ${r} < -0x80000000) return ${errInt};`);
            break;
          }
        }
      }
    } else if (floats.has(format)) {
      const err = ctx.err(ValidationError.NUM, path);
      ctx.codegen.js(/* js */ `if(!Number.isFinite(${r})) return ${err};`);
    } else {
      const err = ctx.err(ValidationError.NUM, path);
      ctx.codegen.js(/* js */ `if(typeof ${r} !== "number") return ${err};`);
    }
    if (gt !== undefined) {
      const err = ctx.err(ValidationError.GT, path);
      ctx.codegen.js(/* js */ `if(${r} <= ${gt}) return ${err};`);
    }
    if (gte !== undefined) {
      const err = ctx.err(ValidationError.GTE, path);
      ctx.codegen.js(/* js */ `if(${r} < ${gte}) return ${err};`);
    }
    if (lt !== undefined) {
      const err = ctx.err(ValidationError.LT, path);
      ctx.codegen.js(/* js */ `if(${r} >= ${lt}) return ${err};`);
    }
    if (lte !== undefined) {
      const err = ctx.err(ValidationError.LTE, path);
      ctx.codegen.js(/* js */ `if(${r} > ${lte}) return ${err};`);
    }
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    ctx.js(/* js */ `s += ${value.use()};`);
  }

  private codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    const {format} = this.schema;
    const v = value.use();
    if (uints.has(format)) ctx.js(/* js */ `encoder.writeUInteger(${v});`);
    else if (ints.has(format)) ctx.js(/* js */ `encoder.writeInteger(${v});`);
    else if (floats.has(format)) ctx.js(/* js */ `encoder.writeFloat(${v});`);
    else ctx.js(/* js */ `encoder.writeNumber(${v});`);
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
    ctx.inc(MaxEncodingOverhead.Number);
  }

  public random(): number {
    let num = Math.random();
    let min = Number.MIN_SAFE_INTEGER;
    let max = Number.MAX_SAFE_INTEGER;
    if (this.schema.gt !== undefined) min = this.schema.gt;
    if (this.schema.gte !== undefined) min = this.schema.gte + 0.000000000000001;
    if (this.schema.lt !== undefined) max = this.schema.lt;
    if (this.schema.lte !== undefined) max = this.schema.lte - 0.000000000000001;
    if (this.schema.format) {
      switch (this.schema.format) {
        case 'i8':
          min = Math.max(min, -0x80);
          max = Math.min(max, 0x7f);
          break;
        case 'i16':
          min = Math.max(min, -0x8000);
          max = Math.min(max, 0x7fff);
          break;
        case 'i32':
          min = Math.max(min, -0x80000000);
          max = Math.min(max, 0x7fffffff);
          break;
        case 'i64':
        case 'i':
          min = Math.max(min, -0x8000000000);
          max = Math.min(max, 0x7fffffffff);
          break;
        case 'u8':
          min = Math.max(min, 0);
          max = Math.min(max, 0xff);
          break;
        case 'u16':
          min = Math.max(min, 0);
          max = Math.min(max, 0xffff);
          break;
        case 'u32':
          min = Math.max(min, 0);
          max = Math.min(max, 0xffffffff);
          break;
        case 'u64':
        case 'u':
          min = Math.max(min, 0);
          max = Math.min(max, 0xffffffffffff);
          break;
      }
      return Math.round(num * (max - min)) + min;
    }
    num = num * (max - min) + min;
    if (Math.random() > 0.7) num = Math.round(num);
    if (num === -0) return 0;
    return num;
  }

  public toTypeScriptAst(): ts.TsNumberKeyword {
    return {node: 'NumberKeyword'};
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system) {
    return ('' + value) as json_string<number>;
  }
}
