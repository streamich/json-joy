import * as schema from '../../schema';
import {validateTType} from '../../schema/validate';
import {ValidatorCodegenContext} from '../../codegen/validator/ValidatorCodegenContext';
import {ValidationPath} from '../../codegen/validator/types';
import {ValidationError} from '../../constants';
import {JsonTextEncoderCodegenContext} from '../../codegen/json/JsonTextEncoderCodegenContext';
import {CompiledBinaryEncoder} from '../../codegen/types';
import {CborEncoderCodegenContext} from '../../codegen/binary/CborEncoderCodegenContext';
import {JsonEncoderCodegenContext} from '../../codegen/binary/JsonEncoderCodegenContext';
import {BinaryEncoderCodegenContext} from '../../codegen/binary/BinaryEncoderCodegenContext';
import {JsExpression} from '@jsonjoy.com/json-pack/lib/util/codegen/util/JsExpression';
import {MessagePackEncoderCodegenContext} from '../../codegen/binary/MessagePackEncoderCodegenContext';
import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import {BinaryJsonEncoder} from '@jsonjoy.com/json-pack/lib/types';
import {CapacityEstimatorCodegenContext} from '../../codegen/capacity/CapacityEstimatorCodegenContext';
import {AbstractType} from './AbstractType';
import type * as jsonSchema from '../../../json-schema';
import type {SchemaOf, Type} from '../types';
import type {TypeSystem} from '../../system/TypeSystem';
import type {json_string} from '../../../json-brand';
import type * as ts from '../../typescript/types';
import type {TypeExportContext} from '../../system/TypeExportContext';

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
