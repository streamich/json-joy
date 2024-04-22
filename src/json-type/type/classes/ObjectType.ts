import * as schema from '../../schema';
import {RandomJson} from '../../../json-random';
import {printTree} from '../../../util/print/printTree';
import {asString} from '@jsonjoy.com/util/lib/strings/asString';
import {validateTType, validateWithValidator} from '../../schema/validate';
import {ValidatorCodegenContext} from '../../codegen/validator/ValidatorCodegenContext';
import {ValidationPath} from '../../codegen/validator/types';
import {ValidationError} from '../../constants';
import {normalizeAccessor} from '@jsonjoy.com/util/lib/codegen/util/normalizeAccessor';
import {canSkipObjectKeyUndefinedCheck} from '../../codegen/validator/util';
import {JsonTextEncoderCodegenContext} from '../../codegen/json/JsonTextEncoderCodegenContext';
import {CborEncoderCodegenContext} from '../../codegen/binary/CborEncoderCodegenContext';
import {JsonEncoderCodegenContext} from '../../codegen/binary/JsonEncoderCodegenContext';
import {JsExpression} from '@jsonjoy.com/util/lib/codegen/util/JsExpression';
import {MessagePackEncoderCodegenContext} from '../../codegen/binary/MessagePackEncoderCodegenContext';
import {CapacityEstimatorCodegenContext} from '../../codegen/capacity/CapacityEstimatorCodegenContext';
import {MaxEncodingOverhead, maxEncodingCapacity} from '../../../json-size';
import {AbstractType} from './AbstractType';
import type * as jsonSchema from '../../../json-schema';
import type {SchemaOf, SchemaOfObjectFields, Type} from '../types';
import type {TypeSystem} from '../../system/TypeSystem';
import type {json_string} from '@jsonjoy.com/util/lib/json-brand';
import type * as ts from '../../typescript/types';
import type {TypeExportContext} from '../../system/TypeExportContext';

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

export class ObjectFieldType<K extends string, V extends Type> extends AbstractType<
  schema.ObjectFieldSchema<K, SchemaOf<V>>
> {
  protected schema: schema.ObjectFieldSchema<K, any>;

  constructor(
    public readonly key: K,
    public readonly value: V,
  ) {
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

  constructor(
    public readonly key: K,
    public readonly value: V,
  ) {
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

  public extend<F2 extends ObjectFieldType<any, any>[]>(o: ObjectType<F2>): ObjectType<[...F, ...F2]> {
    return new ObjectType([...this.fields, ...o.fields]);
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
        // TODO: move this line into if-statement
        ctx.js(/* js */ `var ${rv} = ${r}${accessor};`);
        if (!canSkipObjectKeyUndefinedCheck((field.value as AbstractType<any>).getSchema().__t)) {
          const err = ctx.err(ValidationError.KEY, [...path, field.key]);
          const kind = field.value.getSchema().kind;
          const cannotBeUndefined = kind === 'bool' || kind === 'num' || kind === 'str' || kind === 'bin' || kind === 'arr' || kind === 'obj' || kind === 'tup' || kind === 'map' || kind === 'fn' || kind === 'fn$';
          if (cannotBeUndefined) {
            ctx.js(/* js */ `if (${rv} === undefined) return ${err};`);
          } else {
            // TODO: shorten "Object.hasOwnProperty.call"
            ctx.js(`if (!Object.hasOwnProperty.call(${r}, ${JSON.stringify(field.key)})) return ${err};`);
          }
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
