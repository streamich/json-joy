import type {TType} from '../json-type/types';
import {BooleanValidator, createBoolValidator, ObjectValidator, createObjValidator} from '../json-type-validator';
import {dynamicFunction} from '../util/codegen/dynamicFunction';
import {
  JsonEncoderFn,
  JsonSerializerCodegen,
  EncoderFn,
  PartialEncoderFn,
  MsgPackSerializerCodegen,
} from '../json-type-serializer';
import {encoderFull} from '../json-pack/util';

export type Types = {[ref: string]: TType};

const literalTypes: string[] = ['bin', 'bool', 'nil', 'num', 'str'];

export interface JsonTypeSystemOptions<T extends Types> {
  types: T;
}

export class JsonTypeSystem<T extends Types> {
  public constructor(protected readonly options: JsonTypeSystemOptions<T>) {}

  public readonly ref = (ref: keyof T): TType => {
    const type = this.options.types[ref];
    if (!type) throw new Error(`Type [ref = ${ref}] not found.`);
    return type;
  };

  public hasType(ref: string) {
    return Object.prototype.hasOwnProperty.call(this.options.types, ref);
  }

  protected readonly fastValidatorCache: {[ref: string]: BooleanValidator} = {};
  protected readonly fastValidatorUsage: {[ref: string]: number} = {};

  public getFastValidator(ref: string) {
    const type = this.ref(ref);
    const cachedFastValidator = this.fastValidatorCache[ref];
    if (cachedFastValidator) {
      this.fastValidatorUsage[ref] = (this.fastValidatorUsage[ref] || 0) + 1;
      return cachedFastValidator;
    }
    const [validator, setValidator] = dynamicFunction<BooleanValidator>(() => {
      throw new Error(`Type [ref = ${ref}] not implemented.`);
    });
    this.fastValidatorCache[ref] = validator;
    const realValidator = createBoolValidator(type, {
      customValidators: [],
      ref: (id: string) => this.getFastValidator(id),
      skipObjectExtraFieldsCheck: true,
      unsafeMode: true,
    });
    if (this.fastValidatorUsage[ref]) setValidator(realValidator);
    this.fastValidatorCache[ref] = realValidator;
    return realValidator;
  }

  protected readonly fullValidatorCache: {[ref: string]: ObjectValidator} = {};

  public getFullValidator(ref: string) {
    const type = this.ref(ref);
    const cachedFastValidator = this.fastValidatorCache[ref];
    if (cachedFastValidator) return cachedFastValidator;
    const [validator, setValidator] = dynamicFunction<ObjectValidator>(() => {
      throw new Error(`Type [ref = ${ref}] not implemented.`);
    });
    this.fullValidatorCache[ref] = validator;
    setValidator(
      createObjValidator(type, {
        customValidators: [],
        ref: (id: string) => this.getFastValidator(id),
      }),
    );
    return validator;
  }

  protected readonly jsonSerializerCache: {[ref: string]: JsonEncoderFn} = {};
  protected readonly jsonSerializerUsage: {[ref: string]: number} = {};

  public getJsonSerializer(ref: string): JsonEncoderFn {
    const type = this.ref(ref);
    const jsonSerializerCached = this.jsonSerializerCache[ref];
    if (jsonSerializerCached) {
      this.jsonSerializerUsage[ref] = (this.jsonSerializerUsage[ref] || 0) + 1;
      return jsonSerializerCached;
    }
    const codegen = new JsonSerializerCodegen({
      type,
      ref: (id: string) => {
        const type = this.ref(id);
        const isLiteralType = literalTypes.indexOf(type.__t) !== -1;
        return isLiteralType ? type : this.getJsonSerializer(id);
      },
    });
    const [serializer, setSerializer] = dynamicFunction<JsonEncoderFn>(() => {
      throw new Error(`Type [ref = ${ref}] JSON serializer not implemented.`);
    });
    this.jsonSerializerCache[ref] = serializer;
    const realSerializer = codegen.run().compile();
    if (this.jsonSerializerUsage[ref]) setSerializer(realSerializer);
    this.jsonSerializerCache[ref] = realSerializer;
    return realSerializer;
  }

  protected readonly msgPackPartialEncoderCache: {[ref: string]: PartialEncoderFn} = {};
  protected readonly msgPackPartialEncoderUsage: {[ref: string]: number} = {};

  protected getMsgPackPartialEncoder(ref: string): PartialEncoderFn {
    const type = this.ref(ref);
    const msgPackPartialEncoderCached = this.msgPackPartialEncoderCache[ref];
    if (msgPackPartialEncoderCached) {
      this.msgPackPartialEncoderUsage[ref] = (this.msgPackPartialEncoderUsage[ref] || 0) + 1;
      return msgPackPartialEncoderCached;
    }
    const codegen = new MsgPackSerializerCodegen({
      type,
      encoder: encoderFull,
      ref: (id: string) => {
        const type = this.ref(id);
        const isLiteralType = literalTypes.indexOf(type.__t) !== -1;
        return isLiteralType ? type : this.getMsgPackPartialEncoder(id);
      },
    });
    const [partialEncoder, setPartialEncoder] = dynamicFunction<PartialEncoderFn>(() => {
      throw new Error(`Type [ref = ${ref}] MessagePack partial encoder not implemented.`);
    });
    this.msgPackPartialEncoderCache[ref] = partialEncoder;
    const realPartialEncoder = codegen.run().compilePartial();
    if (this.msgPackPartialEncoderUsage[ref]) setPartialEncoder(realPartialEncoder);
    this.msgPackPartialEncoderCache[ref] = realPartialEncoder;
    return realPartialEncoder;
  }

  protected readonly msgPackEncoderCache: {[ref: string]: EncoderFn} = {};

  public getMsgPackEncoder(ref: string): EncoderFn {
    const type = this.ref(ref);
    const msgPackSerializerCached = this.msgPackEncoderCache[ref];
    if (msgPackSerializerCached) return msgPackSerializerCached;
    const codegen = new MsgPackSerializerCodegen({
      type,
      encoder: encoderFull,
      ref: (id: string) => {
        const type = this.ref(id);
        const isLiteralType = literalTypes.indexOf(type.__t) !== -1;
        return isLiteralType ? type : this.getMsgPackPartialEncoder(id);
      },
    });
    return (this.msgPackEncoderCache[ref] = codegen.run().compile());
  }
}
