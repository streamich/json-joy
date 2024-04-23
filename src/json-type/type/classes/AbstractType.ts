import * as schema from '../../schema';
import {RandomJson} from '../../../json-random';
import {Printable} from '../../../util/print/types';
import {stringify} from '../../../json-text/stringify';
import {ValidatorCodegenContext, ValidatorCodegenContextOptions} from '../../codegen/validator/ValidatorCodegenContext';
import {JsonTypeValidator, ValidationPath} from '../../codegen/validator/types';
import {
  JsonTextEncoderCodegenContext,
  JsonTextEncoderCodegenContextOptions,
  JsonEncoderFn,
} from '../../codegen/json/JsonTextEncoderCodegenContext';
import {CompiledBinaryEncoder} from '../../codegen/types';
import {
  CborEncoderCodegenContext,
  CborEncoderCodegenContextOptions,
} from '../../codegen/binary/CborEncoderCodegenContext';
import {
  JsonEncoderCodegenContext,
  JsonEncoderCodegenContextOptions,
} from '../../codegen/binary/JsonEncoderCodegenContext';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {JsExpression} from '@jsonjoy.com/util/lib/codegen/util/JsExpression';
import {
  MessagePackEncoderCodegenContext,
  MessagePackEncoderCodegenContextOptions,
} from '../../codegen/binary/MessagePackEncoderCodegenContext';
import {MsgPackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';
import {lazy} from '@jsonjoy.com/util/lib/lazyFunction';
import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {
  CapacityEstimatorCodegenContext,
  CapacityEstimatorCodegenContextOptions,
  CompiledCapacityEstimator,
} from '../../codegen/capacity/CapacityEstimatorCodegenContext';
import {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type * as jsonSchema from '../../../json-schema';
import type {BaseType} from '../types';
import type {TypeSystem} from '../../system/TypeSystem';
import type {json_string} from '@jsonjoy.com/util/lib/json-brand';
import type * as ts from '../../typescript/types';
import type {TypeExportContext} from '../../system/TypeExportContext';
import type {Validators} from './types';
import type * as jtd from '../../jtd/types';

export abstract class AbstractType<S extends schema.Schema> implements BaseType<S>, Printable {
  /** Default type system to use, if any. */
  public system?: TypeSystem;

  protected validators: Validators = {};
  protected encoders = new Map<EncodingFormat, CompiledBinaryEncoder>();

  /** @todo Retype this to `Schema`. */
  protected abstract schema: S;

  public getSystem(): TypeSystem {
    const system = this.system;
    if (!system) throw new Error('NO_SYSTEM');
    return system;
  }

  public getTypeName(): S['kind'] {
    return this.schema.kind;
  }

  /**
   * @todo Add ability to export the whole schema, including aliases.
   */
  public getSchema(): S {
    return this.schema;
  }

  public getValidatorNames(): string[] {
    const {validator} = this.schema as schema.WithValidator;
    if (!validator) return [];
    return Array.isArray(validator) ? validator : [validator];
  }

  public toJsonSchema(ctx?: TypeExportContext): jsonSchema.JsonSchemaNode {
    const schema = this.getSchema();
    const jsonSchema = <jsonSchema.JsonSchemaGenericKeywords>{};
    if (schema.title) jsonSchema.title = schema.title;
    if (schema.description) jsonSchema.description = schema.description;
    if (schema.examples) jsonSchema.examples = schema.examples.map((example: schema.TExample) => example.value);
    return jsonSchema;
  }

  public options(options: schema.Optional<S>): this {
    Object.assign(this.schema, options);
    return this;
  }

  public getOptions(): schema.Optional<S> {
    const {kind, ...options} = this.schema;
    return options as any;
  }

  /** Validates own schema, throws on errors. */
  public abstract validateSchema(): void;

  public validate(value: unknown): void {
    const validator = this.validator('string');
    const err = validator(value);
    if (err) throw new Error(JSON.parse(err as string)[0]);
  }

  public compileValidator(options: Partial<Omit<ValidatorCodegenContextOptions, 'type'>>): JsonTypeValidator {
    const ctx = new ValidatorCodegenContext({
      system: this.system,
      errors: 'object',
      ...options,
      type: this as any,
    });
    this.codegenValidator(ctx, [], ctx.codegen.options.args[0]);
    return ctx.compile();
  }

  private __compileValidator(kind: keyof Validators): JsonTypeValidator {
    return (this.validators[kind] = this.compileValidator({
      errors: kind,
      system: this.system,
      skipObjectExtraFieldsCheck: kind === 'boolean',
      unsafeMode: kind === 'boolean',
    }));
  }

  public validator(kind: keyof Validators): JsonTypeValidator {
    return this.validators[kind] || lazy(() => this.__compileValidator(kind));
  }

  protected compileJsonTextEncoder(options: Omit<JsonTextEncoderCodegenContextOptions, 'type'>): JsonEncoderFn {
    const ctx = new JsonTextEncoderCodegenContext({
      ...options,
      system: this.system,
      type: this as any,
    });
    const r = ctx.codegen.options.args[0];
    const value = new JsExpression(() => r);
    this.codegenJsonTextEncoder(ctx, value);
    return ctx.compile();
  }

  public codegenJsonTextEncoder(ctx: JsonTextEncoderCodegenContext, value: JsExpression): void {
    throw new Error(`${this.constructor.name}.codegenJsonTextEncoder() not implemented`);
  }

  private __jsonEncoder: JsonEncoderFn | undefined;
  public jsonTextEncoder(): JsonEncoderFn {
    return (
      this.__jsonEncoder || (this.__jsonEncoder = lazy(() => (this.__jsonEncoder = this.compileJsonTextEncoder({}))))
    );
  }

  public compileEncoder(format: EncodingFormat, name?: string): CompiledBinaryEncoder {
    switch (format) {
      case EncodingFormat.Cbor: {
        const encoder = this.compileCborEncoder({name});
        this.encoders.set(EncodingFormat.Cbor, encoder);
        return encoder;
      }
      case EncodingFormat.MsgPack: {
        const encoder = this.compileMessagePackEncoder({name});
        this.encoders.set(EncodingFormat.MsgPack, encoder);
        return encoder;
      }
      case EncodingFormat.Json: {
        const encoder = this.compileJsonEncoder({name});
        this.encoders.set(EncodingFormat.Json, encoder);
        return encoder;
      }
      default:
        throw new Error(`Unsupported encoding format: ${format}`);
    }
  }

  public encoder(kind: EncodingFormat): CompiledBinaryEncoder {
    const encoders = this.encoders;
    const cachedEncoder = encoders.get(kind);
    if (cachedEncoder) return cachedEncoder;
    const temporaryWrappedEncoder = lazy(() => this.compileEncoder(kind));
    encoders.set(kind, temporaryWrappedEncoder);
    return temporaryWrappedEncoder;
  }

  public encode(codec: JsonValueCodec, value: unknown): Uint8Array {
    const encoder = this.encoder(codec.format);
    const writer = codec.encoder.writer;
    writer.reset();
    encoder(value, codec.encoder);
    return writer.flush();
  }

  public codegenValidator(ctx: ValidatorCodegenContext, path: ValidationPath, r: string): void {
    throw new Error(`${this.constructor.name}.codegenValidator() not implemented`);
  }

  public compileCborEncoder(
    options: Omit<CborEncoderCodegenContextOptions, 'type' | 'encoder'>,
  ): CompiledBinaryEncoder {
    const ctx = new CborEncoderCodegenContext({
      system: this.system,
      encoder: new CborEncoder(),
      ...options,
      type: this as any,
    });
    const r = ctx.codegen.options.args[0];
    const value = new JsExpression(() => r);
    this.codegenCborEncoder(ctx, value);
    return ctx.compile();
  }

  public codegenCborEncoder(ctx: CborEncoderCodegenContext, value: JsExpression): void {
    throw new Error(`${this.constructor.name}.codegenCborEncoder() not implemented`);
  }

  public compileMessagePackEncoder(
    options: Omit<MessagePackEncoderCodegenContextOptions, 'type' | 'encoder'>,
  ): CompiledBinaryEncoder {
    const ctx = new MessagePackEncoderCodegenContext({
      system: this.system,
      encoder: new MsgPackEncoder(),
      ...options,
      type: this as any,
    });
    const r = ctx.codegen.options.args[0];
    const value = new JsExpression(() => r);
    this.codegenMessagePackEncoder(ctx, value);
    return ctx.compile();
  }

  public codegenMessagePackEncoder(ctx: MessagePackEncoderCodegenContext, value: JsExpression): void {
    throw new Error(`${this.constructor.name}.codegenMessagePackEncoder() not implemented`);
  }

  public compileJsonEncoder(
    options: Omit<JsonEncoderCodegenContextOptions, 'type' | 'encoder'>,
  ): CompiledBinaryEncoder {
    const writer = new Writer();
    const ctx = new JsonEncoderCodegenContext({
      system: this.system,
      encoder: new JsonEncoder(writer),
      ...options,
      type: this as any,
    });
    const r = ctx.codegen.options.args[0];
    const value = new JsExpression(() => r);
    this.codegenJsonEncoder(ctx, value);
    return ctx.compile();
  }

  public codegenJsonEncoder(ctx: JsonEncoderCodegenContext, value: JsExpression): void {
    throw new Error(`${this.constructor.name}.codegenJsonEncoder() not implemented`);
  }

  public compileCapacityEstimator(
    options: Omit<CapacityEstimatorCodegenContextOptions, 'type'>,
  ): CompiledCapacityEstimator {
    const ctx = new CapacityEstimatorCodegenContext({
      system: this.system,
      ...options,
      type: this as any,
    });
    const r = ctx.codegen.options.args[0];
    const value = new JsExpression(() => r);
    this.codegenCapacityEstimator(ctx, value);
    return ctx.compile();
  }

  public codegenCapacityEstimator(ctx: CapacityEstimatorCodegenContext, value: JsExpression): void {
    throw new Error(`${this.constructor.name}.codegenCapacityEstimator() not implemented`);
  }

  private __capacityEstimator: CompiledCapacityEstimator | undefined;
  public capacityEstimator(): CompiledCapacityEstimator {
    return (
      this.__capacityEstimator ||
      (this.__capacityEstimator = lazy(() => (this.__capacityEstimator = this.compileCapacityEstimator({}))))
    );
  }

  public random(): unknown {
    return RandomJson.generate({nodeCount: 5});
  }

  public toTypeScriptAst(): ts.TsNode {
    const node: ts.TsUnknownKeyword = {node: 'UnknownKeyword'};
    return node;
  }

  public toJson(value: unknown, system: TypeSystem | undefined = this.system): json_string<unknown> {
    return JSON.stringify(value) as json_string<schema.TypeOf<S>>;
  }

  protected toStringTitle(): string {
    return this.getTypeName();
  }

  protected toStringOptions(): string {
    const options = this.getOptions();
    if (Object.keys(options).length === 0) return '';
    return stringify(options);
  }

  public toString(tab: string = ''): string {
    const options = this.toStringOptions();
    return this.toStringTitle() + (options ? ` ${options}` : '');
  }

  public toJtdForm(): jtd.JtdForm {
    const form: jtd.JtdEmptyForm = {nullable: false};
    return form;
  }
}
