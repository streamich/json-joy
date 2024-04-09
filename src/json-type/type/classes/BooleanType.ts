import * as schema from '../../schema';
import {RandomJson} from '../../../json-random';
import {validateTType} from '../../schema/validate';
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
import type * as jsonSchema from '../../../json-schema';
import type {TypeSystem} from '../../system/TypeSystem';
import type {json_string} from '../../../json-brand';
import type * as ts from '../../typescript/types';
import type {TypeExportContext} from '../../system/TypeExportContext';
import type * as jtd from '../../jtd/types';

export class BooleanType extends AbstractType<schema.BooleanSchema> {
  constructor(protected schema: schema.BooleanSchema) {
    super();
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaBoolean {
    return <jsonSchema.JsonSchemaBoolean>{
      type: 'boolean',
      ...super.toJsonSchema(ctx),
    };
  }

  public validateSchema(): void {
    validateTType(this.getSchema(), 'bool');
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    const err = ctx.err(ValidationError.BOOL, path);
    ctx.js(/* js */ `if(typeof ${r} !== "boolean") return ${err};`);
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    ctx.js(/* js */ `s += ${value.use()} ? 'true' : 'false';`);
  }

  protected codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    ctx.js(/* js */ `encoder.writeBoolean(${value.use()});`);
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
    ctx.inc(MaxEncodingOverhead.Boolean);
  }

  public random(): boolean {
    return RandomJson.genBoolean();
  }

  public toTypeScriptAst(): ts.TsBooleanKeyword {
    return {node: 'BooleanKeyword'};
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system) {
    return (value ? 'true' : 'false') as json_string<boolean>;
  }

  public toJtdForm(): jtd.JtdTypeForm {
    const form: jtd.JtdTypeForm = {type: 'boolean'};
    return form;
  }
}
