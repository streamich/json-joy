import * as schema from '../../schema';
import {RandomJson} from '../../../json-random';
import {stringifyBinary} from '../../../json-binary';
import {printTree} from '../../../util/print/printTree';
import {validateTType} from '../../schema/validate';
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
import type {SchemaOf, Type} from '../types';
import type {TypeSystem} from '../../system/TypeSystem';
import type {json_string} from '../../../json-brand';
import type * as ts from '../../typescript/types';
import type {TypeExportContext} from '../../system/TypeExportContext';

export class BinaryType<T extends Type> extends AbstractType<schema.BinarySchema> {
  protected schema: schema.BinarySchema;

  constructor(
    protected type: T,
    options?: schema.Optional<schema.BinarySchema>,
  ) {
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
