import * as schema from '../../schema';
import {RandomJson} from '../../../json-random';
import {validateTType} from '../../schema/validate';
import {ValidatorCodegenContext} from '../../codegen/validator/ValidatorCodegenContext';
import {ValidationPath} from '../../codegen/validator/types';
import {JsonTextEncoderCodegenContext} from '../../codegen/json/JsonTextEncoderCodegenContext';
import {CborEncoderCodegenContext} from '../../codegen/binary/CborEncoderCodegenContext';
import {JsonEncoderCodegenContext} from '../../codegen/binary/JsonEncoderCodegenContext';
import {BinaryEncoderCodegenContext} from '../../codegen/binary/BinaryEncoderCodegenContext';
import {JsExpression} from '@jsonjoy.com/util/lib/codegen/util/JsExpression';
import {MessagePackEncoderCodegenContext} from '../../codegen/binary/MessagePackEncoderCodegenContext';
import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import {BinaryJsonEncoder} from '@jsonjoy.com/json-pack/lib/types';
import {CapacityEstimatorCodegenContext} from '../../codegen/capacity/CapacityEstimatorCodegenContext';
import {AbstractType} from './AbstractType';
import type * as jsonSchema from '../../../json-schema';
import type * as ts from '../../typescript/types';
import type {TypeExportContext} from '../../system/TypeExportContext';
import type * as jtd from '../../jtd/types';

export class AnyType extends AbstractType<schema.AnySchema> {
  constructor(protected schema: schema.AnySchema) {
    super();
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaAny {
    return <jsonSchema.JsonSchemaAny>{
      type: ['string', 'number', 'boolean', 'null', 'array', 'object'],
      ...super.toJsonSchema(ctx),
    };
  }

  public validateSchema(): void {
    validateTType(this.getSchema(), 'any');
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    ctx.emitCustomValidators(this, path, r);
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    ctx.js(/* js */ `s += stringify(${value.use()});`);
  }

  private codegenBinaryEncoder(ctx: BinaryEncoderCodegenContext<BinaryJsonEncoder>, value: JsExpression): void {
    ctx.codegen.link('Value');
    const r = ctx.codegen.var(value.use());
    ctx.codegen.if(
      `${r} instanceof Value`,
      () => {
        ctx.codegen.if(
          `${r}.type`,
          () => {
            const type =
              ctx instanceof CborEncoderCodegenContext
                ? EncodingFormat.Cbor
                : ctx instanceof MessagePackEncoderCodegenContext
                  ? EncodingFormat.MsgPack
                  : EncodingFormat.Json;
            ctx.js(`${r}.type.encoder(${type})(${r}.data, encoder);`);
          },
          () => {
            ctx.js(/* js */ `encoder.writeAny(${r}.data);`);
          },
        );
      },
      () => {
        ctx.js(/* js */ `encoder.writeAny(${r});`);
      },
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
    codegen.link('Value');
    const r = codegen.var(value.use());
    codegen.if(
      `${r} instanceof Value`,
      () => {
        codegen.if(
          `${r}.type`,
          () => {
            ctx.codegen.js(`size += ${r}.type.capacityEstimator()(${r}.data);`);
          },
          () => {
            ctx.codegen.js(`size += maxEncodingCapacity(${r}.data);`);
          },
        );
      },
      () => {
        ctx.codegen.js(`size += maxEncodingCapacity(${r});`);
      },
    );
  }

  public random(): unknown {
    return RandomJson.generate({nodeCount: 5});
  }

  public toTypeScriptAst(): ts.TsType {
    return {node: 'AnyKeyword'};
  }

  public toJtdForm(): jtd.JtdEmptyForm {
    const form: jtd.JtdEmptyForm = {nullable: true};
    return form;
  }
}
