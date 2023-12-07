import * as schema from '../../schema';
import {cloneBinary} from '../../../json-clone';
import {validateTType} from '../../schema/validate';
import {ValidatorCodegenContext} from '../../codegen/validator/ValidatorCodegenContext';
import {ValidationPath} from '../../codegen/validator/types';
import {ValidationError} from '../../constants';
import {$$deepEqual} from '../../../json-equal/$$deepEqual';
import {JsonTextEncoderCodegenContext} from '../../codegen/json/JsonTextEncoderCodegenContext';
import {CborEncoderCodegenContext} from '../../codegen/binary/CborEncoderCodegenContext';
import {JsonEncoderCodegenContext} from '../../codegen/binary/JsonEncoderCodegenContext';
import {BinaryEncoderCodegenContext} from '../../codegen/binary/BinaryEncoderCodegenContext';
import {JsExpression} from '../../../util/codegen/util/JsExpression';
import {MessagePackEncoderCodegenContext} from '../../codegen/binary/MessagePackEncoderCodegenContext';
import {BinaryJsonEncoder} from '../../../json-pack/types';
import {CapacityEstimatorCodegenContext} from '../../codegen/capacity/CapacityEstimatorCodegenContext';
import {maxEncodingCapacity} from '../../../json-size';
import {AbstractType} from './AbstractType';
import type * as jsonSchema from '../../../json-schema';
import type {TypeSystem} from '../../system/TypeSystem';
import type {json_string} from '../../../json-brand';
import type * as ts from '../../typescript/types';
import type {TypeExportContext} from '../../system/TypeExportContext';
import type * as jtd from '../../jtd/types';

export class ConstType<V = any> extends AbstractType<schema.ConstSchema<V>> {
  private __json: json_string<V>;

  constructor(protected schema: schema.ConstSchema<any>) {
    super();
    this.__json = JSON.stringify(schema.value) as any;
  }

  public value() {
    return this.schema.value;
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaValueNode {
    const schema = this.schema;
    return <jsonSchema.JsonSchemaValueNode>{
      type: typeof this.schema.value as any,
      const: schema.value,
      ...super.toJsonSchema(ctx),
    };
  }

  public getOptions(): schema.Optional<schema.ConstSchema<V>> {
    const {__t, value, ...options} = this.schema;
    return options as any;
  }

  public validateSchema(): void {
    validateTType(this.getSchema(), 'const');
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const value = this.schema.value;
    const equals = $$deepEqual(value);
    const fn = ctx.codegen.addConstant(equals);
    ctx.js(`if (!${fn}(${r})) return ${ctx.err(ValidationError.CONST, path)}`);
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    ctx.writeText(JSON.stringify(this.schema.value));
  }

  private codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    ctx.blob(
      ctx.gen((encoder) => {
        encoder.writeAny(this.schema.value);
      }),
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
    ctx.inc(maxEncodingCapacity(this.value()));
  }

  public random(): unknown {
    return cloneBinary(this.schema.value);
  }

  public toTypeScriptAst() {
    const value = this.schema.value;
    if (value === null) {
      const node: ts.TsNullKeyword = {node: 'NullKeyword'};
      return node;
    }
    switch (typeof value) {
      case 'string': {
        const node: ts.TsStringLiteral = {node: 'StringLiteral', text: value};
        return node;
      }
      case 'number': {
        const node: ts.TsNumericLiteral = {node: 'NumericLiteral', text: value.toString()};
        return node;
      }
      case 'boolean': {
        const node: ts.TsTrueKeyword | ts.TsFalseKeyword = {node: value ? 'TrueKeyword' : 'FalseKeyword'};
        return node;
      }
      case 'object': {
        const node: ts.TsObjectKeyword = {node: 'ObjectKeyword'};
        return node;
      }
      default: {
        const node: ts.TsUnknownKeyword = {node: 'UnknownKeyword'};
        return node;
      }
    }
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system) {
    return this.__json;
  }

  public toString(tab: string = ''): string {
    return `${super.toString(tab)} → ${JSON.stringify(this.schema.value)}`;
  }

  public toJtdForm(): jtd.JtdForm {
    const value = this.value();
    const type = typeof value;
    switch(type) {
      case 'boolean':
      case 'string':
        return {type};
      case 'number': {
        if (value !== Math.round(value)) return {type: 'float64'};
        if (value >= 0) {
          if (value <= 255) return {type: 'uint8'};
          if (value <= 65535) return {type: 'uint16'};
          if (value <= 4294967295) return {type: 'uint32'};
        } else {
          if (value >= -128) return {type: 'int8'};
          if (value >= -32768) return {type: 'int16'};
          if (value >= -2147483648) return {type: 'int32'};
        }
        return {type: 'float64'};
      }
    }
    return super.toJtdForm();
  }
}
